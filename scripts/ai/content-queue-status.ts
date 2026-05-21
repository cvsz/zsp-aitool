import { prisma } from "@/lib/prisma";

async function main() {
  const grouped = await prisma.aIContentQueueJob.groupBy({ by: ["status"], _count: { _all: true } });
  console.log(JSON.stringify({ ok: true, queue: grouped }, null, 2));
}

main().catch((error) => {
  console.error("ai_content_queue_status_failed", error instanceof Error ? error.message : "unknown_error");
  process.exit(1);
});
