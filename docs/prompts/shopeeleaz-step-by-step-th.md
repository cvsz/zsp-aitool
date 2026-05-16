ได้ครับ ด้านล่างคือ **ชุดคำสั่งตามลำดับ** สำหรับค่อย ๆ สั่ง AI Coding Agent ให้สร้าง Full Source Code ของ **ShopeeLeaz** แบบเป็นขั้นตอน ไม่มั่วโครงสร้าง และลดปัญหาโค้ดขาดไฟล์

---

# ชุดคำสั่งสร้าง Full Source Code ตามลำดับ

## คำสั่งที่ 0: ตั้งกติกาหลักของโปรเจกต์

ใช้คำสั่งนี้ก่อนเริ่มทุกอย่าง

```text
คุณคือ Senior Full-Stack Engineer และ Software Architect

ฉันต้องการสร้างโปรเจกต์ชื่อ ShopeeLeaz

ShopeeLeaz คือระบบช่วยคนทำ Shopee Affiliate ให้สามารถ:
1. เก็บข้อมูลสินค้า Shopee ได้ง่าย
2. บันทึกสินค้าไว้ในฐานข้อมูล
3. ใช้ AI สร้างโพสต์โปรโมตสำหรับ Facebook, Instagram, Threads, X
4. สร้างบทความสั้น บทความ SEO แคปชัน และคอมเมนต์
5. จัดการ Prompt Template
6. ใช้ OCR อ่านข้อมูลสินค้าจากภาพ
7. แนะนำสินค้าที่คล้ายกันจากสินค้าที่บันทึกไว้
8. มี Chrome Extension สำหรับเก็บข้อมูลสินค้าจากหน้าที่ผู้ใช้เปิดอยู่

Tech Stack:
- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Next.js API Routes
- Chrome Extension Manifest V3
- OpenAI-compatible AI Provider
- OCR Provider แบบเปลี่ยนได้
- Docker Compose

กติกาสำคัญ:
- ห้ามใช้ private Shopee API
- ห้าม bypass CAPTCHA
- ห้าม bypass login wall
- ห้าม scrape แบบหลบระบบป้องกัน
- เก็บเฉพาะข้อมูลที่ผู้ใช้เห็นบนหน้าเว็บและกดยืนยันเอง
- ห้ามสร้างรีวิวปลอม
- ห้ามแต่งข้อมูลสินค้าเกินจริง
- ต้องมี Affiliate disclosure ในคอนเทนต์
- โค้ดต้องรัน local ได้จริง

จากนี้ให้สร้างโปรเจกต์แบบเป็นลำดับ
ห้ามข้ามไฟล์สำคัญ
ห้ามตอบว่า “ทำต่อเอง”
ห้ามใช้ TODO ใน core feature
ทุกไฟล์ต้องระบุ path ชัดเจน
```

---

## คำสั่งที่ 1: วาง Architecture และ Folder Structure

```text
เริ่มจากออกแบบ Architecture ทั้งระบบของ ShopeeLeaz

ให้สร้าง:
1. ภาพรวมระบบ
2. โมดูลหลักทั้งหมด
3. Database design overview
4. API overview
5. Frontend pages overview
6. Chrome Extension overview
7. AI content generation flow
8. OCR flow
9. Product import flow
10. Security and compliance notes
11. Full folder structure

ยังไม่ต้องเขียนโค้ดจริง
ให้ตอบเป็นแผนและโครงสร้างไฟล์ก่อน
```

---

## คำสั่งที่ 2: สร้าง Project Setup

```text
สร้างไฟล์ setup เริ่มต้นของโปรเจกต์ ShopeeLeaz

ให้สร้างไฟล์ต่อไปนี้แบบสมบูรณ์:

- package.json
- tsconfig.json
- next.config.js
- tailwind.config.ts
- postcss.config.js
- .env.example
- .gitignore
- README.md เวอร์ชันเริ่มต้น
- docker-compose.yml
- Dockerfile
- prisma folder เริ่มต้น
- src folder เริ่มต้น

Requirements:
- ใช้ Next.js + TypeScript + Tailwind CSS
- รองรับ PostgreSQL
- รองรับ Prisma
- รองรับ Docker Compose
- มี script สำหรับ dev, build, start, lint, prisma migrate, prisma seed
- โครงสร้างต้องพร้อมต่อยอดโมดูลถัดไป

ให้แสดง code ทุกไฟล์พร้อม path
```

---

## คำสั่งที่ 3: สร้าง Prisma Schema และ Database Seed

```text
สร้าง Prisma schema และ seed data สำหรับ ShopeeLeaz

Models ที่ต้องมี:
- User
- Product
- ProductImage
- AffiliateLink
- ContentGeneration
- ContentTemplate
- PromptPreset
- OCRJob
- SimilarProduct
- PlatformPost
- UserSetting
- APIUsageLog

Requirements:
- User มีสินค้าได้หลายรายการ
- Product มี title, price, currency, originalUrl, affiliateUrl, shopName, rating, soldCount, description, category, images, rawMetadata
- ContentGeneration เก็บ platform, tone, language, prompt, output, tokenUsage, status
- OCRJob เก็บ imageUrl, extractedText, status, errorMessage
- SimilarProduct เชื่อม sourceProduct กับ relatedProduct
- มี enum สำหรับ platform, tone, language, status
- มี createdAt, updatedAt, deletedAt
- มี indexes ที่เหมาะสม
- มี seed data ภาษาไทยสำหรับ demo products, prompt templates, content history

ให้สร้าง:
- prisma/schema.prisma
- prisma/seed.ts
- คำสั่ง migration ที่ต้องใช้
```

---

## คำสั่งที่ 4: สร้าง Utility และ Shared Types

```text
สร้าง shared utilities และ TypeScript types สำหรับ ShopeeLeaz

ให้สร้างไฟล์:
- src/types/product.ts
- src/types/content.ts
- src/types/ai.ts
- src/types/ocr.ts
- src/types/api.ts
- src/lib/prisma.ts
- src/lib/env.ts
- src/lib/api-response.ts
- src/lib/errors.ts
- src/lib/validators.ts
- src/lib/slug.ts
- src/lib/format-price.ts
- src/lib/safe-json.ts

Requirements:
- มี type สำหรับ Product, Platform, ContentGeneration, AI response
- มี helper สำหรับ success/error response
- มี custom error class
- มี env validation
- มี Zod schema พื้นฐาน
- ใช้ TypeScript strict mode
```

---

## คำสั่งที่ 5: สร้างระบบ Auth

```text
สร้างระบบ Authentication สำหรับ ShopeeLeaz

Features:
- Register
- Login
- Logout
- Get current user
- Password hash
- Session หรือ JWT auth
- Auth middleware
- Protected API routes

ให้สร้างไฟล์:
- src/lib/auth.ts
- src/lib/password.ts
- src/middleware/auth-middleware.ts
- src/app/api/auth/register/route.ts
- src/app/api/auth/login/route.ts
- src/app/api/auth/logout/route.ts
- src/app/api/auth/me/route.ts
- src/hooks/useAuth.ts
- src/components/auth/LoginForm.tsx
- src/components/auth/RegisterForm.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx

Requirements:
- Validate input ด้วย Zod
- Password ต้อง hash
- ห้ามเก็บ plain password
- API response ต้องเป็นรูปแบบเดียวกัน
- มี error handling
```

---

## คำสั่งที่ 6: สร้าง Product Module

```text
สร้าง Product Module สำหรับ ShopeeLeaz

Features:
- เพิ่มสินค้าด้วย manual form
- import จาก URL
- import จาก browser extension payload
- import จาก JSON
- แก้ไขสินค้า
- ลบสินค้าแบบ soft delete
- ดูรายการสินค้า
- ดูรายละเอียดสินค้า
- ตรวจ duplicate จาก originalUrl
- จัดการรูปสินค้า
- จัดการ affiliate link

ให้สร้าง:
- src/services/ProductService.ts
- src/schemas/product.schema.ts
- src/app/api/products/route.ts
- src/app/api/products/[id]/route.ts
- src/app/api/products/import-url/route.ts
- src/app/api/products/import-json/route.ts
- src/app/api/products/extension-import/route.ts
- src/app/api/products/[id]/affiliate-link/route.ts
- src/components/products/ProductCard.tsx
- src/components/products/ProductForm.tsx
- src/components/products/ProductImportForm.tsx
- src/components/products/ProductGrid.tsx
- src/app/dashboard/products/page.tsx
- src/app/dashboard/products/new/page.tsx
- src/app/dashboard/products/[id]/page.tsx

Compliance:
- ห้าม scrape private endpoint
- URL import ให้เก็บ URL และให้ผู้ใช้กรอกหรือยืนยันข้อมูลเอง
- Extension payload ต้องเป็นข้อมูลที่ผู้ใช้เห็นและส่งมาเอง
- ต้อง validate ทุก input

ให้เขียน source code ทุกไฟล์
```

---

## คำสั่งที่ 7: สร้าง AI Provider และ Prompt Builder

```text
สร้าง AI Provider abstraction และ Prompt Builder สำหรับ ShopeeLeaz

Features:
- รองรับ OpenAI-compatible API
- แยก AIProvider interface
- มี mock provider สำหรับ local development
- สร้าง prompt ตาม platform
- ป้องกันการแต่งข้อมูลสินค้าเกินจริง
- บังคับใส่ affiliate disclosure
- รองรับภาษาไทยและอังกฤษ
- รองรับหลาย tone
- รองรับหลาย content length
- สร้างหลายเวอร์ชันได้

ให้สร้าง:
- src/services/ai/AIProvider.ts
- src/services/ai/OpenAICompatibleProvider.ts
- src/services/ai/MockAIProvider.ts
- src/services/ai/PromptBuilder.ts
- src/services/ai/ContentSafety.ts
- src/services/AIContentService.ts
- src/schemas/ai.schema.ts

Output format จาก AI:
{
  "platform": "",
  "headline": "",
  "caption": "",
  "hashtags": [],
  "cta": "",
  "affiliateDisclosure": "",
  "warnings": []
}

Rules:
- ห้ามสร้าง fake reviews
- ห้ามอ้างสรรพคุณเกินจริง
- ถ้าข้อมูลสินค้าไม่มี ให้เขียนแบบกลาง ๆ
- ต้องบอกว่าเป็นลิงก์ Affiliate หรือโพสต์โปรโมต
```

---

## คำสั่งที่ 8: สร้าง AI Content API

```text
สร้าง API สำหรับ AI Content Generation

Endpoints:
- POST /api/ai/generate
- POST /api/ai/generate-batch
- GET /api/content-history
- GET /api/content-history/[id]
- DELETE /api/content-history/[id]

Features:
- เลือกสินค้า
- เลือก platform
- เลือก tone
- เลือกภาษา
- เลือกจำนวนเวอร์ชัน
- ใส่ custom prompt เพิ่มได้
- บันทึก generation history ลง database
- เก็บ token usage ถ้ามี
- คืนค่า structured JSON
- รองรับ batch generation หลาย platform

ให้สร้าง:
- src/app/api/ai/generate/route.ts
- src/app/api/ai/generate-batch/route.ts
- src/app/api/content-history/route.ts
- src/app/api/content-history/[id]/route.ts
- src/components/ai/ContentGeneratorForm.tsx
- src/components/ai/GeneratedContentCard.tsx
- src/components/ai/PlatformSelector.tsx
- src/components/ai/ToneSelector.tsx
- src/app/dashboard/generator/page.tsx
- src/app/dashboard/content-history/page.tsx

Requirements:
- ใช้ ProductService และ AIContentService
- Validate input ด้วย Zod
- มี loading, error, empty state
- มี copy-to-clipboard
```

---

## คำสั่งที่ 9: สร้าง Prompt Template System

```text
สร้างระบบ Prompt Template สำหรับ ShopeeLeaz

Features:
- สร้าง template
- แก้ไข template
- ลบ template
- duplicate template
- restore default templates
- preview template ด้วย sample product
- ใช้ variables ใน template

Variables:
{{productTitle}}
{{price}}
{{description}}
{{rating}}
{{reviewSummary}}
{{affiliateLink}}
{{platform}}
{{tone}}
{{language}}
{{ctaStyle}}
{{hashtags}}

ให้สร้าง:
- src/services/PromptTemplateService.ts
- src/services/TemplateRenderer.ts
- src/schemas/template.schema.ts
- src/app/api/templates/route.ts
- src/app/api/templates/[id]/route.ts
- src/app/api/templates/[id]/duplicate/route.ts
- src/app/api/templates/restore-defaults/route.ts
- src/components/templates/PromptTemplateEditor.tsx
- src/components/templates/TemplatePreview.tsx
- src/components/templates/TemplateList.tsx
- src/app/dashboard/templates/page.tsx

Default templates ภาษาไทย:
- Facebook promotional post
- Instagram caption
- Threads short post
- X post
- Blog article
- SEO article
- Comment reply

ให้เขียน source code ครบทุกไฟล์
```

---

## คำสั่งที่ 10: สร้าง OCR Module

```text
สร้าง OCR Module สำหรับ ShopeeLeaz

Goal:
ให้ผู้ใช้อัปโหลดภาพ screenshot สินค้า แล้วระบบ OCR อ่านข้อความจากภาพ จากนั้นให้ผู้ใช้ตรวจและแก้ไขก่อนบันทึกสินค้า

Features:
- Upload image
- Run OCR
- Extract title, price, discount, rating, sold count, description snippets
- Show extracted text
- Show confidence score ถ้ามี
- ให้ผู้ใช้แก้ไขข้อมูลก่อน save
- เก็บ OCR job ลง database
- มี mock OCR provider สำหรับ local dev
- รองรับการเปลี่ยน OCR provider ในอนาคต

ให้สร้าง:
- src/services/ocr/OCRProvider.ts
- src/services/ocr/MockOCRProvider.ts
- src/services/OCRService.ts
- src/schemas/ocr.schema.ts
- src/app/api/ocr/extract/route.ts
- src/app/api/ocr/[id]/route.ts
- src/components/ocr/OCRUploadBox.tsx
- src/components/ocr/OCRResultReview.tsx
- src/app/dashboard/ocr/page.tsx

Rules:
- ห้ามบอกว่า OCR ถูกต้อง 100%
- ต้องให้ผู้ใช้ตรวจสอบข้อมูลก่อนบันทึกสินค้า
- ต้อง handle error อย่างเหมาะสม
```

---

## คำสั่งที่ 11: สร้าง Similar Product Module

```text
สร้าง Similar Product Recommendation Module สำหรับ ShopeeLeaz

Goal:
แนะนำสินค้าที่คล้ายกันจากสินค้าที่ผู้ใช้บันทึกไว้เอง

Features:
- เปรียบเทียบจาก category
- เปรียบเทียบจาก title keywords
- เปรียบเทียบจาก description keywords
- เปรียบเทียบจาก price range
- คำนวณ score 0-100
- อธิบายเหตุผลว่าทำไมถึงคล้ายกัน
- บันทึกผล recommendation
- ปุ่ม refresh recommendation

ให้สร้าง:
- src/services/SimilarProductService.ts
- src/lib/keyword-extractor.ts
- src/lib/price-similarity.ts
- src/lib/category-matcher.ts
- src/app/api/products/[id]/similar/route.ts
- src/app/api/products/[id]/similar-refresh/route.ts
- src/components/products/SimilarProductCard.tsx
- src/app/dashboard/products/[id]/similar/page.tsx

Rules:
- แนะนำจาก product library ของ user เท่านั้น
- ห้ามดึงข้อมูลสินค้าจากแหล่งภายนอกโดยไม่ได้รับอนุญาต
- ถ้ายังไม่มีสินค้ามากพอ ให้แสดง empty state
```

---

## คำสั่งที่ 12: สร้าง Dashboard Layout และ UI หลัก

```text
สร้าง Dashboard UI หลักของ ShopeeLeaz

Pages:
- Landing page
- Dashboard overview
- Product library
- Product detail
- Add product
- AI generator
- Content history
- Prompt templates
- OCR tools
- Similar products
- Settings

Components:
- AppLayout
- Sidebar
- MobileNav
- Header
- StatCard
- EmptyState
- LoadingSpinner
- CopyButton
- ExportButton
- ConfirmDialog
- Toast
- PlatformBadge
- PageTitle

Requirements:
- UI ภาษาไทยเป็นหลัก
- Responsive mobile-first
- SaaS dashboard style
- ใช้ Tailwind CSS
- มี loading state
- มี error state
- มี empty state
- มี toast notification
- ทุกหน้าต้องเชื่อมกับ API client

ให้สร้าง:
- src/app/page.tsx
- src/app/dashboard/page.tsx
- src/app/dashboard/layout.tsx
- src/components/layout/*
- src/components/ui/*
- src/lib/api-client.ts
- src/hooks/*
```

---

## คำสั่งที่ 13: สร้าง Export Module

```text
สร้าง Export Module สำหรับ ShopeeLeaz

Features:
- Export products เป็น CSV
- Export content history เป็น CSV
- Export content เป็น Markdown
- Export single generated content เป็น TXT
- Filter by platform
- Filter by date range

Endpoints:
- GET /api/export/products.csv
- GET /api/export/content.csv
- GET /api/export/content.md
- GET /api/export/content/[id].txt

ให้สร้าง:
- src/services/ExportService.ts
- src/lib/csv.ts
- src/lib/markdown.ts
- src/app/api/export/products.csv/route.ts
- src/app/api/export/content.csv/route.ts
- src/app/api/export/content.md/route.ts
- src/app/api/export/content/[id].txt/route.ts
- src/components/export/ExportPanel.tsx

Requirements:
- ต้องเช็ก user auth
- export เฉพาะข้อมูลของ user ตัวเอง
- handle empty data
```

---

## คำสั่งที่ 14: สร้าง Chrome Extension

```text
สร้าง Chrome Extension Manifest V3 สำหรับ ShopeeLeaz

Purpose:
ให้ผู้ใช้เก็บข้อมูลสินค้าจากหน้า Shopee ที่กำลังเปิดอยู่ แล้วส่งเข้า ShopeeLeaz web app

Compliance:
- ดึงเฉพาะข้อมูลที่มองเห็นได้ในหน้าเว็บ
- ห้ามใช้ private API
- ห้าม bypass login หรือ CAPTCHA
- ห้ามเก็บ private user data
- ต้องให้ผู้ใช้กดยืนยันก่อนส่งข้อมูล
- ต้องให้ผู้ใช้แก้ไขข้อมูลก่อนบันทึก

Features:
1. Popup UI
2. Collect product button
3. Detect current page URL
4. Extract visible product data:
   - title
   - price
   - image URLs
   - rating ถ้าเห็น
   - sold count ถ้าเห็น
   - description ถ้าเห็น
   - current page URL
5. Manual edit in popup
6. Send data to ShopeeLeaz API
7. Settings page สำหรับ API endpoint และ token
8. Success/error message
9. Quick generate Facebook post
10. Quick generate Instagram caption
11. Quick generate X post
12. Quick generate Threads post

ให้สร้าง:
- extension/manifest.json
- extension/package.json
- extension/vite.config.ts
- extension/src/popup.html
- extension/src/popup.ts
- extension/src/popup.css
- extension/src/content-script.ts
- extension/src/background.ts
- extension/src/options.html
- extension/src/options.ts
- extension/src/api-client.ts
- extension/src/types.ts
- extension/README.md

ให้เขียน source code ครบทุกไฟล์
```

---

## คำสั่งที่ 15: สร้าง Settings Page

```text
สร้าง Settings Module สำหรับ ShopeeLeaz

Features:
- ตั้งค่า AI Provider
- ตั้งค่า API Key ผ่าน environment เท่านั้น ไม่โชว์ key จริง
- ตั้งค่า default language
- ตั้งค่า default tone
- ตั้งค่า affiliate disclosure
- ตั้งค่า default hashtag preference
- ตั้งค่า default CTA style
- ตั้งค่า OCR provider
- ตั้งค่า profile เบื้องต้น

ให้สร้าง:
- src/services/UserSettingService.ts
- src/schemas/settings.schema.ts
- src/app/api/settings/route.ts
- src/components/settings/SettingsForm.tsx
- src/app/dashboard/settings/page.tsx

Security:
- ห้ามบันทึก secret API key ลง database แบบ plain text
- ให้ใช้ env var สำหรับ provider key
- UI แสดงเฉพาะสถานะว่า configured หรือ not configured
```

---

## คำสั่งที่ 16: สร้าง Tests

```text
สร้าง test suite สำหรับ ShopeeLeaz

ให้สร้าง tests สำหรับ:
- ProductService
- AIContentService
- PromptBuilder
- TemplateRenderer
- OCRService
- SimilarProductService
- ExportService
- Auth validation
- API route examples

ใช้:
- Vitest
- Testing Library สำหรับ React component
- Mock Prisma
- Mock AI Provider
- Mock OCR Provider

ให้สร้าง:
- vitest.config.ts
- tests/setup.ts
- tests/services/ProductService.test.ts
- tests/services/AIContentService.test.ts
- tests/services/PromptBuilder.test.ts
- tests/services/TemplateRenderer.test.ts
- tests/services/OCRService.test.ts
- tests/services/SimilarProductService.test.ts
- tests/services/ExportService.test.ts
- tests/api/products.test.ts
- tests/components/ProductCard.test.tsx

Requirements:
- Tests ต้องรันได้ด้วย npm run test
- อย่าเรียก AI API จริง
- อย่าเรียก OCR API จริง
```

---

## คำสั่งที่ 17: ตรวจสอบความสมบูรณ์ของ Source Code

```text
ตรวจสอบ source code ทั้งหมดของ ShopeeLeaz

ให้ตรวจ:
1. ไฟล์ไหนยังขาด
2. import path ไหนผิด
3. type ไหนไม่ตรง
4. Prisma model ตรงกับ service หรือไม่
5. API routes ครบหรือไม่
6. Frontend เรียก API ถูกหรือไม่
7. Extension ส่ง payload ตรง backend schema หรือไม่
8. env vars ครบหรือไม่
9. docker-compose ใช้งานได้หรือไม่
10. test scripts ครบหรือไม่
11. มี TODO ใน core feature หรือไม่
12. มี hardcoded API key หรือไม่
13. มีโค้ดที่เสี่ยงผิด compliance หรือไม่

จากนั้นให้แก้ไฟล์ที่ผิดทั้งหมด
แสดงเฉพาะไฟล์ที่ต้องแก้ พร้อม code เต็มของไฟล์นั้น
```

---

## คำสั่งที่ 18: สร้าง README ฉบับสมบูรณ์

```text
สร้าง README.md ฉบับสมบูรณ์สำหรับ ShopeeLeaz

ต้องมี:
- Project overview
- Features
- Tech stack
- Folder structure
- Local setup
- Environment variables
- Database setup
- Prisma migration
- Seed command
- Run development server
- Run tests
- Run with Docker Compose
- Chrome Extension setup
- AI Provider setup
- OCR Provider setup
- Affiliate compliance notes
- Security notes
- Troubleshooting
- Deployment guide
- Future roadmap

ภาษา README ใช้ภาษาอังกฤษ
แต่เพิ่ม section อธิบายการใช้งานภาษาไทยด้วย
```

---

## คำสั่งที่ 19: สร้าง Production Checklist

```text
สร้าง Production Readiness Checklist สำหรับ ShopeeLeaz

ครอบคลุม:
- Security
- Authentication
- Rate limiting
- Input validation
- Database backup
- Logging
- Error monitoring
- AI cost control
- OCR cost control
- Affiliate compliance
- Chrome Extension permission review
- Privacy policy
- Terms of service
- Deployment
- Scaling
- Testing
- CI/CD

ให้จัดเป็น checklist พร้อมสถานะ:
- Required before launch
- Recommended
- Future improvement
```

---

# ลำดับการใช้งานที่แนะนำ

ให้ใช้ตามนี้:

```text
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19
```

ถ้าใช้กับ AI ที่ตอบยาวไม่ได้ เช่น ChatGPT, Claude, Gemini, Cursor Chat ให้เพิ่มคำนี้ท้ายทุกคำสั่ง:

```text
ถ้า response ยาวเกินไป ให้แบ่งเป็น Part 1, Part 2, Part 3 และรอคำว่า “continue” ก่อนสร้างส่วนต่อไป
```

ถ้าใช้กับ Cursor หรือ Codex ให้ใช้แบบนี้ท้าย prompt:

```text
Apply these changes directly to the codebase.
Create missing files.
Modify existing files if needed.
Do not remove working code unless necessary.
After editing, summarize changed files.
```

---

# Prompt คุมงานระหว่างทำ

ใช้เมื่อ AI เริ่มหลุดหรือเขียนไม่ครบไฟล์:

```text
หยุดก่อน แล้วตรวจสอบสิ่งที่คุณเพิ่งสร้าง

กรุณาตรวจว่า:
1. ไฟล์ครบตามที่สั่งหรือไม่
2. มีไฟล์ไหนอ้างถึงแต่ยังไม่ได้สร้างหรือไม่
3. import path ถูกต้องหรือไม่
4. TypeScript type ตรงกันหรือไม่
5. Prisma schema รองรับโค้ดที่เขียนหรือไม่
6. API route ตรงกับ frontend หรือไม่
7. มี TODO ใน core feature หรือไม่

จากนั้นแก้ไขให้ครบ
ให้แสดงเฉพาะไฟล์ที่ต้องแก้ พร้อม path และ code เต็ม
```

---

# Prompt สั่งให้ Generate ต่อ

```text
continue

สร้าง module ถัดไปตามลำดับเดิม
อย่าข้ามไฟล์
อย่าเปลี่ยน architecture
ให้แสดง path และ code เต็มของทุกไฟล์
```

---

# Prompt สั่งให้สรุปสถานะโปรเจกต์

```text
สรุปสถานะโปรเจกต์ ShopeeLeaz ตอนนี้

ให้ตอบเป็นตาราง:
- Module
- Files generated
- Completed features
- Missing features
- Known issues
- Next step

จากนั้นบอกว่าควรใช้คำสั่งลำดับถัดไปหมายเลขอะไร
```

---

ชุดนี้เหมาะที่สุดถ้าคุณต้องการให้ AI ค่อย ๆ สร้างโปรเจกต์ใหญ่แบบไม่หลุดโครงสร้าง และตรวจงานได้ทีละโมดูล.
