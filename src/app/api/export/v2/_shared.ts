import { NextResponse } from "next/server";
import { ExportCenterService, type ExportCenterFilterInput } from "@/services/ExportCenterService";

export const exportCenterService = new ExportCenterService();

export function filtersFromUrl(url: string): ExportCenterFilterInput {
  const { searchParams } = new URL(url);
  return {
    format: searchParams.get("format") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    shopName: searchParams.get("shopName") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    hasAffiliateUrl: searchParams.get("hasAffiliateUrl") ?? undefined,
    includeArchived: searchParams.get("includeArchived") ?? undefined,
  };
}

export function responseFromExport(result: { body: string; contentType: string; filename: string }): NextResponse {
  return new NextResponse(result.body, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
    },
  });
}
