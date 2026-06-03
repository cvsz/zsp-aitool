"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CsvProductImportProgressPanel } from "@/components/imports/CsvProductImportProgressPanel";

type IngestionItem = {
  id: string;
  source: "manual" | "csv" | "extension" | "open_api_future";
  status: "pending_review" | "approved" | "rejected" | "imported" | "failed";
  affiliateUrl: string | null;
  productUrl: string | null;
  title: string | null;
  campaignNote: string | null;
  price: number | null;
  productId: string | null;
  errorSummary: string | null;
  rowIndex: number | null;
  createdAt: string;
  updatedAt: string;
};

type Summary = Record<string, number>;
type SocialChannel = "facebook" | "threads" | "x" | "instagram" | "tiktok" | "youtube_shorts";
type TikTokStyle = "review" | "recommend" | "promotion" | "short";
type FacebookMode = "page" | "individual" | "supporters" | "monetization";

const emptySummary: Summary = { pendingReview: 0, approved: 0, rejected: 0, imported: 0, failed: 0 };
const affiliateDisclosure = "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ";
const shortAffiliateDisclosure = "ลิงก์นี้เป็นลิงก์ Affiliate";
const spGlobalCategoryFileName = "SP-Product-Feed-All-Global-Category.csv";
const AUTO_REFRESH_MS = 30_000;
const TIKTOK_MAX_CHARS = 2200;

const tiktokHashtagPool = [
  "#ShopeeFinds", "#Affiliate", "#รีวิวสินค้า", "#ของดีบอกต่อ",
  "#Shopee", "#ของถูกและดี", "#ป้ายยา", "#สินค้าดีบอกต่อ",
  "#ช้อปปิ้ง", "#ติดเทรนด์", "#ซื้อซ้ำ", "#ของมันต้องมี",
  "#ShopeeThailand", "#AffiliateMarketing", "#รายได้เสริม",
  "#แม่ค้าออนไลน์", "#ขายดี", "#โปรโมชั่น", "#ลดราคา",
  "#สินค้าขายดี", "#review", "#shopping", "#fyp",
];

const tiktokStyleLabels: Record<TikTokStyle, string> = {
  review: "รีวิวสินค้า",
  recommend: "ป้ายยาสินค้าเด็ด",
  promotion: "แนะนำโปรโมชั่น",
  short: "สั้นกระชับ",
};

const tiktokStyleEmojis: Record<TikTokStyle, string> = {
  review: "📝",
  recommend: "🔥",
  promotion: "💰",
  short: "⚡",
};

const statusLabels: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  imported: "Imported",
  rejected: "Rejected",
  failed: "Failed",
};

const statusColors: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-900 border-amber-200",
  approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  imported: "bg-blue-100 text-blue-900 border-blue-200",
  rejected: "bg-red-100 text-red-900 border-red-200",
  failed: "bg-rose-100 text-rose-900 border-rose-200",
};

const socialChannelLabels: Record<SocialChannel, string> = {
  facebook: "Facebook",
  threads: "Threads",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube_shorts: "YouTube Shorts",
};

const defaultTiktokHashtags = ["#ShopeeFinds", "#Affiliate", "#รีวิวสินค้า", "#fyp"];

const fbHashtagPool = [
  "#ShopeeFinds", "#Affiliate", "#รีวิวสินค้า", "#ของดีบอกต่อ",
  "#ShopeeThailand", "#AffiliateMarketing", "#ของถูกและดี", "#ป้ายยา",
  "#ช้อปปิ้ง", "#สินค้าดีบอกต่อ", "#ของมันต้องมี", "#โปรโมชั่น",
  "#ลดราคา", "#แม่ค้าออนไลน์", "#รายได้เสริม", "#ContentMonetization",
  "#FacebookCreator", "#สินค้าขายดี", "#ขายดี", "#Shopping",
];

const defaultFbHashtags = ["#ShopeeFinds", "#Affiliate", "#รีวิวสินค้า", "#ของดีบอกต่อ"];

const FACEBOOK_MAX_CHARS = 5000;

const facebookModeLabels: Record<FacebookMode, string> = {
  page: "โพสต์เพจ",
  individual: "โพสต์ส่วนตัว",
  supporters: "โพสต์ผู้สนับสนุน",
  monetization: "สร้างรายได้",
};

const facebookModeEmojis: Record<FacebookMode, string> = {
  page: "📄",
  individual: "👤",
  supporters: "⭐",
  monetization: "💎",
};

const facebookModeDescriptions: Record<FacebookMode, string> = {
  page: "โพสต์สำหรับ Facebook Page — เหมาะกับเพจขายของและรีวิวสินค้า",
  individual: "โพสต์สำหรับโปรไฟล์ส่วนตัว — แบบเป็นกันเอง",
  supporters: "โพสต์พิเศษสำหรับผู้สนับสนุน (Facebook Stars/Supporter) — เนื้อหา Exclusive",
  monetization: "โพสต์ที่ออกแบบให้ตรงตามเงื่อนไข Content Monetization ของ Facebook",
};

function buildTikTokPostDraft(item: IngestionItem, style: TikTokStyle, customHashtags: string[]): string {
  const title = item.title ?? "สินค้าจาก Shopee";
  const link = item.affiliateUrl ?? item.productUrl ?? "";
  const priceStr = item.price && item.price > 0 ? `฿${item.price.toLocaleString("th-TH")}` : "";
  const campaign = item.campaignNote ?? "";
  const hashtagLine = customHashtags.length > 0 ? customHashtags.join(" ") : defaultTiktokHashtags.join(" ");

  const hooks: Record<TikTokStyle, string> = {
    review: `📝 รีวิว {title} {price}\n\n📍 รายละเอียดสินค้า: {title}\n{price}{campaign}\n\n💡 เหมาะกับคนที่กำลังมองหา {title}\n\n🗣️ พิกัด: ดูใน Shopee ได้เลย\n\n{link}\n\n{disclosure}`,
    recommend: `🔥 ป้ายยา!! {title} {price}\n\nสินค้าดีบอกต่อ ของมันต้องมี! {title}\n{price}{campaign}\n\n👉 ดูรายละเอียดเพิ่มเติมได้ที่ลิงก์ด้านล่าง\n\n{link}\n\n{disclosure}`,
    promotion: `💰 โปรเด็ด! {title} {price}\n\n{campaign}\n\n{title} ราคาพิเศษ {price}\n\nรีบด่วนก่อนโปรจะหมด! ดูรายละเอียดได้เลย\n\n{link}\n\n{disclosure}`,
    short: `⚡ {title} {price}\n\n{campaign}\n\n{link}\n\n{disclosure}`,
  };

  let template = hooks[style];
  template = template.replace(/{title}/g, title);
  template = template.replace(/{price}/g, priceStr ? `ราคา ${priceStr}` : "");
  template = template.replace(/{campaign}/g, campaign ? `📌 โปรโมชั่น: ${campaign}` : "");
  template = template.replace(/{disclosure}/g, affiliateDisclosure);
  template = template.replace(/{link}/g, link || "ลิงก์: ตรวจสอบรายการก่อนแนบลิงก์");
  template = template.replace(/\n{3,}/g, "\n\n").trim();

  return `${template}\n\n${hashtagLine}`;
}

function buildFacebookPostDraft(item: IngestionItem, mode: FacebookMode): string {
  const title = item.title ?? "สินค้าจาก Shopee";
  const link = item.affiliateUrl ?? item.productUrl ?? "";
  const priceStr = item.price && item.price > 0 ? `฿${item.price.toLocaleString("th-TH")}` : "";
  const campaign = item.campaignNote ?? "";

  const templates: Record<FacebookMode, string> = {
    page: `📄 สินค้าแนะนำ: {title}\n\n{productInfo}\n\n{campaign}\n\n💬 {title}\n✅ สินค้าคุณภาพจาก Shopee\n🛒 ดูรายละเอียดเพิ่มเติมได้ที่ลิงก์ด้านล่าง\n\n{disclosure}\n\n{link}\n\n#ShopeeFinds #Affiliate #รีวิวสินค้า #ของดีบอกต่อ #Shopee`,
    individual: `👋 สวัสดีครับ/คะ วันนี้ขอแนะนำ {title}\n\n{productInfo}\n\n{campaign}\n\nส่วนตัวคิดว่าเป็นสินค้าที่คุ้มค่ามากๆ ลองดูรายละเอียดกันได้นะ\n\n{disclosure}\n\n{link}\n\n#ShopeeFinds #Affiliate #ของดีบอกต่อ`,
    supporters: `⭐ Exclusive สำหรับผู้สนับสนุนโดยเฉพาะ!\n\n{title}\n{productInfo}\n{campaign}\n\nขอบคุณที่เป็นผู้สนับสนุนครับ/คะ 🙏\n\n{disclosure}\n\n{link}`,
    monetization: `💎 Content Monetization — {title}\n\n{productInfo}\n\n{campaign}\n\nเนื้อหานี้สร้างขึ้นตามแนวทาง Content Monetization ของ Facebook\n\n{disclosure}\n\n{link}\n\n#ShopeeFinds #Affiliate #ContentMonetization #FacebookCreator`,
  };

  const productInfo = priceStr
    ? `📍 {title}\n💰 ราคา: ${priceStr}`
    : `📍 {title}`;

  let output = templates[mode]
    .replace(/{title}/g, title)
    .replace(/{productInfo}/g, productInfo)
    .replace(/{price}/g, priceStr)
    .replace(/{campaign}/g, campaign ? `📌 โปรโมชั่น: ${campaign}` : "")
    .replace(/{disclosure}/g, affiliateDisclosure)
    .replace(/{link}/g, link || "ลิงก์: ตรวจสอบรายการก่อนแนบลิงก์");
  output = output.replace(/\n{3,}/g, "\n\n").trim();

  return output;
}

function buildSocialPostDraft(item: IngestionItem, channel: SocialChannel) {
  const title = item.title ?? "สินค้า/ร้านค้าที่เลือกจาก Shopee";
  const link = item.affiliateUrl ?? item.productUrl ?? "";
  const offer = item.campaignNote ? `\nโปรโมชัน/คอมมิชชัน: ${item.campaignNote}` : "";
  const price = item.price && item.price > 0 ? `\nราคาอ้างอิง: ฿${item.price.toLocaleString("th-TH")}` : "";
  const disclosure = channel === "x" ? shortAffiliateDisclosure : affiliateDisclosure;
  const hashtags = channel === "instagram" || channel === "tiktok" || channel === "youtube_shorts"
    ? "\n#ShopeeFinds #Affiliate #รีวิวสินค้า"
    : "";
  return [
    `แนะนำ: ${title}`,
    "เหมาะสำหรับคนที่กำลังมองหาตัวเลือกใน Shopee ลองเช็กรายละเอียด ราคา และเงื่อนไขล่าสุดก่อนสั่งซื้อ",
    offer, price, "",
    disclosure,
    link ? `ลิงก์: ${link}` : "ลิงก์: ตรวจสอบรายการก่อนแนบลิงก์",
    hashtags,
  ].filter(Boolean).join("\n");
}

export function ShopeeAffiliateControlCenter() {
  const [payload, setPayload] = useState<{ items: IngestionItem[]; summary: Summary }>({ items: [], summary: emptySummary });
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulkUrlInput, setShowBulkUrlInput] = useState(false);

  const [manual, setManual] = useState({ affiliateUrl: "", productUrl: "", title: "", campaignNote: "", price: "" });
  const [csv, setCsv] = useState("affiliate_url,product_url,title,campaign,price\n");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [importProductsFromCsv, setImportProductsFromCsv] = useState(true);
  const [socialChannel, setSocialChannel] = useState<SocialChannel>("facebook");
  const [draftsById, setDraftsById] = useState<Record<string, { draftId: string; content: string }>>({});

  const [tiktokOpen, setTiktokOpen] = useState(false);
  const [tiktokItemId, setTiktokItemId] = useState<string | null>(null);
  const [tiktokStyle, setTiktokStyle] = useState<TikTokStyle>("review");
  const [tiktokCaption, setTiktokCaption] = useState("");
  const [tiktokHashtags, setTiktokHashtags] = useState<string[]>([...defaultTiktokHashtags]);
  const [tiktokHashtagSearch, setTiktokHashtagSearch] = useState("");
  const [tiktokCustomHashtag, setTiktokCustomHashtag] = useState("");
  const [tiktokSchedule, setTiktokSchedule] = useState("");
  const [tiktokAutoSave, setTiktokAutoSave] = useState(true);
  const [tiktokVariations, setTiktokVariations] = useState<string[]>([]);
  const [tiktokVariationMode, setTiktokVariationMode] = useState(false);
  const [tiktokEnhancing, setTiktokEnhancing] = useState<string | null>(null);
  const tiktokTextareaRef = useRef<HTMLTextAreaElement>(null);
  const tiktokAutoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fbOpen, setFbOpen] = useState(false);
  const [fbItemId, setFbItemId] = useState<string | null>(null);
  const [fbMode, setFbMode] = useState<FacebookMode>("page");
  const [fbCaption, setFbCaption] = useState("");
  const [fbHashtags, setFbHashtags] = useState<string[]>([...defaultFbHashtags]);
  const [fbHashtagSearch, setFbHashtagSearch] = useState("");
  const [fbCustomHashtag, setFbCustomHashtag] = useState("");
  const [fbSchedule, setFbSchedule] = useState("");
  const [fbAutoSave, setFbAutoSave] = useState(true);
  const [fbVariations, setFbVariations] = useState<string[]>([]);
  const [fbVariationMode, setFbVariationMode] = useState(false);
  const [fbEnhancing, setFbEnhancing] = useState<string | null>(null);
  const fbTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fbAutoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredEndpoint = useMemo(() => {
    if (status === "all") return "/api/integrations/shopee/affiliate-ingestions";
    return `/api/integrations/shopee/affiliate-ingestions?status=${status}`;
  }, [status]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return payload.items;
    const q = search.toLowerCase();
    return payload.items.filter((item) =>
      [item.title, item.affiliateUrl, item.productUrl, item.campaignNote, item.source, item.id]
        .some((f) => f?.toLowerCase().includes(q))
    );
  }, [payload.items, search]);

  const tiktokTargetItem = useMemo(() => {
    if (!tiktokItemId) return null;
    return payload.items.find((it) => it.id === tiktokItemId) ?? null;
  }, [tiktokItemId, payload.items]);

  const tiktokCharCount = tiktokCaption.length;
  const tiktokCharPercent = Math.min(100, Math.round((tiktokCharCount / TIKTOK_MAX_CHARS) * 100));
  const tiktokNearLimit = tiktokCharCount > TIKTOK_MAX_CHARS * 0.85;

  const filteredHashtagPool = useMemo(() => {
    if (!tiktokHashtagSearch.trim()) return tiktokHashtagPool;
    const q = tiktokHashtagSearch.toLowerCase().replace(/^#/, "");
    return tiktokHashtagPool.filter((tag) => tag.toLowerCase().includes(q));
  }, [tiktokHashtagSearch]);

  const tiktokHasDisclosure = tiktokCaption.includes("ค่าคอมมิชชัน") || tiktokCaption.includes("Affiliate");
  const tiktokHashtagCount = (tiktokCaption.match(/#\w+/g) || []).length;
  const tiktokCaptionOnlyLen = tiktokCaption.replace(/#\w+/g, "").trim().length;
  const tiktokIsTooShort = tiktokCaptionOnlyLen > 0 && tiktokCaptionOnlyLen < 50;
  const tiktokQualityScore = (tiktokHasDisclosure ? 40 : 0) + Math.min(tiktokHashtagCount * 5, 30) + (tiktokCaptionOnlyLen > 50 ? 20 : 0) + (tiktokCaptionOnlyLen > 0 ? 10 : 0);

  const fbTargetItem = useMemo(() => {
    if (!fbItemId) return null;
    return payload.items.find((it) => it.id === fbItemId) ?? null;
  }, [fbItemId, payload.items]);

  const fbCharCount = fbCaption.length;
  const fbCharPercent = Math.min(100, Math.round((fbCharCount / FACEBOOK_MAX_CHARS) * 100));
  const fbNearLimit = fbCharCount > FACEBOOK_MAX_CHARS * 0.85;

  const filteredFbHashtagPool = useMemo(() => {
    if (!fbHashtagSearch.trim()) return fbHashtagPool;
    const q = fbHashtagSearch.toLowerCase().replace(/^#/, "");
    return fbHashtagPool.filter((tag) => tag.toLowerCase().includes(q));
  }, [fbHashtagSearch]);

  const fbHasDisclosure = fbCaption.includes("ค่าคอมมิชชัน") || fbCaption.includes("Affiliate") || fbCaption.includes("affiliate");
  const fbHashtagCount = (fbCaption.match(/#\w+/g) || []).length;
  const fbCaptionOnlyLen = fbCaption.replace(/#\w+/g, "").trim().length;
  const fbIsTooShort = fbCaptionOnlyLen > 0 && fbCaptionOnlyLen < 50;
  const fbQualityScore = (fbHasDisclosure ? 40 : 0) + Math.min(fbHashtagCount * 5, 30) + (fbCaptionOnlyLen > 50 ? 20 : 0) + (fbCaptionOnlyLen > 0 ? 10 : 0);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(filteredEndpoint);
      const json = await res.json();
      if (json?.ok && json.data) setPayload(json.data);
    } finally {
      setLoading(false);
    }
  }, [filteredEndpoint]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => void refresh(), AUTO_REFRESH_MS);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, refresh]);

  useEffect(() => {
    if (!tiktokOpen || !tiktokTargetItem) return;
    setTiktokCaption(buildTikTokPostDraft(tiktokTargetItem, tiktokStyle, tiktokHashtags));
  }, [tiktokStyle]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tiktokOpen || !tiktokAutoSave || !tiktokTargetItem || !tiktokCaption.trim()) return;
    if (tiktokAutoSaveRef.current) clearTimeout(tiktokAutoSaveRef.current);
    tiktokAutoSaveRef.current = setTimeout(() => {
      const firstLine = tiktokCaption.split("\n")[0];
      setMessage(`💾 Auto-saved draft for ${tiktokTargetItem.title ?? "current"} (${firstLine.slice(0, 30)}...)`);
    }, 4000);
    return () => { if (tiktokAutoSaveRef.current) clearTimeout(tiktokAutoSaveRef.current); };
  }, [tiktokCaption, tiktokOpen, tiktokAutoSave]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!fbOpen || !fbTargetItem) return;
    setFbCaption(buildFacebookPostDraft(fbTargetItem, fbMode));
  }, [fbMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!fbOpen || !fbAutoSave || !fbTargetItem || !fbCaption.trim()) return;
    if (fbAutoSaveRef.current) clearTimeout(fbAutoSaveRef.current);
    fbAutoSaveRef.current = setTimeout(() => {
      const firstLine = fbCaption.split("\n")[0];
      setMessage(`💾 Auto-saved FB draft for ${fbTargetItem.title ?? "current"} (${firstLine.slice(0, 30)}...)`);
    }, 4000);
    return () => { if (fbAutoSaveRef.current) clearTimeout(fbAutoSaveRef.current); };
  }, [fbCaption, fbOpen, fbAutoSave]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilteredItems = filteredItems.length > 0;

  function openTiktokComposer(itemId: string | null) {
    setTiktokItemId(itemId);
    setTiktokStyle("review");
    setTiktokHashtags([...defaultTiktokHashtags]);
    setTiktokHashtagSearch("");
    setTiktokCustomHashtag("");
    setTiktokSchedule("");
    setTiktokAutoSave(true);
    setTiktokVariationMode(false);
    setTiktokVariations([]);
    setTiktokEnhancing(null);
    const item = itemId ? payload.items.find((it) => it.id === itemId) ?? null : null;
    if (item) {
      setTiktokCaption(buildTikTokPostDraft(item, "review", defaultTiktokHashtags));
    } else {
      setTiktokCaption("");
    }
    setTiktokOpen(true);
  }

  function closeTiktokComposer() {
    setTiktokOpen(false);
    setTiktokItemId(null);
    setTiktokCaption("");
    setTiktokStyle("review");
    setTiktokHashtags([...defaultTiktokHashtags]);
    setTiktokHashtagSearch("");
    setTiktokCustomHashtag("");
    setTiktokSchedule("");
    setTiktokAutoSave(true);
    setTiktokVariationMode(false);
    setTiktokVariations([]);
    setTiktokEnhancing(null);
  }

  function regenerateTiktokCaption() {
    if (tiktokTargetItem) {
      setTiktokCaption(buildTikTokPostDraft(tiktokTargetItem, tiktokStyle, tiktokHashtags));
    }
  }

  function toggleTiktokHashtag(tag: string) {
    setTiktokHashtags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 8) return prev;
      return [...prev, tag];
    });
  }

  function insertTiktokHashtag(tag: string) {
    if (!tiktokTextareaRef.current) return;
    const ta = tiktokTextareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = tiktokCaption.slice(0, start);
    const after = tiktokCaption.slice(end);
    const spacer = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n") ? " " : "";
    const newText = `${before}${spacer}${tag} ${after}`;
    setTiktokCaption(newText);
    requestAnimationFrame(() => {
      const pos = start + spacer.length + tag.length + 1;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  }

  async function saveTiktokDraft() {
    if (!tiktokTargetItem || !tiktokCaption.trim()) return;
    const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${tiktokTargetItem.id}/social-drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "tiktok", content: tiktokCaption }),
    });
    const json = await res.json();
    if (!json?.ok) return setMessage(json?.error?.message ?? "ไม่สามารถสร้าง TikTok draft ได้");
    setDraftsById((current) => ({ ...current, [tiktokTargetItem.id]: { draftId: json.data.id, content: json.data.content } }));
    setMessage(`✅ บันทึก TikTok draft แล้ว สำหรับ ${tiktokTargetItem.title ?? "สินค้า"} — ตรวจทานก่อนโพสต์`);
  }

  async function copyTiktokDraft() {
    await navigator.clipboard.writeText(tiktokCaption);
    setMessage("📋 คัดลอก TikTok caption แล้ว — วางใน TikTok app เพื่อโพสต์");
    if (tiktokTargetItem) {
      const existing = draftsById[tiktokTargetItem.id];
      if (existing?.draftId) {
        await fetch("/api/integrations/shopee/affiliate-ingestions/social-drafts/copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftId: existing.draftId }),
        });
      }
    }
  }

  function addTiktokCustomHashtag() {
    const tag = tiktokCustomHashtag.trim();
    if (!tag) return;
    const formatted = tag.startsWith("#") ? tag : `#${tag}`;
    if (tiktokHashtags.includes(formatted)) {
      setMessage(`⚠️ Hashtag ${formatted} มีอยู่แล้ว`);
      setTiktokCustomHashtag("");
      return;
    }
    setTiktokHashtags((prev) => prev.length >= 8 ? prev : [...prev, formatted]);
    setTiktokCustomHashtag("");
  }

  function enhanceTiktokCaption(action: "expand" | "shorten" | "emojify") {
    if (!tiktokCaption.trim()) return;
    setTiktokEnhancing(action);
    const labels: Record<string, string> = { expand: "ขยายความ", shorten: "ย่อข้อความ", emojify: "เพิ่มอีโมจิ" };
    setTimeout(() => {
      const lines = tiktokCaption.split("\n").filter(Boolean);
      let enhanced = tiktokCaption;
      if (action === "expand") {
        const firstLine = lines[0] || "";
        enhanced = `${firstLine}\n\n✨ สินค้าคุณภาพดี ราคาเหมาะสม คุ้มค่าคุ้มราคา\n🛒 อย่าพลาดโอกาสดีๆ รีบสั่งเลยตอนนี้\n\n${lines.slice(1).join("\n")}`;
      } else if (action === "shorten") {
        enhanced = lines.slice(0, 3).join("\n") + "\n\n" + lines[lines.length - 1];
      } else if (action === "emojify") {
        enhanced = tiktokCaption
          .replace(/สินค้า/g, "🛍️ สินค้า")
          .replace(/ราคา/g, "💰 ราคา")
          .replace(/โปรโมชั่น/g, "🔥 โปรโมชั่น")
          .replace(/Shopee/g, "🛒 Shopee")
          .replace(/รายละเอียด/g, "📋 รายละเอียด")
          .replace(/พิกัด/g, "📍 พิกัด")
          .replace(/รีวิว/g, "📝 รีวิว")
          .replace(/ดู/g, "👀 ดู");
      }
      setTiktokCaption(enhanced);
      setTiktokEnhancing(null);
      setMessage(`✅ ${labels[action]} เสร็จแล้ว — ตรวจสอบความถูกต้องก่อนโพสต์`);
    }, 600);
  }

  function generateTiktokVariations() {
    if (!tiktokTargetItem) return;
    setTiktokVariationMode(true);
    const styles: TikTokStyle[] = ["review", "recommend", "promotion"];
    const vars = styles.map((s) => buildTikTokPostDraft(tiktokTargetItem, s, tiktokHashtags));
    setTiktokVariations(vars);
    setMessage(`🎬 สร้าง ${vars.length} รูปแบบ — เลือกแบบที่ชอบแล้วกด "ใช้แบบนี้"`);
  }

  function applyTiktokVariation(content: string) {
    setTiktokCaption(content);
    setTiktokVariationMode(false);
    setTiktokVariations([]);
  }

  function openFbComposer(itemId: string | null) {
    setFbItemId(itemId);
    setFbMode("page");
    setFbHashtags([...defaultFbHashtags]);
    setFbHashtagSearch("");
    setFbCustomHashtag("");
    setFbSchedule("");
    setFbAutoSave(true);
    setFbVariationMode(false);
    setFbVariations([]);
    setFbEnhancing(null);
    const item = itemId ? payload.items.find((it) => it.id === itemId) ?? null : null;
    setFbCaption(item ? buildFacebookPostDraft(item, "page") : "");
    setFbOpen(true);
  }

  function closeFbComposer() {
    setFbOpen(false);
    setFbItemId(null);
    setFbCaption("");
    setFbMode("page");
    setFbHashtags([]);
    setFbHashtagSearch("");
    setFbCustomHashtag("");
    setFbSchedule("");
    setFbAutoSave(true);
    setFbVariationMode(false);
    setFbVariations([]);
    setFbEnhancing(null);
  }

  function regenerateFbCaption() {
    if (fbTargetItem) {
      setFbCaption(buildFacebookPostDraft(fbTargetItem, fbMode));
    }
  }

  async function saveFbDraft() {
    if (!fbTargetItem || !fbCaption.trim()) return;
    const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${fbTargetItem.id}/social-drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "facebook", content: fbCaption }),
    });
    const json = await res.json();
    if (!json?.ok) return setMessage(json?.error?.message ?? "ไม่สามารถสร้าง Facebook draft ได้");
    setDraftsById((current) => ({ ...current, [fbTargetItem.id]: { draftId: json.data.id, content: json.data.content } }));
    setMessage(`✅ บันทึก Facebook draft แล้ว สำหรับ ${fbTargetItem.title ?? "สินค้า"} — ตรวจทานก่อนโพสต์`);
  }

  async function copyFbDraft() {
    await navigator.clipboard.writeText(fbCaption);
    setMessage("📋 คัดลอก Facebook post แล้ว — วางใน Facebook เพื่อโพสต์");
    if (fbTargetItem) {
      const existing = draftsById[fbTargetItem.id];
      if (existing?.draftId) {
        await fetch("/api/integrations/shopee/affiliate-ingestions/social-drafts/copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftId: existing.draftId }),
        });
      }
    }
  }

  function toggleFbHashtag(tag: string) {
    setFbHashtags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 8) return prev;
      return [...prev, tag];
    });
  }

  function insertFbHashtag(tag: string) {
    if (!fbTextareaRef.current) return;
    const ta = fbTextareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = fbCaption.slice(0, start);
    const after = fbCaption.slice(end);
    const spacer = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n") ? " " : "";
    const newText = `${before}${spacer}${tag} ${after}`;
    setFbCaption(newText);
    requestAnimationFrame(() => {
      const pos = start + spacer.length + tag.length + 1;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  }

  function addFbCustomHashtag() {
    const tag = fbCustomHashtag.trim();
    if (!tag) return;
    const formatted = tag.startsWith("#") ? tag : `#${tag}`;
    if (fbHashtags.includes(formatted)) {
      setMessage(`⚠️ Hashtag ${formatted} มีอยู่แล้ว`);
      setFbCustomHashtag("");
      return;
    }
    setFbHashtags((prev) => prev.length >= 8 ? prev : [...prev, formatted]);
    setFbCustomHashtag("");
  }

  function enhanceFbCaption(action: "expand" | "shorten" | "emojify") {
    if (!fbCaption.trim()) return;
    setFbEnhancing(action);
    const labels: Record<string, string> = { expand: "ขยายความ", shorten: "ย่อข้อความ", emojify: "เพิ่มอีโมจิ" };
    setTimeout(() => {
      const lines = fbCaption.split("\n").filter(Boolean);
      let enhanced = fbCaption;
      if (action === "expand") {
        const firstLine = lines[0] || "";
        enhanced = `${firstLine}\n\n✨ สินค้าคุณภาพดี ราคาเหมาะสม คุ้มค่า\n👍 อย่าพลาด! สั่งเลยวันนี้\n\n${lines.slice(1).join("\n")}`;
      } else if (action === "shorten") {
        enhanced = lines.slice(0, 3).join("\n") + "\n\n" + lines[lines.length - 1];
      } else if (action === "emojify") {
        enhanced = fbCaption
          .replace(/สินค้า/g, "🛍️ สินค้า")
          .replace(/ราคา/g, "💰 ราคา")
          .replace(/โปรโมชั่น/g, "🔥 โปรโมชั่น")
          .replace(/Shopee/g, "🛒 Shopee")
          .replace(/รายละเอียด/g, "📋 รายละเอียด")
          .replace(/แนะนำ/g, "💡 แนะนำ")
          .replace(/รีวิว/g, "📝 รีวิว")
          .replace(/โพสต์/g, "📢 โพสต์");
      }
      setFbCaption(enhanced);
      setFbEnhancing(null);
      setMessage(`✅ ${labels[action]} เสร็จแล้ว — ตรวจสอบความถูกต้องก่อนโพสต์`);
    }, 600);
  }

  function generateFbVariations() {
    if (!fbTargetItem) return;
    setFbVariationMode(true);
    const modes: FacebookMode[] = ["page", "individual", "supporters"];
    const vars = modes.map((m) => buildFacebookPostDraft(fbTargetItem, m));
    setFbVariations(vars);
    setMessage(`📱 สร้าง ${vars.length} รูปแบบ — เลือกแบบที่ชอบแล้วกด "ใช้แบบนี้"`);
  }

  function applyFbVariation(content: string) {
    setFbCaption(content);
    setFbVariationMode(false);
    setFbVariations([]);
  }

  async function bulkGenerateFbDrafts() {
    if (selected.size === 0) return;
    setMessage(null);
    let success = 0;
    let fail = 0;
    const ids = Array.from(selected);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const item = payload.items.find((it) => it.id === id);
      if (!item || !item.affiliateUrl) { fail++; continue; }
      const content = buildFacebookPostDraft(item, fbMode);
      try {
        const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/social-drafts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "facebook", content }),
        });
        const json = await res.json();
        if (json?.ok) {
          success++;
          setDraftsById((current) => ({ ...current, [id]: { draftId: json.data.id, content: json.data.content } }));
        } else fail++;
      } catch { fail++; }
      setBatchProgress(`📱 สร้าง Facebook post ที่ ${i + 1}/${ids.length}... (สำเร็จ ${success}, ล้มเหลว ${fail})`);
    }
    setSelected(new Set());
    setBatchProgress(null);
    setMessage(`📱 สร้าง Facebook posts แบบกลุ่ม: สำเร็จ ${success}, ล้มเหลว ${fail}`);
    await refresh();
  }

  async function bulkGenerateTiktokDrafts() {
    if (selected.size === 0) return;
    setMessage(null);
    let success = 0;
    let fail = 0;
    const ids = Array.from(selected);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const item = payload.items.find((it) => it.id === id);
      if (!item || !item.affiliateUrl) { fail++; continue; }
      const content = buildTikTokPostDraft(item, tiktokStyle, tiktokHashtags);
      try {
        const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/social-drafts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "tiktok", content }),
        });
        const json = await res.json();
        if (json?.ok) {
          success++;
          setDraftsById((current) => ({ ...current, [id]: { draftId: json.data.id, content: json.data.content } }));
        } else fail++;
      } catch { fail++; }
      setBatchProgress(`🎬 สร้าง TikTok draft ที่ ${i + 1}/${ids.length}... (สำเร็จ ${success}, ล้มเหลว ${fail})`);
    }
    setSelected(new Set());
    setBatchProgress(null);
    setMessage(`🎬 สร้าง TikTok drafts แบบกลุ่ม: สำเร็จ ${success}, ล้มเหลว ${fail}`);
    await refresh();
  }

  async function submitManual(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const price = manual.price.trim() ? Number(manual.price) : undefined;
    const res = await fetch("/api/integrations/shopee/affiliate-manual-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateUrl: manual.affiliateUrl,
        productUrl: manual.productUrl,
        saveMode: "affiliate-link",
        title: manual.title || undefined,
        campaignNote: manual.campaignNote || undefined,
        price: Number.isFinite(price) ? price : undefined,
      }),
    });
    const json = await res.json();
    if (json?.ok) {
      setManual({ affiliateUrl: "", productUrl: "", title: "", campaignNote: "", price: "" });
      setMessage("บันทึกรายการ URL ลงฐานข้อมูลจริงแล้ว รอตรวจทานก่อน import");
      await refresh();
    } else {
      setMessage(json?.error?.message ?? "ไม่สามารถบันทึก URL ได้");
    }
  }

  async function submitBulkUrls(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const lines = bulkUrls.split("\n").map((l) => l.trim()).filter(Boolean);
    let success = 0;
    let fail = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [aff, prod] = line.includes(",") ? line.split(",").map((s) => s.trim()) : [line, line];
      try {
        const res = await fetch("/api/integrations/shopee/affiliate-manual-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affiliateUrl: aff,
            productUrl: prod,
            saveMode: "affiliate-link",
            title: undefined,
            campaignNote: undefined,
            price: undefined,
          }),
        });
        const json = await res.json();
        if (json?.ok) success++;
        else fail++;
      } catch { fail++; }
      setBatchProgress(`นำเข้าที่ ${i + 1}/${lines.length}... (สำเร็จ ${success}, ล้มเหลว ${fail})`);
    }
    setBulkUrls("");
    setShowBulkUrlInput(false);
    setBatchProgress(null);
    setMessage(`นำเข้า ${success} รายการสำเร็จ, ล้มเหลว ${fail} รายการ`);
    await refresh();
  }

  async function handleCsvFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isExpectedName = file.name === spGlobalCategoryFileName;
    const text = await file.text();
    setSelectedFileName(file.name);
    setCsv(text);
    setMessage(isExpectedName
      ? `โหลดไฟล์ ${spGlobalCategoryFileName} แล้ว กด Save + Import Products to DB เพื่อสร้างสินค้า`
      : `โหลดไฟล์ ${file.name} แล้ว ระบบจะ validate header/URL ก่อนสร้างสินค้า`);
  }

  async function submitCsv(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/integrations/shopee/affiliate-csv-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, importProducts: importProductsFromCsv }),
    });
    const json = await res.json();
    if (json?.ok) {
      const imported = json.data.importedProductCount ?? 0;
      const failed = json.data.importFailedCount ?? 0;
      setMessage(importProductsFromCsv
        ? `บันทึก CSV แล้ว ${json.data.createdIngestionCount} รายการ และสร้างสินค้า ${imported} รายการ, import failed ${failed}, rejected ${json.data.rejectedCount}`
        : `บันทึก CSV ลง queue แล้ว ${json.data.createdIngestionCount} รายการ, rejected ${json.data.rejectedCount} รายการ`);
      await refresh();
    } else {
      setMessage(json?.error?.message ?? "ไม่สามารถ preview/import CSV ได้");
    }
  }

  async function act(id: string, action: "approve" | "reject" | "import") {
    setBusyIds((prev) => new Set(prev).add(id));
    setMessage(null);
    try {
      const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason: "Rejected from dashboard" }) : undefined,
      });
      const json = await res.json();
      setMessage(json?.ok ? `ดำเนินการ ${action} สำเร็จ` : json?.error?.message ?? `ไม่สามารถ ${action} ได้`);
    } finally {
      setBusyIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      await refresh();
    }
  }

  async function batchAct(action: "approve" | "reject" | "import") {
    if (selected.size === 0) return;
    setMessage(null);
    let success = 0;
    let fail = 0;
    const ids = Array.from(selected);
    setBusyIds(new Set(ids));
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      try {
        const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: action === "reject" ? JSON.stringify({ reason: "Batch reject from dashboard" }) : undefined,
        });
        const json = await res.json();
        if (json?.ok) success++;
        else fail++;
      } catch { fail++; }
      setBatchProgress(`กำลังดำเนินการ ${action} ที่ ${i + 1}/${ids.length}... (สำเร็จ ${success}, ล้มเหลว ${fail})`);
    }
    setSelected(new Set());
    setBusyIds(new Set());
    setBatchProgress(null);
    setMessage(`ดำเนินการ ${action} แบบกลุ่ม: สำเร็จ ${success}, ล้มเหลว ${fail}`);
    await refresh();
  }

  async function createSocialDraft(item: IngestionItem) {
    const content = buildSocialPostDraft(item, socialChannel);
    const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${item.id}/social-drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: socialChannel, content }),
    });
    const json = await res.json();
    if (!json?.ok) return setMessage(json?.error?.message ?? "ไม่สามารถสร้าง draft ได้");
    setDraftsById((current) => ({ ...current, [item.id]: { draftId: json.data.id, content: json.data.content } }));
    setMessage(`สร้าง draft สำหรับ ${socialChannelLabels[socialChannel]} แล้ว โปรดตรวจทานก่อนโพสต์จริง`);
  }

  async function saveSocialDraft(item: IngestionItem, content: string) {
    const current = draftsById[item.id];
    if (!current?.draftId) return;
    await fetch(`/api/integrations/shopee/affiliate-ingestions/${item.id}/social-drafts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: current.draftId, content }),
    });
  }

  async function copySocialDraft(item: IngestionItem) {
    const current = draftsById[item.id];
    const draft = current?.content ?? buildSocialPostDraft(item, socialChannel);
    await navigator.clipboard.writeText(draft);
    if (current?.draftId) {
      await fetch("/api/integrations/shopee/affiliate-ingestions/social-drafts/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: current.draftId }),
      });
    }
    setMessage("คัดลอก social post draft แล้ว — ผู้ใช้ต้องตรวจทานและโพสต์เอง");
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      if (prev.size === filteredItems.length) return new Set();
      return new Set(filteredItems.map((it) => it.id));
    });
  }

  function exportCsv() {
    const headers = ["id", "status", "source", "title", "affiliateUrl", "productUrl", "price", "campaignNote", "createdAt"];
    const rows = filteredItems.map((it) =>
      headers.map((h) => JSON.stringify(String((it as Record<string, unknown>)[h] ?? ""))).join(",")
    );
    const blob = new Blob([headers.join(","), "\n", rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopee-affiliate-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-6 p-6">
      <Header
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((p) => !p)}
        onRefresh={refresh}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={hasFilteredItems ? exportCsv : undefined}
      />

      <StatsBar
        summary={payload.summary}
        activeStatus={status}
        onStatusClick={setStatus}
      />

      <ComplianceBanner />

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">{message}</div>
      ) : null}

      {batchProgress ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{batchProgress}</div>
      ) : null}

      {tiktokOpen ? (
        <TikTokPostComposer
          targetItem={tiktokTargetItem}
          style={tiktokStyle}
          caption={tiktokCaption}
          hashtags={tiktokHashtags}
          charCount={tiktokCharCount}
          charPercent={tiktokCharPercent}
          nearLimit={tiktokNearLimit}
          maxChars={TIKTOK_MAX_CHARS}
          selectedCount={selected.size}
          textareaRef={tiktokTextareaRef as React.RefObject<HTMLTextAreaElement>}
          variationMode={tiktokVariationMode}
          variations={tiktokVariations}
          enhancing={tiktokEnhancing}
          hasDisclosure={tiktokHasDisclosure}
          hashtagCount={tiktokHashtagCount}
          captionOnlyLen={tiktokCaptionOnlyLen}
          isTooShort={tiktokIsTooShort}
          qualityScore={tiktokQualityScore}
          hashtagSearch={tiktokHashtagSearch}
          customHashtag={tiktokCustomHashtag}
          schedule={tiktokSchedule}
          autoSave={tiktokAutoSave}
          filteredHashtagPool={filteredHashtagPool}
          onStyleChange={setTiktokStyle}
          onCaptionChange={setTiktokCaption}
          onRegenerate={regenerateTiktokCaption}
          onToggleHashtag={toggleTiktokHashtag}
          onInsertHashtag={insertTiktokHashtag}
          onSave={saveTiktokDraft}
          onCopy={copyTiktokDraft}
          onBulkGenerate={bulkGenerateTiktokDrafts}
          onClose={closeTiktokComposer}
          onHashtagSearchChange={setTiktokHashtagSearch}
          onCustomHashtagChange={setTiktokCustomHashtag}
          onAddCustomHashtag={addTiktokCustomHashtag}
          onScheduleChange={setTiktokSchedule}
          onAutoSaveChange={setTiktokAutoSave}
          onEnhance={enhanceTiktokCaption}
          onGenerateVariations={generateTiktokVariations}
          onApplyVariation={applyTiktokVariation}
        />
      ) : fbOpen ? (
        <FacebookPostComposer
          targetItem={fbTargetItem}
          mode={fbMode}
          caption={fbCaption}
          hashtags={fbHashtags}
          charCount={fbCharCount}
          charPercent={fbCharPercent}
          nearLimit={fbNearLimit}
          maxChars={FACEBOOK_MAX_CHARS}
          selectedCount={selected.size}
          textareaRef={fbTextareaRef as React.RefObject<HTMLTextAreaElement>}
          variationMode={fbVariationMode}
          variations={fbVariations}
          enhancing={fbEnhancing}
          hasDisclosure={fbHasDisclosure}
          hashtagCount={fbHashtagCount}
          captionOnlyLen={fbCaptionOnlyLen}
          isTooShort={fbIsTooShort}
          qualityScore={fbQualityScore}
          hashtagSearch={fbHashtagSearch}
          customHashtag={fbCustomHashtag}
          schedule={fbSchedule}
          autoSave={fbAutoSave}
          filteredHashtagPool={filteredFbHashtagPool}
          onModeChange={setFbMode}
          onCaptionChange={setFbCaption}
          onRegenerate={regenerateFbCaption}
          onToggleHashtag={toggleFbHashtag}
          onInsertHashtag={insertFbHashtag}
          onSave={saveFbDraft}
          onCopy={copyFbDraft}
          onBulkGenerate={bulkGenerateFbDrafts}
          onClose={closeFbComposer}
          onHashtagSearchChange={setFbHashtagSearch}
          onCustomHashtagChange={setFbCustomHashtag}
          onAddCustomHashtag={addFbCustomHashtag}
          onScheduleChange={setFbSchedule}
          onAutoSaveChange={setFbAutoSave}
          onEnhance={enhanceFbCaption}
          onGenerateVariations={generateFbVariations}
          onApplyVariation={applyFbVariation}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <TikTokQuickComposerCard
            selectedCount={selected.size}
            onOpen={() => {
              if (selected.size > 0) openTiktokComposer(null);
              else if (filteredItems.length > 0) openTiktokComposer(filteredItems[0].id);
            }}
          />
          <FacebookQuickComposerCard
            selectedCount={selected.size}
            onOpen={() => {
              if (selected.size > 0) openFbComposer(null);
              else if (filteredItems.length > 0) openFbComposer(filteredItems[0].id);
            }}
          />
        </div>
      )}

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        showBulkUrlInput={showBulkUrlInput}
        onToggleBulkUrl={() => setShowBulkUrlInput((p) => !p)}
        hasSelected={selected.size > 0}
        selectedCount={selected.size}
        onBatchAct={batchAct}
        onBatchDraft={() => {}}
        socialChannel={socialChannel}
        onOpenTiktok={() => {
          if (selected.size > 0) openTiktokComposer(null);
          else if (filteredItems.length > 0) openTiktokComposer(filteredItems[0].id);
        }}
        onOpenFacebook={() => {
          if (selected.size > 0) openFbComposer(null);
          else if (filteredItems.length > 0) openFbComposer(filteredItems[0].id);
        }}
      />

      {showBulkUrlInput ? (
        <BulkUrlForm
          value={bulkUrls}
          onChange={setBulkUrls}
          onSubmit={submitBulkUrls}
          onCancel={() => { setShowBulkUrlInput(false); setBulkUrls(""); }}
        />
      ) : null}

      <CsvProductImportProgressPanel />

      <section className="grid gap-4 lg:grid-cols-2">
        <ManualForm manual={manual} onChange={setManual} onSubmit={submitManual} />
        <CsvForm
          csv={csv}
          onChange={setCsv}
          onFileChange={handleCsvFile}
          onSubmit={submitCsv}
          selectedFileName={selectedFileName}
          importProductsFromCsv={importProductsFromCsv}
          onToggleImport={() => setImportProductsFromCsv((p) => !p)}
        />
      </section>

      {viewMode === "kanban" ? (
        <KanbanView
          items={filteredItems}
          busyIds={busyIds}
          selected={selected}
          onToggleSelect={toggleSelect}
          onAct={act}
          socialChannel={socialChannel}
          draftsById={draftsById}
          onCreateDraft={createSocialDraft}
          onSaveDraft={saveSocialDraft}
          onCopyDraft={copySocialDraft}
          onSelectAll={toggleSelectAll}
          allSelected={filteredItems.length > 0 && selected.size === filteredItems.length}
          onOpenTiktok={(id) => openTiktokComposer(id)}
          onOpenFacebook={(id) => openFbComposer(id)}
        />
      ) : (
        <ListView
          items={filteredItems}
          loading={loading}
          busyIds={busyIds}
          selected={selected}
          onToggleSelect={toggleSelect}
          onAct={act}
          socialChannel={socialChannel}
          draftsById={draftsById}
          onDraftContentChange={setDraftsById}
          onCreateDraft={createSocialDraft}
          onSaveDraft={saveSocialDraft}
          onCopyDraft={copySocialDraft}
          onSelectAll={toggleSelectAll}
          allSelected={filteredItems.length > 0 && selected.size === filteredItems.length}
          onOpenTiktok={(id) => openTiktokComposer(id)}
          onOpenFacebook={(id) => openFbComposer(id)}
        />
      )}
    </main>
  );
}

function TikTokQuickComposerCard({ selectedCount, onOpen }: { selectedCount: number; onOpen: () => void }) {
  return (
    <button onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-black via-zinc-900 to-zinc-800 p-5 text-left shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)] hover:brightness-110 hover:[border-image:linear-gradient(135deg,#ec4899,#8b5cf6, #06b6d4)_1]">
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-cyan-500/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-pink-500/20 group-hover:via-purple-500/20 group-hover:to-cyan-500/20 group-hover:opacity-100" />
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/50">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {selectedCount > 0 ? `${selectedCount} selected` : "พร้อมใช้งาน"}
      </div>
      <div className="absolute -right-6 -top-6 text-6xl opacity-[0.08]">🎬</div>
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">🎬</span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">TikTok Post</span>
            <p className="text-[10px] text-white/30">Shopee Affiliate • Thai Captions</p>
          </div>
        </div>
        <p className="mt-3 text-xl font-bold text-white">
          {selectedCount > 0 ? `สร้าง ${selectedCount} TikTok posts` : "สร้าง TikTok Post"}
        </p>
        <p className="mt-1 text-sm leading-5 text-white/60">
          {selectedCount > 0
            ? `กดเพื่อสร้าง TikTok drafts แบบกลุ่ม ${selectedCount} รายการ`
            : "เขียน TikTok caption แบบไทย พร้อม hashtag เสนอแนะ ตัวนับอักขระ และตรวจสอบคุณภาพอัตโนมัติ"}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">📝 รีวิว</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">🔥 ป้ายยา</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">💰 โปรโมชั่น</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">⚡ สั้น</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-purple-500/20">🎲 3 รูปแบบ</span>
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300 ring-1 ring-blue-500/20">📖 ขยาย/ย่อ</span>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-500/20">😊 เพิ่มอีโมจิ</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20">✅ ตรวจคุณภาพ</span>
          <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 ring-1 ring-cyan-500/20">📅 กำหนดโพสต์</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/40 group-hover:text-white/60">
          <span>คลิกเพื่อเริ่ม →</span>
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </div>
      </div>
    </button>
  );
}

function TikTokPostComposer({
  targetItem, style, caption, hashtags, charCount, charPercent, nearLimit, maxChars,
  selectedCount, textareaRef, variationMode, variations, enhancing, hasDisclosure, hashtagCount,
  captionOnlyLen, isTooShort, qualityScore, hashtagSearch, customHashtag, schedule, autoSave,
  filteredHashtagPool,
  onStyleChange, onCaptionChange, onRegenerate,
  onToggleHashtag, onInsertHashtag,
  onSave, onCopy, onBulkGenerate, onClose,
  onHashtagSearchChange, onCustomHashtagChange, onAddCustomHashtag,
  onScheduleChange, onAutoSaveChange,
  onEnhance, onGenerateVariations, onApplyVariation,
}: {
  targetItem: IngestionItem | null;
  style: TikTokStyle;
  caption: string;
  hashtags: string[];
  charCount: number;
  charPercent: number;
  nearLimit: boolean;
  maxChars: number;
  selectedCount: number;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  variationMode: boolean;
  variations: string[];
  enhancing: string | null;
  hasDisclosure: boolean;
  hashtagCount: number;
  captionOnlyLen: number;
  isTooShort: boolean;
  qualityScore: number;
  hashtagSearch: string;
  customHashtag: string;
  schedule: string;
  autoSave: boolean;
  filteredHashtagPool: string[];
  onStyleChange: (s: TikTokStyle) => void;
  onCaptionChange: (s: string) => void;
  onRegenerate: () => void;
  onToggleHashtag: (tag: string) => void;
  onInsertHashtag: (tag: string) => void;
  onSave: () => void;
  onCopy: () => void;
  onBulkGenerate: () => void;
  onClose: () => void;
  onHashtagSearchChange: (v: string) => void;
  onCustomHashtagChange: (v: string) => void;
  onAddCustomHashtag: () => void;
  onScheduleChange: (v: string) => void;
  onAutoSaveChange: (v: boolean) => void;
  onEnhance: (action: "expand" | "shorten" | "emojify") => void;
  onGenerateVariations: () => void;
  onApplyVariation: (content: string) => void;
}) {
  const barColor = nearLimit ? "bg-red-500" : charPercent > 70 ? "bg-amber-500" : "bg-emerald-500";
  const barColorBg = nearLimit ? "bg-red-100" : "bg-slate-100";

  return (
    <section className="rounded-2xl border-2 border-black/10 bg-gradient-to-br from-black via-zinc-900 to-zinc-800 p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <div>
            <h2 className="text-lg font-bold text-white">TikTok Post Composer</h2>
            <p className="text-xs text-white/50">
              {targetItem
                ? `กำลังเขียนสำหรับ: ${targetItem.title ?? "สินค้าที่เลือก"}`
                : selectedCount > 0
                  ? `เขียนสำหรับ ${selectedCount} รายการที่เลือก (สร้างแบบกลุ่ม)`
                  : "เลือกรายการจาก queue ด้านล่างก่อน"}
            </p>
            {targetItem?.price ? <p className="text-sm font-semibold text-emerald-400">฿{targetItem.price.toLocaleString("th-TH")}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-white/50">
            <span>Auto-save</span>
            <button onClick={() => onAutoSaveChange(!autoSave)}
              className={`font-semibold ${autoSave ? "text-emerald-400" : "text-white/30"}`}>
              {autoSave ? "ON" : "OFF"}
            </button>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/20">ปิด</button>
        </div>
      </div>

      {variationMode && variations.length > 0 ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">🎬 เลือกรูปแบบที่ชอบ</p>
            <button onClick={() => onApplyVariation(caption)} className="text-xs text-white/50 hover:text-white/70">ยกเลิก</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {variations.map((content, idx) => {
              const varStyles: TikTokStyle[] = ["review", "recommend", "promotion"];
              const varStyle = varStyles[idx] ?? "review";
              return (
                <button key={idx} onClick={() => onApplyVariation(content)}
                  className="group relative rounded-xl border border-white/10 bg-black/40 p-3 text-left transition-all hover:border-white/30 hover:bg-black/60">
                  <span className="mb-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                    {tiktokStyleEmojis[varStyle]} {tiktokStyleLabels[varStyle]}
                  </span>
                  <p className="line-clamp-6 text-[11px] leading-5 text-white/60 group-hover:text-white/80">{content}</p>
                  <span className="mt-2 block text-[10px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100">ใช้แบบนี้ →</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(tiktokStyleLabels) as [TikTokStyle, string][]).map(([key, label]) => (
                <button key={key} onClick={() => { onStyleChange(key); }}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    style === key
                      ? "border-white/30 bg-white/20 text-white shadow-md"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                  }`}>
                  {tiktokStyleEmojis[key]} {label}
                </button>
              ))}
              <button onClick={onRegenerate} disabled={enhancing !== null}
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/60 hover:border-white/20 hover:text-white/80 disabled:opacity-40">
                🔄 สร้างใหม่
              </button>
              <button onClick={onGenerateVariations}
                className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-500/20">
                🎲 3 รูปแบบ
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(["expand", "shorten", "emojify"] as const).map((action) => {
                const labels: Record<string, string> = { expand: "📖 ขยายความ", shorten: "✂️ ย่อ", emojify: "😊 เพิ่มอีโมจิ" };
                const loading = enhancing === action;
                return (
                  <button key={action} onClick={() => onEnhance(action)} disabled={loading || !caption.trim()}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/50 hover:border-white/20 hover:text-white/70 disabled:opacity-30">
                    {loading ? "⏳..." : labels[action]}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <textarea ref={textareaRef}
                className="min-h-48 w-full rounded-xl border border-white/10 bg-black/40 p-4 font-sans text-sm leading-6 text-white placeholder-white/30 outline-none focus:border-white/30"
                placeholder="เขียน TikTok caption ของคุณ..."
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-24 rounded-full ${barColorBg}`}>
                    <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${charPercent}%` }} />
                  </div>
                  <div className="flex gap-3 text-[10px] text-white/40">
                    <span>📝 {captionOnlyLen}</span>
                    <span>#️⃣ {hashtagCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    qualityScore >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                    qualityScore >= 50 ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {qualityScore >= 80 ? "✅" : qualityScore >= 50 ? "⚠️" : "❌"} Quality {qualityScore}/100
                  </div>
                  <span className={`font-semibold tabular-nums ${nearLimit ? "text-red-400" : "text-white/50"}`}>
                    {charCount.toLocaleString()}/{maxChars.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">แนะนำ Hashtag</p>
              <p className="mt-0.5 text-[10px] text-white/30">คลิกเพื่อเปิด/ปิด — คลิกขวาเพื่อแทรก</p>
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[10px] text-white placeholder-white/20 outline-none focus:border-white/20"
                placeholder="ค้นหา hashtag..."
                value={hashtagSearch}
                onChange={(e) => onHashtagSearchChange(e.target.value)}
              />
              <div className="mt-2 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                {filteredHashtagPool.map((tag) => {
                  const active = hashtags.includes(tag);
                  return (
                    <button key={tag} onClick={() => onToggleHashtag(tag)}
                      onContextMenu={(e) => { e.preventDefault(); onInsertHashtag(tag); }}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-semibold transition-all ${
                        active
                          ? "border-white/30 bg-white/20 text-white"
                          : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70"
                      }`}
                      title="คลิกขวาเพื่อแทรกที่ตำแหน่งเคอร์เซอร์">
                      {tag}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-1.5">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[10px] text-white placeholder-white/20 outline-none focus:border-white/20"
                  placeholder="เพิ่ม hashtag เอง..."
                  value={customHashtag}
                  onChange={(e) => onCustomHashtagChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddCustomHashtag(); } }}
                />
                <button onClick={onAddCustomHashtag} disabled={!customHashtag.trim()}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 text-[10px] font-semibold text-white/60 hover:bg-white/20 disabled:opacity-30">
                  +
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-white/20">เลือกสูงสุด 8 hashtag • กด Enter เพื่อเพิ่ม</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">คุณภาพ</p>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={hasDisclosure ? "text-emerald-400" : "text-red-400"}>
                    {hasDisclosure ? "✅" : "❌"}
                  </span>
                  <span className={hasDisclosure ? "text-white/60" : "text-red-300"}>Disclosure</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={hashtagCount >= 3 ? "text-emerald-400" : "text-amber-400"}>
                    {hashtagCount >= 3 ? "✅" : "⚠️"}
                  </span>
                  <span className="text-white/60">{hashtagCount} hashtags (แนะนำ 3-8)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={isTooShort && caption.length > 0 ? "text-amber-400" : "text-emerald-400"}>
                    {isTooShort ? "⚠️" : "✅"}
                  </span>
                  <span className="text-white/60">{isTooShort ? "เนื้อหาสั้นเกินไป (แนะนำ 50+ ตัวอักษร)" : "ความยาวเหมาะสม"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-white/40">📅 กำหนดโพสต์</span>
                <input type="datetime-local"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white/70 outline-none focus:border-white/20"
                  value={schedule}
                  onChange={(e) => onScheduleChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={onSave} disabled={!targetItem || !caption.trim()}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black disabled:opacity-40 hover:bg-white/90">
                💾 Save Draft
              </button>
              <button onClick={onCopy} disabled={!caption.trim()}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-white/20">
                📋 Copy
              </button>
              {selectedCount > 0 ? (
                <button onClick={onBulkGenerate}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20">
                  🎬 สร้าง {selectedCount} drafts
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Header({
  autoRefresh, onToggleAutoRefresh, onRefresh, loading, viewMode, onViewModeChange, onExport,
}: {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  loading: boolean;
  viewMode: "list" | "kanban";
  onViewModeChange: (v: "list" | "kanban") => void;
  onExport: (() => void) | undefined;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Phase 034 · Real Database</p>
        <h1 className="text-2xl font-bold text-slate-950">Shopee Affiliate Control Center</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Import, review, approve, and publish Shopee affiliate links from your real PostgreSQL database.
          Supports manual URLs, CSV/TSV upload, social draft generation, batch operations, and TikTok posts.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
          <span className={`inline-block h-2 w-2 rounded-full ${autoRefresh ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className="text-slate-600">Auto</span>
          <button onClick={onToggleAutoRefresh} className="font-semibold text-slate-800 hover:text-slate-950">
            {autoRefresh ? "ON" : "OFF"}
          </button>
        </div>
        <button onClick={onRefresh} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
          {loading ? "..." : "Refresh"}
        </button>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button onClick={() => onViewModeChange("list")}
            className={`px-3 py-1.5 font-semibold ${viewMode === "list" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
            List
          </button>
          <button onClick={() => onViewModeChange("kanban")}
            className={`px-3 py-1.5 font-semibold ${viewMode === "kanban" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
            Pipeline
          </button>
        </div>
        <a className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900" href="https://affiliate.shopee.co.th/" target="_blank" rel="noreferrer">Open Shopee Affiliate Portal</a>
        <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard/templates">Create social post</a>
        {onExport ? (
          <button onClick={onExport} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            Export CSV
          </button>
        ) : null}
      </div>
    </header>
  );
}

function StatsBar({ summary, activeStatus, onStatusClick }: { summary: Summary; activeStatus: string; onStatusClick: (s: string) => void }) {
  const items = [
    { key: "all", label: "All", count: Object.values(summary).reduce((a, b) => a + b, 0) },
    { key: "pending_review", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "imported", label: "Imported" },
    { key: "rejected", label: "Rejected" },
    { key: "failed", label: "Failed" },
  ];
  return (
    <section className="grid gap-3 md:grid-cols-6">
      {items.map(({ key, label }) => {
        const value = key === "all" ? Object.values(summary).reduce((a, b) => a + b, 0) : (summary[key] ?? 0);
        return (
          <button key={key} onClick={() => onStatusClick(key)}
            className={`rounded-2xl border p-4 text-left shadow-sm transition-all hover:shadow-md ${activeStatus === key ? "border-orange-400 bg-orange-50 ring-2 ring-orange-200" : "border-slate-200 bg-white"}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-black ${value > 0 ? "text-slate-950" : "text-slate-300"}`}>{value}</p>
          </button>
        );
      })}
    </section>
  );
}

function ComplianceBanner() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Compliance-safe automation</p>
      <p className="mt-1">ไม่มี auto-login, ไม่เก็บ password/cookie/session/localStorage, ไม่ scrape private dashboard, ไม่ bypass CAPTCHA/anti-bot และไม่เรียก private endpoint ไม่มี auto-publish ไปยังโซเชียล ทุก draft ต้องให้ผู้ใช้ตรวจทานและโพสต์เอง</p>
    </section>
  );
}

function SearchBar({
  search, onSearchChange, showBulkUrlInput, onToggleBulkUrl,
  hasSelected, selectedCount, onBatchAct, onBatchDraft, socialChannel, onOpenTiktok, onOpenFacebook,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  showBulkUrlInput: boolean;
  onToggleBulkUrl: () => void;
  hasSelected: boolean;
  selectedCount: number;
  onBatchAct: (action: "approve" | "reject" | "import") => void;
  onBatchDraft: () => void;
  socialChannel: SocialChannel;
  onOpenTiktok: () => void;
  onOpenFacebook: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-0 flex-1">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm" placeholder="Search by title, URL, source, or ID..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      <button onClick={onToggleBulkUrl} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
        {showBulkUrlInput ? "Close bulk paste" : "+ Bulk paste URLs"}
      </button>
      {hasSelected ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5">
          <span className="text-xs font-semibold text-orange-900">{selectedCount} selected</span>
          <button onClick={() => onBatchAct("approve")} className="rounded-lg border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-200">Approve</button>
          <button onClick={() => onBatchAct("reject")} className="rounded-lg border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-900 hover:bg-red-200">Reject</button>
          <button onClick={() => onBatchAct("import")} className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800">Import</button>
          <button onClick={onOpenTiktok} className="rounded-lg bg-black px-2.5 py-1 text-xs font-semibold text-white hover:bg-zinc-800">🎬 TikTok</button>
          <button onClick={onOpenFacebook} className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700">📱 Facebook</button>
        </div>
      ) : null}
    </div>
  );
}

function BulkUrlForm({ value, onChange, onSubmit, onCancel }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-blue-950">Paste multiple URLs</h3>
          <p className="text-xs text-blue-800">One per line, or affiliate_url,product_url per line. Each will be saved as a pending review item.</p>
        </div>
        <button type="button" onClick={onCancel} className="text-xs text-blue-700 hover:text-blue-900">Cancel</button>
      </div>
      <textarea className="mt-3 min-h-28 w-full rounded-xl border border-blue-200 p-3 font-mono text-xs" placeholder={`https://shopee.co.th/product/123\nhttps://shopee.co.th/product/456,https://shopee.co.th/product/456\n...`} value={value} onChange={(e) => onChange(e.target.value)} />
      <button className="mt-2 rounded-xl bg-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900">Import all URLs</button>
    </form>
  );
}

function ManualForm({ manual, onChange, onSubmit }: {
  manual: { affiliateUrl: string; productUrl: string; title: string; campaignNote: string; price: string };
  onChange: (v: typeof manual) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">เพิ่มจาก URL</h2>
        <p className="text-sm text-slate-600">ระบบจะ validate Shopee HTTPS allowlist และเก็บลง DB เป็น pending review</p>
      </div>
      <input className="w-full rounded-xl border p-2 text-sm" placeholder="Affiliate URL" value={manual.affiliateUrl} onChange={(e) => onChange({ ...manual, affiliateUrl: e.target.value })} required />
      <input className="w-full rounded-xl border p-2 text-sm" placeholder="Product URL" value={manual.productUrl} onChange={(e) => onChange({ ...manual, productUrl: e.target.value })} required />
      <input className="w-full rounded-xl border p-2 text-sm" placeholder="Title optional" value={manual.title} onChange={(e) => onChange({ ...manual, title: e.target.value })} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="w-full rounded-xl border p-2 text-sm" placeholder="Campaign note" value={manual.campaignNote} onChange={(e) => onChange({ ...manual, campaignNote: e.target.value })} />
        <input className="w-full rounded-xl border p-2 text-sm" placeholder="Price" inputMode="decimal" value={manual.price} onChange={(e) => onChange({ ...manual, price: e.target.value })} />
      </div>
      <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save URL to real DB</button>
    </form>
  );
}

function CsvForm({ csv, onChange, onFileChange, onSubmit, selectedFileName, importProductsFromCsv, onToggleImport }: {
  csv: string;
  onChange: (v: string) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  selectedFileName: string | null;
  importProductsFromCsv: boolean;
  onToggleImport: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">Upload/Paste CSV or TSV</h2>
        <p className="text-sm text-slate-600">รองรับ Product Feed header ภาษาไทย และไฟล์ {spGlobalCategoryFileName}</p>
      </div>
      <label className="block rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
        <span className="font-semibold">Import {spGlobalCategoryFileName}</span>
        <span className="mt-1 block text-xs">เลือกไฟล์ CSV จาก Shopee Product Feed แล้วระบบจะโหลดข้อมูลเข้า preview box โดยยังไม่สร้างสินค้าจนกดปุ่มด้านล่าง</span>
        <input className="mt-3 block w-full text-xs" type="file" accept=".csv,text/csv,.tsv,text/tab-separated-values" onChange={onFileChange} />
      </label>
      {selectedFileName ? <p className="text-xs text-slate-500">Selected: {selectedFileName}</p> : null}
      <label className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
        <input className="mt-1" type="checkbox" checked={importProductsFromCsv} onChange={onToggleImport} />
        <span><strong>สร้างสินค้าเข้าฐานข้อมูลทันทีหลัง validate</strong><br /><span className="text-xs">เปิดไว้เพื่อให้ปุ่มนี้ save queue + import เป็น Product/AffiliateLink เลย ปิดไว้ถ้าต้องการตรวจทานทีละรายการก่อน</span></span>
      </label>
      <textarea className="min-h-52 w-full rounded-xl border p-2 font-mono text-xs" value={csv} onChange={(e) => onChange(e.target.value)} />
      <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{importProductsFromCsv ? "Preview + Save + Import Products to DB" : "Preview + Save CSV/TSV rows to Review Queue"}</button>
    </form>
  );
}

function ListView({
  items, loading, busyIds, selected, onToggleSelect, onAct,
  socialChannel, draftsById, onDraftContentChange, onCreateDraft, onSaveDraft, onCopyDraft,
  onSelectAll, allSelected, onOpenTiktok, onOpenFacebook,
}: {
  items: IngestionItem[];
  loading: boolean;
  busyIds: Set<string>;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onAct: (id: string, action: "approve" | "reject" | "import") => void;
  socialChannel: SocialChannel;
  draftsById: Record<string, { draftId: string; content: string }>;
  onDraftContentChange: React.Dispatch<React.SetStateAction<Record<string, { draftId: string; content: string }>>>;
  onCreateDraft: (item: IngestionItem) => void;
  onSaveDraft: (item: IngestionItem, content: string) => void;
  onCopyDraft: (item: IngestionItem) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onOpenTiktok: (id: string) => void;
  onOpenFacebook: (id: string) => void;
}) {
  if (loading) return <p className="text-sm text-slate-600">กำลังโหลดข้อมูลจาก DB...</p>;
  if (!items.length) return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-600">ยังไม่มีรายการใน DB queue</p>;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold">Real Database Queue ({items.length})</h2>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          <input type="checkbox" checked={allSelected} onChange={onSelectAll} />
          Select all
        </label>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const isBusy = busyIds.has(item.id);
          const isSelected = selected.has(item.id);
          return (
            <article key={item.id} className={`rounded-2xl border p-4 transition-all ${isSelected ? "border-orange-300 bg-orange-50/50" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(item.id)} className="shrink-0" />
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{item.source}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[item.status] ?? "bg-slate-100 text-slate-700"}`}>{statusLabels[item.status] ?? item.status}</span>
                    {item.productId ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">product linked</span> : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-950">{item.title ?? "Shopee Affiliate Import"}</h3>
                  <p className="mt-1 break-all text-xs text-slate-500">Affiliate: {item.affiliateUrl}</p>
                  <p className="break-all text-xs text-slate-500">Product: {item.productUrl}</p>
                  {item.errorSummary ? <p className="mt-1 text-xs text-red-700">{item.errorSummary}</p> : null}
                  {draftsById[item.id] ? (
                    <textarea className="mt-3 min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"
                      value={draftsById[item.id].content}
                      onChange={(e) => {
                        onDraftContentChange((current) => ({ ...current, [item.id]: { ...(current[item.id] ?? { draftId: "", content: "" }), content: e.target.value } }));
                      }}
                      onBlur={(e) => void onSaveDraft(item, e.target.value)}
                    />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={isBusy || item.status !== "pending_review"} onClick={() => onAct(item.id, "approve")}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Approve</button>
                  <button disabled={isBusy || item.status === "imported"} onClick={() => onAct(item.id, "reject")}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Reject</button>
                  <button disabled={isBusy || item.status === "imported" || item.status === "rejected"} onClick={() => onAct(item.id, "import")}
                    className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-white disabled:opacity-40">Import</button>
                  <button onClick={() => onOpenTiktok(item.id)}
                    className="rounded-lg bg-black px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800">🎬 TikTok</button>
                  <button onClick={() => onOpenFacebook(item.id)}
                    className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">📱 Facebook</button>
                  <button disabled={item.status === "rejected" || !item.affiliateUrl} onClick={() => onCreateDraft(item)}
                    className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-900 disabled:opacity-40">Draft</button>
                  <button disabled={item.status === "rejected" || !item.affiliateUrl} onClick={() => onCopyDraft(item)}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Copy</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FacebookQuickComposerCard({ selectedCount, onOpen }: { selectedCount: number; onOpen: () => void }) {
  return (
    <button onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-left shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:brightness-110 hover:[border-image:linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)_1]">
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-cyan-500/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-cyan-500/20 group-hover:opacity-100" />
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/50">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {selectedCount > 0 ? `${selectedCount} selected` : "พร้อมใช้งาน"}
      </div>
      <div className="absolute -right-6 -top-6 text-6xl opacity-[0.08]">📱</div>
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">📱</span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Facebook Post</span>
            <p className="text-[10px] text-white/30">Shopee Affiliate • Thai Captions</p>
          </div>
        </div>
        <p className="mt-3 text-xl font-bold text-white">
          {selectedCount > 0 ? `สร้าง ${selectedCount} Facebook posts` : "สร้าง Facebook Post"}
        </p>
        <p className="mt-1 text-sm leading-5 text-white/60">
          {selectedCount > 0
            ? `กดเพื่อสร้าง Facebook drafts แบบกลุ่ม ${selectedCount} รายการ`
            : "โพสต์ Facebook แบบไทย รองรับ Page, ส่วนตัว, ผู้สนับสนุน, Content Monetization"}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">📄 เพจ</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">👤 ส่วนตัว</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">⭐ ผู้สนับสนุน</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">💎 สร้างรายได้</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-purple-500/20">🎲 3 รูปแบบ</span>
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300 ring-1 ring-blue-500/20">📖 ขยาย/ย่อ</span>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-500/20">😊 เพิ่มอีโมจิ</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20">✅ ตรวจคุณภาพ</span>
          <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 ring-1 ring-cyan-500/20">📅 กำหนดโพสต์</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/40 group-hover:text-white/60">
          <span>คลิกเพื่อเริ่ม →</span>
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </div>
      </div>
    </button>
  );
}

function FacebookPostComposer({
  targetItem, mode, caption, hashtags, charCount, charPercent, nearLimit, maxChars,
  selectedCount, textareaRef, variationMode, variations, enhancing, hasDisclosure, hashtagCount,
  captionOnlyLen, isTooShort, qualityScore, hashtagSearch, customHashtag, schedule, autoSave,
  filteredHashtagPool,
  onModeChange, onCaptionChange, onRegenerate,
  onToggleHashtag, onInsertHashtag,
  onSave, onCopy, onBulkGenerate, onClose,
  onHashtagSearchChange, onCustomHashtagChange, onAddCustomHashtag,
  onScheduleChange, onAutoSaveChange,
  onEnhance, onGenerateVariations, onApplyVariation,
}: {
  targetItem: IngestionItem | null;
  mode: FacebookMode;
  caption: string;
  hashtags: string[];
  charCount: number;
  charPercent: number;
  nearLimit: boolean;
  maxChars: number;
  selectedCount: number;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  variationMode: boolean;
  variations: string[];
  enhancing: string | null;
  hasDisclosure: boolean;
  hashtagCount: number;
  captionOnlyLen: number;
  isTooShort: boolean;
  qualityScore: number;
  hashtagSearch: string;
  customHashtag: string;
  schedule: string;
  autoSave: boolean;
  filteredHashtagPool: string[];
  onModeChange: (m: FacebookMode) => void;
  onCaptionChange: (s: string) => void;
  onRegenerate: () => void;
  onToggleHashtag: (tag: string) => void;
  onInsertHashtag: (tag: string) => void;
  onSave: () => void;
  onCopy: () => void;
  onBulkGenerate: () => void;
  onClose: () => void;
  onHashtagSearchChange: (v: string) => void;
  onCustomHashtagChange: (v: string) => void;
  onAddCustomHashtag: () => void;
  onScheduleChange: (v: string) => void;
  onAutoSaveChange: (v: boolean) => void;
  onEnhance: (action: "expand" | "shorten" | "emojify") => void;
  onGenerateVariations: () => void;
  onApplyVariation: (content: string) => void;
}) {
  const barColor = nearLimit ? "bg-red-500" : charPercent > 70 ? "bg-amber-500" : "bg-blue-500";
  const barColorBg = nearLimit ? "bg-red-100" : "bg-blue-100";

  return (
    <section className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <h2 className="text-lg font-bold text-white">Facebook Post Composer</h2>
            <p className="text-xs text-white/50">
              {targetItem
                ? `กำลังเขียนสำหรับ: ${targetItem.title ?? "สินค้าที่เลือก"}`
                : selectedCount > 0
                  ? `เขียนสำหรับ ${selectedCount} รายการที่เลือก (สร้างแบบกลุ่ม)`
                  : "เลือกรายการจาก queue ด้านล่างก่อน"}
            </p>
            {targetItem?.price ? <p className="text-sm font-semibold text-emerald-400">฿{targetItem.price.toLocaleString("th-TH")}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-white/50">
            <span>Auto-save</span>
            <button onClick={() => onAutoSaveChange(!autoSave)}
              className={`font-semibold ${autoSave ? "text-emerald-400" : "text-white/30"}`}>
              {autoSave ? "ON" : "OFF"}
            </button>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/20">ปิด</button>
        </div>
      </div>

      {variationMode && variations.length > 0 ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">📱 เลือกรูปแบบที่ชอบ</p>
            <button onClick={() => onApplyVariation(caption)} className="text-xs text-white/50 hover:text-white/70">ยกเลิก</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {variations.map((content, idx) => {
              const varModes: FacebookMode[] = ["page", "individual", "supporters"];
              const varMode = varModes[idx] ?? "page";
              return (
                <button key={idx} onClick={() => onApplyVariation(content)}
                  className="group relative rounded-xl border border-white/10 bg-black/40 p-3 text-left transition-all hover:border-white/30 hover:bg-black/60">
                  <span className="mb-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                    {facebookModeEmojis[varMode]} {facebookModeLabels[varMode]}
                  </span>
                  <p className="line-clamp-6 text-[11px] leading-5 text-white/60 group-hover:text-white/80">{content}</p>
                  <span className="mt-2 block text-[10px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100">ใช้แบบนี้ →</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(facebookModeLabels) as [FacebookMode, string][]).map(([key, label]) => (
                <button key={key} onClick={() => { onModeChange(key); }}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    mode === key
                      ? "border-white/30 bg-white/20 text-white shadow-md"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                  }`}>
                  {facebookModeEmojis[key]} {label}
                </button>
              ))}
              <button onClick={onRegenerate} disabled={enhancing !== null}
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/60 hover:border-white/20 hover:text-white/80 disabled:opacity-40">
                🔄 สร้างใหม่
              </button>
              <button onClick={onGenerateVariations}
                className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-500/20">
                🎲 3 รูปแบบ
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs font-semibold text-white/50">โหมด: {facebookModeEmojis[mode]} {facebookModeLabels[mode]}</p>
              <p className="mt-0.5 text-[10px] text-white/30">{facebookModeDescriptions[mode]}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(["expand", "shorten", "emojify"] as const).map((action) => {
                const labels: Record<string, string> = { expand: "📖 ขยายความ", shorten: "✂️ ย่อ", emojify: "😊 เพิ่มอีโมจิ" };
                const loading = enhancing === action;
                return (
                  <button key={action} onClick={() => onEnhance(action)} disabled={loading || !caption.trim()}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/50 hover:border-white/20 hover:text-white/70 disabled:opacity-30">
                    {loading ? "⏳..." : labels[action]}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <textarea ref={textareaRef}
                className="min-h-48 w-full rounded-xl border border-white/10 bg-black/40 p-4 font-sans text-sm leading-6 text-white placeholder-white/30 outline-none focus:border-white/30"
                placeholder="เขียน Facebook post ของคุณ..."
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-24 rounded-full ${barColorBg}`}>
                    <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${charPercent}%` }} />
                  </div>
                  <div className="flex gap-3 text-[10px] text-white/40">
                    <span>📝 {captionOnlyLen}</span>
                    <span>#️⃣ {hashtagCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    qualityScore >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                    qualityScore >= 50 ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {qualityScore >= 80 ? "✅" : qualityScore >= 50 ? "⚠️" : "❌"} Quality {qualityScore}/100
                  </div>
                  <span className={`font-semibold tabular-nums ${nearLimit ? "text-red-400" : "text-white/50"}`}>
                    {charCount.toLocaleString()}/{maxChars.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">แนะนำ Hashtag</p>
              <p className="mt-0.5 text-[10px] text-white/30">คลิกเพื่อเปิด/ปิด — คลิกขวาเพื่อแทรก</p>
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[10px] text-white placeholder-white/20 outline-none focus:border-white/20"
                placeholder="ค้นหา hashtag..."
                value={hashtagSearch}
                onChange={(e) => onHashtagSearchChange(e.target.value)}
              />
              <div className="mt-2 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                {filteredHashtagPool.map((tag) => {
                  const active = hashtags.includes(tag);
                  return (
                    <button key={tag} onClick={() => onToggleHashtag(tag)}
                      onContextMenu={(e) => { e.preventDefault(); onInsertHashtag(tag); }}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-semibold transition-all ${
                        active
                          ? "border-white/30 bg-white/20 text-white"
                          : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70"
                      }`}
                      title="คลิกขวาเพื่อแทรกที่ตำแหน่งเคอร์เซอร์">
                      {tag}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-1.5">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[10px] text-white placeholder-white/20 outline-none focus:border-white/20"
                  placeholder="เพิ่ม hashtag เอง..."
                  value={customHashtag}
                  onChange={(e) => onCustomHashtagChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddCustomHashtag(); } }}
                />
                <button onClick={onAddCustomHashtag} disabled={!customHashtag.trim()}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 text-[10px] font-semibold text-white/60 hover:bg-white/20 disabled:opacity-30">
                  +
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-white/20">เลือกสูงสุด 8 hashtag • กด Enter เพื่อเพิ่ม</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">คุณภาพ</p>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={hasDisclosure ? "text-emerald-400" : "text-red-400"}>
                    {hasDisclosure ? "✅" : "❌"}
                  </span>
                  <span className={hasDisclosure ? "text-white/60" : "text-red-300"}>Disclosure</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={hashtagCount >= 3 ? "text-emerald-400" : "text-amber-400"}>
                    {hashtagCount >= 3 ? "✅" : "⚠️"}
                  </span>
                  <span className="text-white/60">{hashtagCount} hashtags (แนะนำ 3-8)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={isTooShort && caption.length > 0 ? "text-amber-400" : "text-emerald-400"}>
                    {isTooShort ? "⚠️" : "✅"}
                  </span>
                  <span className="text-white/60">{isTooShort ? "เนื้อหาสั้นเกินไป (แนะนำ 50+ ตัวอักษร)" : "ความยาวเหมาะสม"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-white/40">📅 กำหนดโพสต์</span>
                <input type="datetime-local"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white/70 outline-none focus:border-white/20"
                  value={schedule}
                  onChange={(e) => onScheduleChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={onSave} disabled={!targetItem || !caption.trim()}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black disabled:opacity-40 hover:bg-white/90">
                💾 Save Draft
              </button>
              <button onClick={onCopy} disabled={!caption.trim()}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-white/20">
                📋 Copy
              </button>
              {selectedCount > 0 ? (
                <button onClick={onBulkGenerate}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20">
                  📱 สร้าง {selectedCount} drafts
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function KanbanView({
  items, busyIds, selected, onToggleSelect, onAct,
  socialChannel, draftsById, onCreateDraft, onSaveDraft, onCopyDraft,
  onSelectAll, allSelected, onOpenTiktok, onOpenFacebook,
}: {
  items: IngestionItem[];
  busyIds: Set<string>;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onAct: (id: string, action: "approve" | "reject" | "import") => void;
  socialChannel: SocialChannel;
  draftsById: Record<string, { draftId: string; content: string }>;
  onCreateDraft: (item: IngestionItem) => void;
  onSaveDraft: (item: IngestionItem, content: string) => void;
  onCopyDraft: (item: IngestionItem) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onOpenTiktok: (id: string) => void;
  onOpenFacebook: (id: string) => void;
}) {
  const columns = ["pending_review", "approved", "imported", "rejected", "failed"];

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold">Pipeline ({items.length})</h2>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          <input type="checkbox" checked={allSelected} onChange={onSelectAll} />
          Select all
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {columns.map((col) => {
          const colItems = items.filter((it) => it.status === col);
          return (
            <div key={col} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">{statusLabels[col] ?? col}</span>
                <span className="text-xs font-bold text-slate-400">{colItems.length}</span>
              </div>
              <div className="space-y-2">
                {colItems.map((item) => (
                  <div key={item.id} className={`rounded-xl border-2 p-3 text-xs ${selected.has(item.id) ? "border-orange-400 bg-orange-50" : "border-white bg-white shadow-sm"}`}>
                    <div className="flex items-start justify-between gap-1">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => onToggleSelect(item.id)} className="mt-0.5 shrink-0" />
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{item.source}</span>
                    </div>
                    <p className="mt-1.5 truncate font-semibold text-slate-950">{item.title ?? "Untitled"}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-400">{item.affiliateUrl}</p>
                    {item.price ? <p className="mt-0.5 font-semibold text-emerald-700">฿{item.price.toLocaleString("th-TH")}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.status === "pending_review" ? (
                        <>
                          <button disabled={busyIds.has(item.id)} onClick={() => onAct(item.id, "approve")}
                            className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 disabled:opacity-40">✓</button>
                          <button disabled={busyIds.has(item.id)} onClick={() => onAct(item.id, "reject")}
                            className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-800 disabled:opacity-40">✕</button>
                        </>
                      ) : item.status === "approved" ? (
                        <button disabled={busyIds.has(item.id)} onClick={() => onAct(item.id, "import")}
                          className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-white disabled:opacity-40">Import</button>
                      ) : null}
                      <button onClick={() => onOpenTiktok(item.id)}
                        className="rounded bg-black px-2 py-0.5 text-[10px] font-semibold text-white">🎬</button>
                      <button onClick={() => onOpenFacebook(item.id)}
                        className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">📱</button>
                      {item.affiliateUrl ? (
                        <button onClick={() => onCreateDraft(item)}
                          className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-800">Draft</button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {colItems.length === 0 ? (
                  <p className="py-6 text-center text-[10px] text-slate-400">No items</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
