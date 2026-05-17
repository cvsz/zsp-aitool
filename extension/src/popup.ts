import { getSettings, quickPost, sendProduct } from "./api-client";
import type { ProductDraft, SocialPlatform } from "./types";

const collectBtn = document.getElementById("collectBtn") as HTMLButtonElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const postOutput = document.getElementById("postOutput") as HTMLTextAreaElement;

const fields = {
  title: document.getElementById("title") as HTMLInputElement,
  price: document.getElementById("price") as HTMLInputElement,
  images: document.getElementById("images") as HTMLTextAreaElement,
  rating: document.getElementById("rating") as HTMLInputElement,
  soldCount: document.getElementById("soldCount") as HTMLInputElement,
  description: document.getElementById("description") as HTMLTextAreaElement
};

let currentPageUrl = "";

function readDraft(): ProductDraft {
  return {
    title: fields.title.value.trim(),
    price: fields.price.value.trim(),
    imageUrls: fields.images.value.split("\n").map((i) => i.trim()).filter(Boolean),
    rating: fields.rating.value.trim() || undefined,
    soldCount: fields.soldCount.value.trim() || undefined,
    description: fields.description.value.trim() || undefined,
    pageUrl: currentPageUrl
  };
}

function applyDraft(data: ProductDraft): void {
  currentPageUrl = data.pageUrl;
  (document.getElementById("urlInfo") as HTMLElement).textContent = `URL: ${data.pageUrl}`;
  fields.title.value = data.title || "";
  fields.price.value = data.price || "";
  fields.images.value = data.imageUrls.join("\n");
  fields.rating.value = data.rating || "";
  fields.soldCount.value = data.soldCount || "";
  fields.description.value = data.description || "";
}

async function collectProduct(): Promise<void> {
  statusEl.textContent = "Collecting visible data...";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) {
    statusEl.textContent = "No active tab found.";
    return;
  }

  currentPageUrl = tab.url;
  const result = await chrome.tabs.sendMessage(tab.id, { type: "ZSP_COLLECT_PRODUCT" }) as ProductDraft;
  applyDraft(result);
  statusEl.textContent = "Data collected. Please review/edit before sending.";
}

async function confirmAndSend(): Promise<void> {
  const draft = readDraft();
  if (!draft.title || !draft.price) {
    statusEl.textContent = "Title and price are required.";
    return;
  }

  const ok = confirm("Confirm sending this reviewed product data to zsp-aitool?");
  if (!ok) return;

  try {
    const settings = await getSettings();
    await sendProduct(settings, draft);
    statusEl.textContent = "Sent successfully.";
  } catch (error) {
    statusEl.textContent = error instanceof Error ? error.message : "Send failed.";
  }
}

function bindSocialButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("button[data-social]").forEach((button) => {
    button.addEventListener("click", () => {
      const platform = button.dataset.social as SocialPlatform;
      postOutput.value = quickPost(platform, readDraft());
    });
  });
}

collectBtn.addEventListener("click", () => {
  void collectProduct();
});
sendBtn.addEventListener("click", () => {
  void confirmAndSend();
});
bindSocialButtons();
