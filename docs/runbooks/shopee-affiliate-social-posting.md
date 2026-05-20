# Shopee Affiliate Social Posting Runbook

This runbook documents the safe workflow for promoting Shopee Affiliate links through social media inside zsp-aitool.

Operator reference pages:

- Shopee Help: วิธีการโพสต์โปรโมตลิงก์ Affiliate ผ่านช่องทางโซเชียลมีเดีย
- Shopee Help: โปรแกรม Shopee Affiliate คืออะไร?

> These pages are operator-supplied references. Re-check the live Shopee Help Center before changing policy-sensitive copy.

## Product feed workflow

1. Log in to the official Shopee Affiliate platform manually.
2. Go to `Creative > Product Feed`.
3. Download the Product Feed file yourself.
4. Paste or upload the exported CSV/TSV data into zsp-aitool at `/dashboard/shopee-affiliate`.
5. Review pending rows in the real database queue.
6. Approve rows before importing them into `Product` and `AffiliateLink` records.

zsp-aitool must not automate Shopee Affiliate Portal login or scrape private dashboard pages.

## Social posting workflow

Use this safe sequence for each post:

1. Select an approved imported product or shop from the Shopee Affiliate queue.
2. Confirm the affiliate URL is an official Shopee URL or official Shopee short link.
3. Write a useful post that explains the product or offer clearly.
4. Add a visible affiliate disclosure.
5. Add the affiliate link or short link.
6. Publish only through the user's own social account or platform-approved scheduling flow.
7. Track performance using first-party zsp metrics and official Shopee reports where available.

## Required affiliate disclosure

Recommended Thai disclosure:

```text
โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ
```

Short version for limited-space channels:

```text
ลิงก์นี้เป็นลิงก์ Affiliate
```

## Suggested channel checklist

### Facebook / Threads / X

- Start with the product benefit or use case.
- Include clear price/commission language only if verified from the current feed or official report.
- Add the affiliate disclosure near the link.
- Avoid spam-style repetition.

### Instagram / TikTok / YouTube Shorts

- Use product demo, comparison, unboxing, tutorial, or review-style content.
- Add the affiliate disclosure in caption or visible description.
- Keep claims factual and supportable.
- Do not claim guaranteed results, guaranteed savings, or guaranteed income.

### Blog / website

- Include the affiliate disclosure before or near affiliate links.
- Keep product descriptions useful and accurate.
- Refresh outdated prices, stock, or promotion data.

## zsp-aitool implementation policy

Allowed:

- user-pasted affiliate links.
- user-uploaded Product Feed CSV/TSV.
- explicit user-triggered extension capture of visible page data.
- real PostgreSQL review-before-save queue.
- draft post generation.
- export/copy-to-clipboard for user review.

Forbidden:

- automated Shopee portal login.
- storing Shopee username/password.
- storing Shopee cookie, session, localStorage, sessionStorage, or browser credentials.
- scraping private dashboard pages.
- calling private or undocumented Shopee portal endpoints.
- bypassing CAPTCHA, anti-bot, login walls, device checks, or rate limits.
- fake reviews, fake conversions, or guaranteed income claims.
- auto-publishing to social platforms without explicit user action and platform-approved auth.

## Copy generation rules

Generated copy must:

- preserve affiliate disclosure.
- avoid misleading claims.
- avoid fake reviews or fake personal experience.
- avoid guaranteed income/savings claims.
- remain editable before posting.
- keep the affiliate URL visible or attached in a controlled field.

## Safe import mapping

Thai Shopee Product Feed headers map to zsp fields:

| Shopee Product Feed header | zsp field |
| --- | --- |
| ชื่อข้อเสนอ | title |
| ชื่อสินค้า | title |
| ชื่อร้านค้า | title |
| อัตราค่าคอมมิชชัน | campaign |
| ค่าคอมมิชชัน | campaign |
| ลิงก์ข้อเสนอ | product_url |
| ลิงก์สินค้า | product_url |
| ลิงก์ร้านค้า | product_url |
| ลิงก์สินค้า(สั้น) | affiliate_url |
| ลิงก์ร้านค้า(สั้น) | affiliate_url |
| ลิงก์สั้น | affiliate_url |

## Production verification

Run:

```bash
cd ~/zsp-aitool
bash start.sh
```

Expected markers:

```text
FULL_PRODUCTION_START_COMPLETED=true
SHOPEE_AFFILIATE_REAL_DB_ROUTES_CONFIGURED=true
SHOPEE_THAI_DATAFEED_IMPORT_CONFIGURED=true
SHOPEE_SOCIAL_POSTING_GUIDE_CONFIGURED=true
```
