# ZSP AI Tool System Architecture v1

## 1) ภาพรวมระบบ (System Overview)

`zsp-aitool` เป็นระบบสำหรับผู้ทำ Shopee Affiliate ที่เน้น **human-in-the-loop** และ **compliance-first**:
- เก็บข้อมูลสินค้าเฉพาะข้อมูลที่ผู้ใช้เห็นและยืนยันเอง
- จัดการ Product Library ในฐานข้อมูล
- สร้างคอนเทนต์โปรโมตหลายแพลตฟอร์มด้วย AI โดยมี Affiliate Disclosure เสมอ
- รองรับ OCR สำหรับดึงข้อมูลจากภาพ และให้ผู้ใช้ตรวจแก้ก่อนบันทึก
- รองรับ Chrome Extension (MV3) สำหรับช่วยเก็บข้อมูลจากหน้าเว็บที่ผู้ใช้เปิดอยู่

## 2) โมดูลหลัก (Core Modules)

1. **Auth & Session Module**
   - ลงทะเบียน / เข้าสู่ระบบ / ออกจากระบบ / current user
2. **Product Module**
   - CRUD สินค้า, import จาก URL/JSON/Extension payload, duplicate check
3. **AI Content Module**
   - สร้างโพสต์ Facebook, Instagram, Threads, X
   - สร้าง short article, SEO article, caption, comment
4. **Prompt Template Module**
   - จัดการ template, duplicate, restore defaults, preview variables
5. **OCR Module**
   - อัปโหลดภาพ, extract text, review ก่อน save
6. **Similar Product Module**
   - แนะนำสินค้าที่คล้ายกันจาก library ของ user เดียวกัน
7. **Export Module**
   - ส่งออก CSV/Markdown/TXT
8. **Extension Integration Module**
   - รับ payload จาก Chrome Extension อย่างปลอดภัยและตรวจสอบ schema
9. **Compliance & Safety Module**
   - กฎการใช้งาน AI, affiliate disclosure, no fake reviews, no overclaim

### Module Boundaries (High-Level)

- **Presentation Layer**
  - Next.js App Router pages/components
  - Chrome Extension popup/options UX
- **Application Layer**
  - Route Handlers + service orchestration
  - DTO mapping + validation entry points
- **Domain Layer**
  - Product, Content Generation, OCR, Template, Similarity rules
- **Infrastructure Layer**
  - Prisma/PostgreSQL
  - AI/OCR provider adapters
  - Logging/usage metrics

## 3) Database Design Overview

ใช้ PostgreSQL + Prisma โดยมีตารางหลัก:
- `User`
- `Product`, `ProductImage`, `AffiliateLink`
- `ContentGeneration`, `PlatformPost`
- `ContentTemplate`, `PromptPreset`
- `OCRJob`
- `SimilarProduct`
- `UserSetting`
- `APIUsageLog`

แนวทางสำคัญ:
- ทุก record ที่เป็น business object มี `createdAt`, `updatedAt`, `deletedAt`
- แยก raw metadata ที่ไม่แน่นอนเป็น JSON field
- ทำ index สำหรับ `userId`, `originalUrl`, `platform`, `status`, `createdAt`

### Key Relationships

- `User 1—N Product`
- `Product 1—N ProductImage`
- `Product 1—N AffiliateLink`
- `Product 1—N ContentGeneration`
- `Product 1—N OCRJob` (ผ่าน workflow อ้างอิงสินค้าเมื่อยืนยัน)
- `Product N—N Product` ผ่าน `SimilarProduct` (source/related)
- `User 1—N ContentTemplate`
- `User 1—1 UserSetting`
- `User 1—N APIUsageLog`

## 4) API Overview

ใช้ Next.js API Routes (App Router Route Handlers):
- `/api/auth/*`
- `/api/products/*`
- `/api/ai/*`
- `/api/content-history/*`
- `/api/templates/*`
- `/api/ocr/*`
- `/api/settings`
- `/api/export/*`

หลักการ:
- Zod validation ทุก endpoint
- รูปแบบ response กลางเดียวกัน
- auth required สำหรับ endpoint ที่เกี่ยวกับข้อมูลผู้ใช้

### API Groups by Responsibility

- **Auth APIs:** identity/session lifecycle
- **Product APIs:** product CRUD/import/image/affiliate links
- **AI APIs:** single + batch generation, generation history
- **Template APIs:** prompt-template lifecycle and preview support
- **OCR APIs:** extraction job lifecycle + review state
- **Export APIs:** user-scoped data export
- **Settings APIs:** per-user defaults and configuration status

## 5) Frontend Pages Overview

- `/` Landing
- `/login`, `/register`
- `/dashboard`
- `/dashboard/products`
- `/dashboard/products/new`
- `/dashboard/products/[id]`
- `/dashboard/products/[id]/similar`
- `/dashboard/generator`
- `/dashboard/content-history`
- `/dashboard/templates`
- `/dashboard/ocr`
- `/dashboard/settings`

### Primary User Journey

1. Login/Register
2. Add/Import Product
3. Review product data and affiliate link
4. Generate multi-platform content
5. Save and reuse prompt templates
6. Export outputs and track history

## 6) Chrome Extension Overview

Manifest V3:
- popup สำหรับกด collect และแก้ไขข้อมูล
- content script สำหรับอ่าน DOM ที่มองเห็นได้
- options page สำหรับตั้ง API endpoint/token
- background สำหรับ message handling

ข้อกำกับ:
- ไม่เรียก private Shopee API
- ไม่ bypass CAPTCHA/login
- ส่งเฉพาะข้อมูลที่ผู้ใช้เห็นและกดยืนยัน

### Extension → Web App Contract

- Payload ต้องถูก schema-validate ก่อนรับเข้า backend
- ระบุ `sourceUrl` ทุกครั้งเพื่อ traceability
- ข้อมูลสำคัญที่ไม่มั่นใจให้แนบ `confidence: low` หรือ note ใน metadata

## 7) AI Content Generation Flow

1. ผู้ใช้เลือกสินค้า + platform + tone + language + จำนวนเวอร์ชัน
2. ระบบ build prompt จาก template และข้อมูลสินค้าจริง
3. ContentSafety ตรวจเงื่อนไขห้าม overclaim/fake review
4. ส่งเข้า AI Provider abstraction (OpenAI-compatible หรือ mock)
5. parse เป็น structured JSON
6. บังคับมี affiliate disclosure ก่อนส่งผลลัพธ์กลับ
7. บันทึก history + token usage

## 8) OCR Flow

1. ผู้ใช้อัปโหลดภาพ
2. ระบบเรียก OCR provider ผ่าน interface
3. ได้ extracted text/fields + confidence (ถ้ามี)
4. แสดงผลให้ผู้ใช้แก้ไข
5. ผู้ใช้กดยืนยันแล้วค่อยบันทึกเป็น Product
6. บันทึก OCR job status และ error message (ถ้ามี)

## 9) Product Import Flow

- **URL Import:** เก็บ URL และเปิดฟอร์มให้ผู้ใช้ยืนยันข้อมูล
- **JSON Import:** รับเฉพาะ schema ที่กำหนด
- **Extension Import:** รับ payload ที่ผู้ใช้รวบรวมจากหน้าที่เห็น

ทุกช่องทาง:
- ตรวจ duplicate จาก `originalUrl` ต่อผู้ใช้
- sanitize + validate ก่อนบันทึก
- บันทึก raw metadata แยกจากข้อมูล normalized

## 10) Security and Compliance Notes

- ไม่ใช้ private API และไม่หลบระบบป้องกันเว็บ
- ไม่จัดเก็บรหัสผ่านแบบ plain text
- ไม่เก็บ secret key ลง DB แบบ plain text
- ใช้ env vars สำหรับ provider keys
- บังคับ affiliate disclosure ในคอนเทนต์
- ไม่สร้างรีวิวปลอมและไม่แต่งข้อมูลเกินจริง
- บันทึก usage log และรองรับ rate limiting ในชั้น API

### Compliance Guardrails in Flows

- ทุก flow ที่อาจตีความข้อมูลอัตโนมัติ (Import/OCR/AI) ต้องมี user confirmation ก่อน persist/final publish
- แยก “facts from product data” กับ “creative phrasing” ชัดเจนใน prompt policy
- รองรับ moderation/error state เมื่อผลลัพธ์ AI ฝ่าฝืนกฎการตลาด/affiliate

## 11) Full Folder Structure (Planned)

```text
zsp-aitool/
  docs/
    prompts/
    architecture.md
    architecture-system-v1.md
  prisma/
    schema.prisma
    seed.ts
  extension/
    manifest.json
    package.json
    vite.config.ts
    src/
      popup.html
      popup.ts
      popup.css
      content-script.ts
      background.ts
      options.html
      options.ts
      api-client.ts
      types.ts
  src/
    app/
      api/
        auth/
        products/
        ai/
        content-history/
        templates/
        ocr/
        export/
        settings/
      dashboard/
      login/
      register/
      page.tsx
    components/
      auth/
      products/
      ai/
      templates/
      ocr/
      export/
      settings/
      layout/
      ui/
    hooks/
    lib/
    middleware/
    schemas/
    services/
      ai/
      ocr/
    types/
  tests/
    services/
    api/
    components/
  Dockerfile
  docker-compose.yml
  .env.example
  package.json
  tsconfig.json
```

### Folder Design Notes

- `src/services/*` = business orchestration layer
- `src/schemas/*` = request/DTO validation schemas
- `src/lib/*` = reusable low-level helpers/utilities
- `src/app/api/*` = thin transport adapters
- `extension/src/*` = browser runtime logic separated from app backend
