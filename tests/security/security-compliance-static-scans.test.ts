import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const appGlobs = ["src/app/dashboard", "src/components"];

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(rel));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(rel);
  }
  return out;
}

describe("security/compliance static scans", () => {
  it("blocks UI leaks, raw img tags, and systemd control actions in app/components", () => {
    const files = appGlobs.flatMap(collectFiles);
    const forbidden = [
      "outputPath",
      "/var/lib",
      "DATABASE_URL",
      "OPENAI_API_KEY",
      "SHOPEE_PARTNER_KEY",
      "dangerouslySetInnerHTML",
      /<img(\s|>)/,
      /systemctl\s+(start|stop|restart|enable|disable)/,
    ] as const;

    for (const file of files) {
      const source = read(file);
      for (const token of forbidden) {
        if (typeof token === "string") expect(source, `${file} contains ${token}`).not.toContain(token);
        else expect(source, `${file} matches ${token}`).not.toMatch(token);
      }
    }
  });

  it("blocks prohibited marketing/compliance claims in user-facing copy sources", () => {
    const targets = ["src/app", "src/components", "src/services/ai", "SECURITY.md"];
    const banned = /guaranteed income|guarantee income|get rich quick|รวยแน่นอน/i;

    for (const target of targets) {
      const files = target.endsWith(".md") ? [target] : collectFiles(target).concat(
        fs.existsSync(path.join(root, target))
          ? fs.readdirSync(path.join(root, target)).filter((f) => f.endsWith(".md")).map((f) => path.join(target, f))
          : [],
      );
      for (const file of files) {
        const source = read(file);
        if (file === "SECURITY.md") {
          expect(source).toContain("must not invent product specifications, fake reviews");
          continue;
        }
        expect(source, `${file} contains prohibited claim text`).not.toMatch(banned);
      }
    }
  });
});
