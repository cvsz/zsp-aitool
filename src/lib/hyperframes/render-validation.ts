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
    throw error;
  }
}
