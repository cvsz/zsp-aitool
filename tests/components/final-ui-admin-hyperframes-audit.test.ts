import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

const adminPageFiles = [
  "src/app/dashboard/admin/page.tsx",
  "src/app/dashboard/admin/users/page.tsx",
  "src/app/dashboard/admin/products/page.tsx",
  "src/app/dashboard/admin/content/page.tsx",
  "src/app/dashboard/admin/renders/page.tsx",
  "src/app/dashboard/admin/system/page.tsx",
  "src/app/dashboard/admin/audit-logs/page.tsx",
  "src/app/dashboard/admin/settings/page.tsx",
];

const adminFiles = [
  ...adminPageFiles,
  "src/components/admin/AdminShell.tsx",
  "src/components/admin/AdminMetricCard.tsx",
  "src/components/admin/AdminStatusPanel.tsx",
  "src/components/admin/AdminGuardNotice.tsx",
  "src/components/admin/AdminPlaceholderTable.tsx",
  "src/lib/admin/access.ts",
  "src/app/api/admin/overview/route.ts",
  "src/services/admin-overview-service.ts",
];

const hyperframesUiFiles = [
  "src/app/dashboard/hyperframes/page.tsx",
  "src/app/dashboard/hyperframes/renders/page.tsx",
  "src/app/dashboard/hyperframes/batch/page.tsx",
  "src/app/dashboard/hyperframes/ops/page.tsx",
  "src/app/dashboard/hyperframes/ops/queue/page.tsx",
  "src/components/hyperframes/HyperFramesStatusGrid.tsx",
  "src/components/hyperframes/OperatorWarningBanner.tsx",
  "src/components/hyperframes/RenderHistoryTable.tsx",
  "src/components/hyperframes/RenderJobCard.tsx",
  "src/components/hyperframes/RenderStatusBadge.tsx",
  "src/components/hyperframes/SafeErrorText.tsx",
];

const sensitiveUserFacingTokens = [
  "outputPath",
  "/var/lib",
  "DATABASE_URL",
  "dangerouslySetInnerHTML",
];

function combined(files: string[]): string {
  return files.map((file) => readSource(file)).join("\n---FILE---\n");
}

describe("final UI admin HyperFrames audit", () => {
  it("keeps every admin page behind the shared gated shell", () => {
    for (const file of adminPageFiles) {
      const source = readSource(file);
      expect(source).toContain("AdminShell");
      expect(source).toContain("requireAdminAccess");
    }
  });

  it("keeps admin API aggregate-only and gated", () => {
    const route = readSource("src/app/api/admin/overview/route.ts");
    const service = readSource("src/services/admin-overview-service.ts");

    expect(route).toContain("withAuth");
    expect(route).toContain("isAdminPanelEnabled");
    expect(service).toContain("aggregate-only");
    expect(service).not.toContain("email");
    expect(service).not.toContain("password");
  });

  it("does not expose sensitive markers in admin UI or admin overview API code", () => {
    const source = combined(adminFiles);
    for (const token of sensitiveUserFacingTokens) {
      expect(source).not.toContain(token);
    }
  });

  it("does not expose sensitive markers in HyperFrames dashboard UI", () => {
    const source = combined(hyperframesUiFiles);
    for (const token of sensitiveUserFacingTokens) {
      expect(source).not.toContain(token);
    }
  });

  it("does not add direct systemd control commands to UI code", () => {
    const source = combined([...adminFiles, ...hyperframesUiFiles]);
    expect(source).not.toMatch(/systemctl\s+(start|stop|restart|enable|disable)/);
  });

  it("keeps render thumbnails on next image instead of raw img", () => {
    const source = readSource("src/components/hyperframes/RenderJobCard.tsx");
    expect(source).toContain("next/image");
    expect(source).not.toContain("<img");
  });

  it("keeps product cards on next image instead of raw img", () => {
    const source = readSource("src/components/products/ProductCard.tsx");
    expect(source).toContain("next/image");
    expect(source).not.toContain("<img");
  });
});
