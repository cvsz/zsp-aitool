import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/admin/access";
import { growthAnalyticsService } from "@/services/GrowthAnalyticsService";

export default async function AdminAnalyticsPage() {
  const access = await requireAdminAccess();
  const summary = access.allowed ? await growthAnalyticsService.getAdminSummary(14) : null;

  return (
    <AdminShell title="Admin · Growth Analytics" description="ภาพรวม Activation แบบ aggregate-only และ privacy-safe" allowed={access.allowed} denialReason={access.reason}>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border p-4">ผู้ใช้ทั้งหมด: {summary?.metrics.registeredUsersCount ?? "-"}</article>
          <article className="rounded-2xl border p-4">สินค้า: {summary?.metrics.productsCreatedCount ?? "-"}</article>
          <article className="rounded-2xl border p-4">First product conversion: {summary?.metrics.firstProductSavedConversionPercent ?? "-"}%</article>
          <article className="rounded-2xl border p-4">AI generations: {summary?.metrics.aiGenerationsCount ?? "-"}</article>
          <article className="rounded-2xl border p-4">First AI conversion: {summary?.metrics.firstAiGenerationConversionPercent ?? "-"}%</article>
          <article className="rounded-2xl border p-4">Feedback submissions: {summary?.metrics.feedbackSubmissionsCount ?? "-"}</article>
          <article className="rounded-2xl border p-4">Export actions: {summary?.metrics.exportsActionsCount ?? "-"}</article>
          <article className="rounded-2xl border p-4">HyperFrames attempts: {summary?.metrics.hyperframesRenderAttemptsCount ?? "-"}</article>
          <article className="rounded-2xl border p-4">HyperFrames completed: {summary?.metrics.hyperframesRenderCompletionsCount ?? "-"}</article>
        </div>
      </div>
    </AdminShell>
  );
}
