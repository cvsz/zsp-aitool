import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/feedback/route";

vi.mock("@/lib/auth", () => ({ getSessionFromRequest: vi.fn().mockReturnValue({ userId: "u1", email: "user@example.com" }) }));
vi.mock("@/services/FeedbackService", () => ({ feedbackService: { submit: vi.fn().mockResolvedValue({ id: "fb1", createdAt: new Date("2026-05-19T00:00:00Z") }) } }));

describe("feedback api", () => {
  it("rejects invalid payload", async () => {
    const response = await POST(new Request("http://localhost/api/feedback", { method: "POST", body: JSON.stringify({ rating: 0, category: "x", message: "short" }) }) as never);
    expect(response.status).toBe(400);
  });

  it("accepts safe feedback payload", async () => {
    const response = await POST(new Request("http://localhost/api/feedback", { method: "POST", body: JSON.stringify({ rating: 5, category: "onboarding", message: "ข้อความแนะนำการใช้งานแบบปลอดภัย" }) }) as never);
    expect(response.status).toBe(200);
  });
});
