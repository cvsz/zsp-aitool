import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth-middleware";

export const GET = withAuth(async () => {
  return NextResponse.json({ ok: true, data: { feature: "hyperframes", supportedPlatforms: ["facebook", "instagram", "threads", "x", "blog"], supportedAspectRatios: ["16:9", "9:16", "1:1"] } });
});
