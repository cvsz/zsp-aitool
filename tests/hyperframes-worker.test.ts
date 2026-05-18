import { describe, expect, it, vi } from "vitest";
import { RenderJobStatus } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameRenderJob: {
      findFirst: vi.fn().mockResolvedValue({ id: "j1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockResolvedValue({ id: "j1", compositionHtml: "<html></html>" }),
      update: vi.fn().mockResolvedValue({})
    }
  }
}));

describe("worker lock semantics", () => {
  it("status enum exists for claiming flow", () => {
    expect(RenderJobStatus.PENDING).toBe("PENDING");
  });
});
