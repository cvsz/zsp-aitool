import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as listGet } from "@/app/api/templates/route";
import { GET as itemGet } from "@/app/api/templates/[id]/route";

vi.mock("@/lib/auth", async () => ({ ...(await vi.importActual("@/lib/auth")), getSessionFromRequest: vi.fn(() => null) }));

describe("templates api auth", () => {
  it("list requires auth", async () => {
    const res = await listGet(new NextRequest("http://localhost/api/templates"));
    expect(res.status).toBe(401);
  });

  it("item requires auth", async () => {
    const res = await itemGet(new NextRequest("http://localhost/api/templates/a"), { params: Promise.resolve({ id: "a" }) });
    expect(res.status).toBe(401);
  });
});
