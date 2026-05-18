import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { extname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);

export type RenderArtifactValidationOptions = {
  outputPath: string;
  minBytes: number;
  maxOutputMb: number;
  expectedDurationSeconds?: number;
  ffprobeBin?: string;
};

export async function validateRenderArtifact(options: RenderArtifactValidationOptions): Promise<void> {
  const { outputPath, minBytes, maxOutputMb, expectedDurationSeconds, ffprobeBin = "ffprobe" } = options;

  await access(outputPath);
  const fileStat = await stat(outputPath);
  if (!fileStat.isFile()) throw new Error("render artifact is not a file");

  if (fileStat.size <= minBytes) throw new Error(`render artifact too small: ${fileStat.size} <= ${minBytes}`);

  const maxBytes = maxOutputMb * 1024 * 1024;
  if (fileStat.size > maxBytes) throw new Error(`output exceeds max size: ${fileStat.size} > ${maxBytes}`);

  const ext = extname(outputPath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) throw new Error(`render artifact format not allowed: ${ext || "unknown"}`);

  await assertReadableStream(outputPath);

  await assertSaneDuration({ ffprobeBin, outputPath, expectedDurationSeconds });
}

async function assertReadableStream(outputPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(outputPath, { start: 0, end: 1023 });
    let readAny = false;
    stream.once("data", () => {
      readAny = true;
    });
    stream.once("error", reject);
    stream.once("close", () => {
      if (!readAny) return reject(new Error("render artifact unreadable stream"));
      resolve();
    });
  });
}

async function assertSaneDuration(input: { ffprobeBin: string; outputPath: string; expectedDurationSeconds?: number }): Promise<void> {
  const { ffprobeBin, outputPath, expectedDurationSeconds } = input;
  try {
    const { stdout } = await execFileAsync(ffprobeBin, [
      "-v",
      "error",
      "-show_entries",
      "format=duration,format_name",
      "-of",
      "default=noprint_wrappers=1:nokey=0",
      outputPath,
    ]);

    const durationMatch = stdout.match(/duration=([0-9.]+)/i);
    const formatMatch = stdout.match(/format_name=([^\n\r]+)/i);
    const duration = Number.parseFloat(durationMatch?.[1] ?? "");
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("render artifact duration invalid");
    }

    const formatName = (formatMatch?.[1] ?? "").toLowerCase();
    if (formatName && !formatName.includes("mp4") && !formatName.includes("webm") && !formatName.includes("mov")) {
      throw new Error(`render artifact format not allowed: ${formatName}`);
    }

    if (expectedDurationSeconds && duration > Math.max(expectedDurationSeconds * 3, expectedDurationSeconds + 120)) {
      throw new Error(`render artifact duration too long: ${duration}s`);
    }
  } catch (error) {
    if (error instanceof Error && /spawn .*ffprobe/i.test(error.message)) {
      return;
    }
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

export type RenderArtifactValidationOptions = {
  minBytes: number;
  maxOutputMb: number;
  maxDurationSeconds: number;
  allowedExtensions?: readonly string[];
  ffprobeBin?: string;
  readProbeBytes?: number;
  probeDuration?: boolean;
};

const defaultAllowed = [".mp4", ".webm", ".mov"] as const;

export async function validateRenderArtifact(outputPath: string, options: RenderArtifactValidationOptions): Promise<void> {
  const allowedExtensions = new Set((options.allowedExtensions ?? defaultAllowed).map((ext) => ext.toLowerCase()));
  const ext = path.extname(outputPath).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    throw new Error(`artifact format not allowed: ${ext || "unknown"}`);
  }

  await access(outputPath);
  const artifactStat = await stat(outputPath);
  if (!artifactStat.isFile()) {
    throw new Error("artifact is not a file");
  }
  if (artifactStat.size < options.minBytes) {
    throw new Error(`artifact too small: ${artifactStat.size} bytes`);
  }

  const maxBytes = options.maxOutputMb * 1024 * 1024;
  if (artifactStat.size > maxBytes) {
    throw new Error(`output exceeds max size: ${artifactStat.size} > ${maxBytes}`);
  }

  await ensureReadable(outputPath, options.readProbeBytes ?? 4096);

  if (options.probeDuration !== false) {
    await validateDurationWithFfprobe(outputPath, options.ffprobeBin ?? "ffprobe", options.maxDurationSeconds);
  }
}

async function ensureReadable(filePath: string, maxBytes: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath, { start: 0, end: Math.max(1, maxBytes) - 1 });
    let done = false;
    const finish = (error?: Error) => {
      if (done) return;
      done = true;
      stream.destroy();
      if (error) reject(error);
      else resolve();
    };

    stream.once("error", () => finish(new Error("artifact read check failed")));
    stream.once("readable", () => {
      const chunk = stream.read(1) as Buffer | null;
      if (!chunk || chunk.length === 0) return finish(new Error("artifact read check failed"));
      finish();
    });
    stream.once("end", () => finish(new Error("artifact read check failed")));
  });
}

async function validateDurationWithFfprobe(outputPath: string, ffprobeBin: string, maxDurationSeconds: number): Promise<void> {
  try {
    const { stdout } = await execFileAsync(ffprobeBin, ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", outputPath]);
    const duration = Number.parseFloat(String(stdout).trim());
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("artifact duration invalid");
    }
    const hardMax = Math.max(maxDurationSeconds + 5, maxDurationSeconds * 1.2);
    if (duration > hardMax) {
      throw new Error(`artifact duration out of range: ${duration.toFixed(2)}s`);
    }
  } catch (error) {
    if (error instanceof Error && /ENOENT/.test(error.message)) return;
    throw error;
  }
}
