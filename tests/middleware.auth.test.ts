import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";

describe("withAuth", () => {
  it("denies unauthorized access", async () => {
    const handler = withAuth(async () => new Response("ok") as never);
    const req = new NextRequest("http://localhost/api/products");
    const res = await handler(req);
    expect(res.status).toBe(401);
  });
});
