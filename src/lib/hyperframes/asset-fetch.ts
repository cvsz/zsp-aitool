import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import dns from "node:dns/promises";
import { AppError } from "@/lib/errors";

const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain"]);
const BLOCKED_IPS = new Set(["169.254.169.254", "100.100.100.200"]);
const MIME_EXT: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

function isPrivateIp(ip: string): boolean {
  if (BLOCKED_IPS.has(ip)) return true;
  if (ip === "::1") return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:")) return true;
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]); const b = Number(m[2]);
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export type FetchDeps = {
  fetchImpl?: typeof fetch;
  lookupHost?: (hostname: string) => Promise<string[]>;
};

async function defaultLookupHost(hostname: string): Promise<string[]> {
  const res = await dns.lookup(hostname, { all: true, verbatim: true });
  return res.map((x) => x.address);
}

export async function fetchAndCacheHyperframesAsset(rawUrl: string, cacheDir: string, maxBytes: number, deps: FetchDeps = {}): Promise<string> {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new AppError("VALIDATION_ERROR", "invalid asset URL", 422); }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new AppError("VALIDATION_ERROR", "unsupported asset protocol", 422);
  if (BLOCKED_HOSTS.has(parsed.hostname.toLowerCase())) throw new AppError("VALIDATION_ERROR", "asset host blocked", 422);
  const lookupHost = deps.lookupHost ?? defaultLookupHost;
  const addresses = await lookupHost(parsed.hostname);
  if (!addresses.length || addresses.some((ip) => isPrivateIp(ip))) throw new AppError("VALIDATION_ERROR", "asset host blocked", 422);

  const fetchImpl = deps.fetchImpl ?? fetch;
  const response = await fetchImpl(parsed.toString(), { method: "GET", redirect: "error" });
  if (!response.ok) throw new AppError("VALIDATION_ERROR", "asset fetch failed", 422);
  const mime = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const validExts = MIME_EXT[mime];
  if (!validExts) throw new AppError("VALIDATION_ERROR", "unsupported asset MIME", 422);
  const pathnameExt = path.extname(parsed.pathname).toLowerCase();
  if (pathnameExt && !validExts.includes(pathnameExt)) throw new AppError("VALIDATION_ERROR", "asset extension mismatch", 422);
  const buf = new Uint8Array(await response.arrayBuffer());
  if (buf.byteLength > maxBytes) throw new AppError("VALIDATION_ERROR", "asset too large", 422);
  await mkdir(cacheDir, { recursive: true });
  const ext = pathnameExt || validExts[0];
  const file = `${createHash("sha256").update(parsed.toString()).digest("hex").slice(0, 32)}${ext}`;
  const out = path.join(cacheDir, file);
  await writeFile(out, buf);
  return out;
}
