import { collectBackendMonitorData, redactSensitiveText } from "@/services/BackendMonitorService";

async function main(): Promise<void> {
  const data = await collectBackendMonitorData();
  const output = {
    app: data.app,
    worker: data.worker,
    http: { local3001Reachable: data.app.reachable },
    db: data.db,
    hyperframes: data.hyperframes,
    system: data.system,
    warnings: data.warnings,
  };
  console.log(redactSensitiveText(JSON.stringify(output, null, 2)));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "monitor failed";
  console.error(redactSensitiveText(`[FAIL] ${message}`));
  process.exit(1);
});
