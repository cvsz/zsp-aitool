import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function readMany(files: string[]): string {
  return files.map((file) => read(file)).join("\n---FILE---\n");
}

const dashboardUiFiles = [
  "src/app/dashboard/page.tsx",
  "src/app/dashboard/products/page.tsx",
  "src/app/dashboard/products/new/page.tsx",
  "src/app/dashboard/products/[id]/page.tsx",
  "src/app/dashboard/generator/page.tsx",
  "src/app/dashboard/content-history/page.tsx",
  "src/app/dashboard/templates/page.tsx",
  "src/app/dashboard/ocr/page.tsx",
  "src/app/dashboard/similar/page.tsx",
  "src/app/dashboard/hyperframes/page.tsx",
  "src/app/dashboard/hyperframes/renders/page.tsx",
  "src/app/dashboard/hyperframes/batch/page.tsx",
  "src/app/dashboard/hyperframes/ops/page.tsx",
  "src/app/dashboard/hyperframes/ops/queue/page.tsx",
  "src/components/layout/Sidebar.tsx",
  "src/components/layout/MobileNav.tsx",
  "src/components/hyperframes/RenderJobCard.tsx",
  "src/components/hyperframes/RenderHistoryTable.tsx",
  "src/components/admin/AdminShell.tsx",
  "src/components/ui/AlertBanner.tsx",
  "src/components/ui/EmptyState.tsx",
  "src/components/ui/Button.tsx",
  "src/components/ui/LoadingSpinner.tsx",
  "src/components/ui/Toast.tsx",
  "src/components/ui/StatusBadge.tsx",
];

const forbiddenTokens = ["outputPath", "/var/lib", "DATABASE_URL", "dangerouslySetInnerHTML"];

describe("full ux/ui redesign static safety", () => {
  it("keeps dashboard and shared UI free from sensitive markers", () => {
    const source = readMany(dashboardUiFiles);
    for (const token of forbiddenTokens) {
      expect(source).not.toContain(token);
    }
  });

  it("does not add direct systemctl controls to UI", () => {
    const source = readMany(dashboardUiFiles);
    expect(source).not.toMatch(/systemctl\s+(start|stop|restart|enable|disable)/);
  });

  it("keeps sidebar grouped navigation sections", () => {
    const source = read("src/components/layout/Sidebar.tsx");
    expect(source).toContain('title: "Main"');
    expect(source).toContain('title: "HyperFrames"');
    expect(source).toContain('title: "Admin"');
  });

  it("keeps a dedicated mobile navigation", () => {
    const source = read("src/components/layout/MobileNav.tsx");
    expect(source).toContain("export function MobileNav");
    expect(source).toContain("aria-label");
  });

  it("keeps admin pages behind gated shell", () => {
    const source = read("src/app/dashboard/admin/page.tsx");
    expect(source).toContain("AdminShell");
    expect(source).toContain("requireAdminAccess");
  });



  it("keeps Button focus-visible ring styles", () => {
    const source = read("src/components/ui/Button.tsx");
    expect(source).toContain("focus-visible:ring-2");
    expect(source).toContain("focus-visible:ring-offset-2");
  });

  it("keeps LoadingSpinner accessible status semantics", () => {
    const source = read("src/components/ui/LoadingSpinner.tsx");
    expect(source).toContain('role="status"');
    expect(source).toContain("aria-label");
  });

  it("keeps HyperFrames render card on next/image", () => {
    const source = read("src/components/hyperframes/RenderJobCard.tsx");
    expect(source).toContain("next/image");
    expect(source).not.toContain("<img");
  });
});
