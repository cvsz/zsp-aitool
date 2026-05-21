import { aiContentQueueService } from "@/services/AIContentQueueService";

async function runOnce() {
  const jobs = await aiContentQueueService.claimPending(5);
  for (const job of jobs) {
    await aiContentQueueService.processJob(job.id);
  }
  console.log(`processed_jobs=${jobs.length}`);
}

async function main() {
  const once = process.argv.includes("--once");
  if (once) {
    await runOnce();
    return;
  }
  for (;;) {
    await runOnce();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main().catch((error) => {
  console.error("ai_content_worker_failed", error instanceof Error ? error.message : "unknown_error");
  process.exit(1);
});
