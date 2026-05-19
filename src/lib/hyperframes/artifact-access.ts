import { createReadStream } from "node:fs";
import { lstat, realpath, stat } from "node:fs/promises";
import path from "node:path";

const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".jpg", ".jpeg", ".png", ".webp"]);

export function assertArtifactInsideOutputDir(outputDir: string, artifactPath: string): void {
  const resolvedOutputDir = path.resolve(outputDir);
  const resolvedArtifactPath = path.resolve(artifactPath);
  const outputDirWithSep = resolvedOutputDir.endsWith(path.sep) ? resolvedOutputDir : `${resolvedOutputDir}${path.sep}`;
  if (resolvedArtifactPath === resolvedOutputDir || !resolvedArtifactPath.startsWith(outputDirWithSep)) throw new Error("ARTIFACT_OUTSIDE_OUTPUT_DIR");
}

export async function resolveRenderArtifactPath(outputDir: string, outputPath: string, maxOutputMb?: number): Promise<string> {
  const resolvedOutputDir = path.resolve(outputDir);
  const resolvedArtifactPath = path.resolve(outputPath);
  assertArtifactInsideOutputDir(resolvedOutputDir, resolvedArtifactPath);
  const ext = path.extname(resolvedArtifactPath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) throw new Error("ARTIFACT_INVALID_EXTENSION");

  const [realOutputDir, realArtifactPath] = await Promise.all([realpath(resolvedOutputDir), realpath(resolvedArtifactPath)]);
  assertArtifactInsideOutputDir(realOutputDir, realArtifactPath);
  const artifactLStat = await lstat(realArtifactPath);
  if (artifactLStat.isSymbolicLink()) throw new Error("ARTIFACT_SYMLINK_NOT_ALLOWED");
  const artifactStat = await stat(realArtifactPath);
  if (!artifactStat.isFile()) throw new Error("ARTIFACT_NOT_A_FILE");
  if (typeof maxOutputMb === "number" && maxOutputMb > 0 && artifactStat.size > maxOutputMb * 1024 * 1024) throw new Error("ARTIFACT_TOO_LARGE");
  return realArtifactPath;
}

export function getArtifactContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  throw new Error("ARTIFACT_INVALID_EXTENSION");
}

export function buildSafeArtifactFilename(jobId: string, ext: string): string {
  const safeId = jobId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "artifact";
  const safeExt = ext.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(safeExt)) throw new Error("ARTIFACT_INVALID_EXTENSION");
  return `hyperframes-render-${safeId}${safeExt}`;
}

export function openArtifactStream(filePath: string) {
  return createReadStream(filePath);
}
