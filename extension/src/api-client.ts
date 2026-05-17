import type { ExtensionSettings, ProductDraft, SocialPlatform } from "./types";

const DEFAULT_SETTINGS: ExtensionSettings = {
  apiEndpoint: "",
  apiToken: ""
};

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return {
    apiEndpoint: String(stored.apiEndpoint || ""),
    apiToken: String(stored.apiToken || "")
  };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.sync.set(settings);
}

export async function sendProduct(settings: ExtensionSettings, payload: ProductDraft): Promise<void> {
  if (!settings.apiEndpoint || !settings.apiToken) {
    throw new Error("Please configure API endpoint and token in Settings.");
  }

  const response = await fetch(settings.apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error (${response.status}): ${body}`);
  }
}

export function quickPost(platform: SocialPlatform, draft: ProductDraft): string {
  const base = `${draft.title} | ${draft.price}`;
  const link = draft.pageUrl;
  const disclosure = "โพสต์นี้มีลิงก์ Affiliate";

  switch (platform) {
    case "facebook":
      return `แนะนำสินค้า: ${base}\n${draft.description || "รายละเอียดดูในลิงก์"}\n${link}\n${disclosure}`;
    case "instagram":
      return `${base}\n${draft.description || "น่าสนใจมาก"}\n${disclosure}\n#ช้อปปิ้ง #Affiliate #Shopee\n${link}`;
    case "x":
      return `${base} ${draft.soldCount ? `ขายแล้ว ${draft.soldCount}` : ""} ${link} #Affiliate`;
    case "threads":
      return `เจอของน่าสนใจ! ${base}\n${draft.description || "ลองดูรายละเอียดเพิ่มได้"}\n${link}\n${disclosure}`;
  }
}
