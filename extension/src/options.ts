import { getSettings, saveSettings } from "./api-client";

const endpointInput = document.getElementById("endpoint") as HTMLInputElement;
const tokenInput = document.getElementById("token") as HTMLInputElement;
const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;

async function init(): Promise<void> {
  const settings = await getSettings();
  endpointInput.value = settings.apiEndpoint;
  tokenInput.value = settings.apiToken;
}

saveBtn.addEventListener("click", async () => {
  await saveSettings({
    apiEndpoint: endpointInput.value.trim(),
    apiToken: tokenInput.value.trim()
  });
  statusEl.textContent = "Saved";
});

void init();
