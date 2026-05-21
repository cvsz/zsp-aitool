import { withAuth } from "@/middleware/auth-middleware";
import { filtersFromUrl, responseFromExport, exportCenterService } from "../_shared";

export const GET = withAuth(async (request) => {
  const result = await exportCenterService.exportContentHistory(request.auth.userId, filtersFromUrl(request.url));
  return responseFromExport(result);
});
