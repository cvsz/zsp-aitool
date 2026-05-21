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

## SP Product Feed All Global Category import

The dashboard supports importing this operator-downloaded feed:

```text
SP-Product-Feed-All-Global-Category.csv
```

Safe flow:

1. Download `SP-Product-Feed-All-Global-Category.csv` manually from the Shopee Affiliate Product Feed area.
2. Open `/dashboard/shopee-affiliate`.
3. Use the dedicated `Import SP-Product-Feed-All-Global-Category.csv` file input.
4. The browser loads the file into the preview text box only.
5. Click `Preview + Save CSV/TSV rows to DB` to validate and persist rows into the review queue.
6. Review, approve, reject, or import rows from the real database queue.

Supported global-category CSV header families map to zsp fields:

| Product Feed header family | zsp field |
| --- | --- |
| affiliate url / affiliate link / tracking link / deeplink / short link / short url | affiliate_url |
| product url / product link / offer url / shop url / landing page / origin link | product_url |
| offer name / product name / item name / name / title | title |
| commission / commission rate / payout / campaign | campaign |
| global category / all global category / category / category name / main category | category |
| shop name / seller name | shop_name |
| price / sale price | price |

Category and shop fields are preserved inside the campaign note, for example:

```text
12% · หมวดหมู่: Beauty · ร้านค้า: Example Shop
```

Limits and safeguards:

- Maximum file size: 1 MB.
- Maximum rows per import: 1,000.
- CSV/TSV formula injection rows are rejected.
- Rows missing affiliate URL or product URL are rejected.
- URLs must pass the Shopee HTTPS allowlist.
- The file is not uploaded until the user clicks save.
- No cookie/session/password data is accepted.

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
- user-uploaded `SP-Product-Feed-All-Global-Category.csv`.
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
| ชื่อร้านค้า | shop_name |
| อัตราค่าคอมมิชชัน | campaign |
| ค่าคอมมิชชัน | campaign |
| ลิงก์ข้อเสนอ | product_url |
| ลิงก์สินค้า | product_url |
| ลิงก์ร้านค้า | product_url |
| ลิงก์สินค้า(สั้น) | affiliate_url |
| ลิงก์ร้านค้า(สั้น) | affiliate_url |
| ลิงก์สั้น | affiliate_url |
| หมวดหมู่ | category |
| หมวดหมู่สากล | category |

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
SHOPEE_SP_GLOBAL_CATEGORY_IMPORT_CONFIGURED=true
SHOPEE_SOCIAL_POSTING_GUIDE_CONFIGURED=true
```


SHOPEE_SOCIAL_DRAFTS_DB_FINAL_CONFIGURED=true
