import path from "node:path";

export function sanitizeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function ensureOutputWithinDir(outputDir: string, fileName: string): string {
  const safeName = sanitizeFilePart(fileName);
  const candidate = path.resolve(outputDir, safeName);
  const root = path.resolve(outputDir) + path.sep;
  if (!candidate.startsWith(root)) {
    throw new Error("Invalid output path");
  }
  return candidate;
}
