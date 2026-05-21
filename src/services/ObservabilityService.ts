import { CsvImportJobStatus, JobStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withDbTiming } from "@/lib/observability/db-timing";
import { getHyperFramesOperatorStatus } from "@/lib/hyperframes/operator-status";

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export type ObservabilitySummary = {
  errorsLast1h: number;
  errorsLast24h: number;
  slowApiRoutes: Array<{ route: string; count: number; avgDurationMs: number }>;
  dbLatencySummary: { avgDurationMs: number; p95DurationMs: number };
  worker: { pending: number; running: number; staleRunning: number; failedLast24h: number } | null;
  imports: Record<string, number>;
  aiQueue: Record<string, number>;
};

export async function getObservabilitySummary(): Promise<ObservabilitySummary> {
  const now = Date.now();
  const from1h = new Date(now - ONE_HOUR_MS);
  const from24h = new Date(now - ONE_DAY_MS);

  const [events1h, events24h, slowApi, dbEvents, importsRaw, aiRaw, worker] = await Promise.all([
    withDbTiming("observability.events.errors.1h", () => prisma.observabilityEvent.count({ where: { level: "error", createdAt: { gte: from1h } } })),
    withDbTiming("observability.events.errors.24h", () => prisma.observabilityEvent.count({ where: { level: "error", createdAt: { gte: from24h } } })),
    withDbTiming("observability.events.slow-api", () => prisma.$queryRaw<Array<{ route: string; count: bigint; avg_duration: number }>>(Prisma.sql`
      SELECT COALESCE(metadata->>'route', 'unknown') AS route,
             COUNT(*)::bigint AS count,
             AVG(COALESCE((metadata->>'durationMs')::numeric, 0))::float8 AS avg_duration
      FROM "ObservabilityEvent"
      WHERE event = 'api.timing' AND createdAt >= ${from24h} AND COALESCE((metadata->>'durationMs')::numeric, 0) >= 1500
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 20
    `)),
    withDbTiming("observability.events.db-latency", () => prisma.observabilityEvent.findMany({ where: { source: "db", event: "db.timing", createdAt: { gte: from24h } }, select: { durationMs: true }, take: 500, orderBy: { createdAt: "desc" } })),
    withDbTiming("observability.imports", () => prisma.csvImportJob.groupBy({ by: ["status"], _count: { _all: true }, where: { deletedAt: null } })),
    withDbTiming("observability.ai-queue", () => prisma.aIContentQueueJob.groupBy({ by: ["status"], _count: { _all: true }, where: { deletedAt: null } })),
    getHyperFramesOperatorStatus().catch(() => null),
  ]);

  const dbDurations = dbEvents.map((row) => row.durationMs ?? 0).sort((a, b) => a - b);
  const p95Index = dbDurations.length > 0 ? Math.min(dbDurations.length - 1, Math.floor(dbDurations.length * 0.95)) : 0;
  const dbAvg = dbDurations.length > 0 ? dbDurations.reduce((sum, value) => sum + value, 0) / dbDurations.length : 0;

  const imports = Object.values(CsvImportJobStatus).reduce<Record<string, number>>((acc, status) => ({ ...acc, [status]: 0 }), {});
  for (const row of importsRaw) imports[row.status] = row._count._all;

  const aiQueue = Object.values(JobStatus).reduce<Record<string, number>>((acc, status) => ({ ...acc, [status]: 0 }), {});
  for (const row of aiRaw) aiQueue[row.status] = row._count._all;

  return {
    errorsLast1h: events1h,
    errorsLast24h: events24h,
    slowApiRoutes: slowApi.map((row) => ({ route: row.route, count: Number(row.count), avgDurationMs: Math.round(row.avg_duration || 0) })),
    dbLatencySummary: { avgDurationMs: Math.round(dbAvg), p95DurationMs: dbDurations[p95Index] ?? 0 },
    worker: worker ? { pending: worker.pending, running: worker.running, staleRunning: worker.staleRunning, failedLast24h: worker.failedLast24h } : null,
    imports,
    aiQueue,
  };
}

export async function getRecentObservabilityEvents(limit = 50) {
  const bounded = Math.min(Math.max(limit, 1), 100);
  return withDbTiming("observability.events.recent", () => prisma.observabilityEvent.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: bounded,
    select: { id: true, level: true, source: true, event: true, durationMs: true, status: true, metadata: true, createdAt: true },
  }));
}
