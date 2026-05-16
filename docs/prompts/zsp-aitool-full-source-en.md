ด้านล่างคือ **ชุด Prompt สำหรับสั่ง AI ให้สร้าง Full Source Code** ของระบบ ครบทั้งเว็บ, backend, database, AI content generator และ browser extension

---

## Prompt หลัก: Full Source Code ทั้งระบบ

```text
You are a senior full-stack engineer. Generate the complete production-ready source code for a SaaS web app and browser extension named “zsp-aitool”.

Project concept:
zsp-aitool helps Shopee Affiliate users collect product information in one click and use AI to generate promotional content for Facebook, Instagram, Threads, X, short comments, captions, blog posts, and SEO articles.

Important compliance rules:
- Do not bypass CAPTCHA, login walls, anti-bot systems, rate limits, or private user data.
- Product collection must support official APIs where available, manual product URL import, and browser-extension-based extraction from pages the user is already viewing.
- Do not store user passwords for Shopee.
- Do not generate misleading claims, fake reviews, fake discounts, or spam content.
- Affiliate links must be clearly marked and editable by the user.

Tech stack:
- Frontend: Next.js with TypeScript
- Styling: Tailwind CSS
- Backend: Next.js API routes or Node.js service
- Database: PostgreSQL
- ORM: Prisma
- Auth: email/password and OAuth-ready structure
- AI provider: OpenAI-compatible API wrapper
- OCR: OCR module with pluggable provider
- Browser extension: Chrome Extension Manifest V3
- Storage: local upload support for product images, with abstraction for S3-compatible storage
- Testing: unit tests and integration test examples
- Deployment: Docker Compose for local development

Main features:
1. User authentication
2. Dashboard
3. Product collection
4. Product database
5. AI content generator
6. Multi-platform post generation
7. Prompt template management
8. Content history
9. OCR extraction from images
10. Similar product suggestions
11. Browser extension for one-click product capture
12. Affiliate link management
13. Export content as TXT, CSV, and Markdown
14. Admin-ready settings page

Generate:
- Complete folder structure
- All important source files
- Database schema
- API routes
- Frontend pages
- Browser extension files
- Environment variable example
- Docker Compose file
- README with setup instructions
- Seed data
- Error handling
- Security notes
- Basic tests

Output format:
1. Start with the project tree.
2. Then provide each file with its path.
3. Use clean, maintainable code.
4. Do not omit files by saying “repeat similarly”.
5. Use placeholder API keys only in .env.example.
6. Make the app runnable locally.
```

---

## Prompt เสริม 1: Database + Prisma Schema

```text
Create the complete PostgreSQL + Prisma database schema for zsp-aitool.

The system needs these entities:
- User
- Product
- ProductImage
- ProductReviewSummary
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
- A user can save many products.
- A product has title, price, currency, original URL, affiliate URL, shop name, rating, sold count, description, category, images, and raw extracted metadata.
- Content generations must store platform, tone, language, prompt, AI output, status, token usage, and created date.
- Support platforms: Facebook, Instagram, Threads, X, Blog, SEO Article, Comment, Short Caption.
- Store AI prompt templates separately so users can customize them.
- OCR jobs should store image URL, extracted text, status, and error message.
- Similar products should reference the source product and related product.
- Include indexes for userId, productId, platform, createdAt, and product URL.
- Include enums where appropriate.
- Include soft delete fields where useful.
- Generate the full schema.prisma file.
- Also generate seed data for demo products, demo prompts, and demo content history.
```

---

## Prompt เสริม 2: Backend API

```text
Generate the complete backend API for zsp-aitool using Next.js API routes with TypeScript.

Required API modules:

Auth:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

Products:
- POST /api/products/import-url
- POST /api/products/save
- GET /api/products
- GET /api/products/:id
- PATCH /api/products/:id
- DELETE /api/products/:id

AI Content:
- POST /api/ai/generate
- POST /api/ai/generate-batch
- GET /api/content-history
- GET /api/content-history/:id
- DELETE /api/content-history/:id

Prompt Templates:
- GET /api/templates
- POST /api/templates
- PATCH /api/templates/:id
- DELETE /api/templates/:id

OCR:
- POST /api/ocr/extract
- GET /api/ocr/:id

Affiliate:
- POST /api/affiliate/build-link
- PATCH /api/products/:id/affiliate-link

Similar Products:
- GET /api/products/:id/similar
- POST /api/products/:id/similar-refresh

Export:
- GET /api/export/products.csv
- GET /api/export/content.csv
- GET /api/export/content.md

Requirements:
- Use Prisma for database access.
- Validate all input with Zod.
- Create reusable error handling.
- Create reusable auth middleware.
- Create service classes:
  - ProductService
  - AIContentService
  - OCRService
  - AffiliateService
  - ExportService
- AI provider must be abstracted so the user can switch model providers.
- Do not hardcode API keys.
- Include rate-limit placeholder middleware.
- Include safe product extraction logic from user-submitted product metadata or extension payload.
- Do not implement CAPTCHA bypass or hidden scraping.
- Return consistent JSON responses.
- Include example tests.
```

---

## Prompt เสริม 3: AI Content Generator

```text
Create the full AI content generation module for zsp-aitool.

Goal:
Generate affiliate promotional content from saved product data.

Input:
- product title
- price
- description
- rating
- review summary
- key selling points
- affiliate link
- target platform
- language
- tone
- content length
- custom user prompt
- hashtag preference
- emoji preference
- CTA preference

Platforms:
- Facebook
- Instagram
- Threads
- X
- Blog
- SEO Article
- Short Caption
- Comment Reply

Content styles:
- Friendly
- Professional
- Funny
- Urgent
- Luxury
- Review-style
- Problem-solution
- Thai casual
- Thai persuasive
- Minimal

Requirements:
- Generate reusable prompt builder functions.
- Create system prompts that prevent fake claims.
- Do not invent product specifications not found in the product data.
- If information is missing, write neutral marketing copy.
- Include affiliate disclosure text.
- Generate multiple variations.
- Support Thai and English.
- Include hashtag generation.
- Include short CTA generator.
- Include title/headline generator.
- Store every generation in the database.
- Return structured JSON:
  {
    "platform": "",
    "headline": "",
    "caption": "",
    "hashtags": [],
    "cta": "",
    "affiliateDisclosure": "",
    "warnings": []
  }

Generate:
- TypeScript types
- Prompt builder
- AI provider wrapper
- generation service
- API route
- tests
```

---

## Prompt เสริม 4: Frontend Dashboard

```text
Generate the complete frontend for zsp-aitool using Next.js, TypeScript, and Tailwind CSS.

Pages:
1. Landing page
2. Login page
3. Register page
4. Dashboard overview
5. Product library
6. Product detail page
7. Add/import product page
8. AI content generator page
9. Content history page
10. Prompt templates page
11. OCR tools page
12. Similar products page
13. Settings page

UI requirements:
- Clean SaaS dashboard style
- Thai language UI by default
- Responsive mobile-first layout
- Sidebar navigation on desktop
- Bottom navigation or collapsible menu on mobile
- Cards for products
- Product image preview
- Copy-to-clipboard buttons
- Platform selector: Facebook, Instagram, Threads, X, Blog, SEO
- Tone selector
- Language selector
- AI generated content preview
- Content variation tabs
- Export buttons
- Loading states
- Empty states
- Error states
- Toast notifications
- Confirmation modal for delete actions

Components:
- AppLayout
- Sidebar
- ProductCard
- ProductForm
- ProductImportForm
- ContentGeneratorForm
- GeneratedContentCard
- PlatformBadge
- PromptTemplateEditor
- OCRUploadBox
- SimilarProductCard
- CopyButton
- ExportButton
- EmptyState
- LoadingSpinner

Generate all source files, reusable hooks, API client utilities, and example mock data for development.
```

---

## Prompt เสริม 5: Chrome Extension Manifest V3

```text
Generate a complete Chrome Extension Manifest V3 source code for zsp-aitool.

Purpose:
The extension lets a user collect product information from a Shopee product page they are currently viewing and send it to the zsp-aitool web app.

Compliance:
- Only extract visible page information from the page the user actively opens.
- Do not bypass login, CAPTCHA, rate limits, or hidden APIs.
- Do not collect private user data.
- Ask for user confirmation before sending data to the web app.
- Let users review and edit extracted data before saving.

Extension features:
1. Popup UI
2. “Collect product” button
3. Detect current product page
4. Extract visible product data:
   - title
   - price
   - image URLs
   - rating if visible
   - sold count if visible
   - description if visible
   - current page URL
5. Allow manual editing in popup
6. Send data to zsp-aitool API
7. Store API endpoint and user token in extension settings
8. Show success/error messages
9. Quick button: generate Facebook post
10. Quick button: generate Instagram caption
11. Quick button: generate X post
12. Quick button: generate Threads post

Generate:
- manifest.json
- popup.html
- popup.ts
- popup.css
- content-script.ts
- background.ts
- options.html
- options.ts
- shared types
- API client
- README setup instructions
- Build config using Vite
```

---

## Prompt เสริม 6: Product Import Logic

```text
Create the product import and extraction module for zsp-aitool.

Supported import methods:
1. Manual form input
2. Product URL input
3. Browser extension payload
4. Uploaded screenshot with OCR
5. JSON import

Important:
Do not create code that bypasses Shopee protections.
Do not use private endpoints.
Do not automate mass scraping.
Do not evade anti-bot systems.

Required functionality:
- Normalize product title
- Normalize price
- Extract currency
- Store image URLs
- Store original URL
- Generate slug
- Detect duplicate product by URL
- Merge updated product data
- Let user edit all fields before saving
- Validate with Zod
- Save raw metadata as JSON
- Create import status:
  - pending
  - completed
  - failed
  - needs_review

Generate:
- TypeScript types
- Zod schemas
- ProductImportService
- API routes
- Frontend form
- Extension payload handler
- Unit tests
```

---

## Prompt เสริม 7: OCR Feature

```text
Generate the OCR feature for zsp-aitool.

Goal:
Allow users to upload a product screenshot and extract useful product information from visible text.

Requirements:
- Upload image
- Store upload temporarily
- Run OCR using a pluggable OCR provider
- Extract possible:
  - product title
  - price
  - discount
  - rating
  - sold count
  - description snippets
- Show extracted text to user
- Let user confirm or edit before saving as product
- Store OCR job status
- Handle OCR errors gracefully
- Do not claim OCR is always accurate
- Include confidence score if provider supports it

Generate:
- OCRService
- OCRProvider interface
- MockOCRProvider for local development
- API route
- Upload component
- OCR result review component
- Database integration
- Tests
```

---

## Prompt เสริม 8: Similar Product Recommendation

```text
Generate the similar product recommendation module for zsp-aitool.

Goal:
Recommend similar saved products from the user’s own product library.

Requirements:
- Compare products by:
  - category
  - title keywords
  - price range
  - description keywords
  - tags
- Do not fetch unauthorized external product data.
- Recommend only from products already saved by the user unless an official API integration is configured.
- Include score from 0 to 100.
- Explain why each product is recommended.
- Store recommendation result in database.
- Add refresh button on product detail page.

Generate:
- SimilarProductService
- Keyword extraction utility
- Price similarity function
- Category matching function
- API route
- UI component
- Tests
```

---

## Prompt เสริม 9: Prompt Template System

```text
Generate a complete prompt template system for zsp-aitool.

Users should be able to create and edit AI prompt presets.

Template fields:
- name
- description
- platform
- tone
- language
- template body
- variables
- isDefault
- isActive

Supported variables:
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

Requirements:
- Validate templates before saving
- Preview prompt with sample product
- Duplicate template
- Restore default templates
- Use default templates if user has none
- Include Thai default templates for:
  - Facebook promotional post
  - Instagram caption
  - Threads short post
  - X post
  - Blog article
  - SEO article
  - Comment reply

Generate:
- Prisma model if needed
- Backend API
- Frontend editor
- Template renderer
- Default seed templates
- Tests
```

---

## Prompt เสริม 10: README + Deployment

```text
Create a complete README and deployment guide for zsp-aitool.

Include:
- Project overview
- Feature list
- Tech stack
- Folder structure
- Local development setup
- Environment variables
- Database setup
- Prisma migration commands
- Seed command
- Running web app
- Running Chrome extension
- Building for production
- Docker Compose setup
- AI provider setup
- OCR provider setup
- Security notes
- Affiliate compliance notes
- Troubleshooting
- Future roadmap

Also generate:
- .env.example
- docker-compose.yml
- Dockerfile
- package.json scripts
- GitHub Actions CI workflow
```

---

## Prompt แบบ One-shot สั้นกว่า สำหรับใช้ทันที

```text
Build a complete full-stack source code project named zsp-aitool.

zsp-aitool is a Shopee Affiliate productivity tool that lets users save product data in one click and generate AI promotional content for Facebook, Instagram, Threads, X, blog posts, SEO articles, captions, and comments.

Use:
- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Chrome Extension Manifest V3
- OpenAI-compatible AI provider abstraction
- OCR provider abstraction
- Docker Compose

Features:
- Auth
- Product library
- Product import by manual form, URL, browser extension payload, screenshot OCR, and JSON
- AI content generator
- Platform-specific post generation
- Prompt template editor
- Content history
- Similar product suggestions from saved products
- Affiliate link management
- Export CSV, TXT, Markdown
- Thai UI by default
- Responsive SaaS dashboard
- Chrome extension popup for collecting visible product page data

Compliance:
- Do not bypass CAPTCHA, login walls, rate limits, or anti-bot protections.
- Do not use private Shopee endpoints.
- Do not collect private user data.
- Use official API integration where available, otherwise rely on user-provided data or visible page content with user confirmation.
- Do not generate fake reviews or unsupported product claims.

Generate:
1. Complete folder tree
2. All source files
3. Prisma schema
4. API routes
5. Frontend pages and components
6. Chrome extension files
7. AI prompt builder
8. OCR module
9. Similar product module
10. Tests
11. .env.example
12. Docker files
13. README

Make the app runnable locally.
Do not skip files.
Do not use “TODO” for core features.
Use clean, secure, maintainable code.
```

---

## Prompt สำหรับให้ AI แบ่งงานเป็นไฟล์ทีละชุด

```text
You will generate the zsp-aitool source code in multiple parts.

Rules:
- First output only the folder structure and implementation plan.
- Then wait for my command: “continue”.
- On each continue, generate one complete module.
- Never summarize code instead of writing it.
- Every file must include its path.
- Keep code consistent across modules.
- Track already generated files.
- Do not change architecture midway.

Modules to generate in order:
1. Project setup and configs
2. Prisma schema and seed
3. Auth system
4. Product module
5. AI content module
6. Prompt template module
7. OCR module
8. Similar product module
9. Export module
10. Frontend dashboard
11. Chrome extension
12. Tests
13. Docker and README

Project:
zsp-aitool is a Shopee Affiliate content automation tool with one-click product collection and AI-generated promotional content for Facebook, Instagram, Threads, X, blog, SEO articles, captions, and comments.

Use Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Chrome Extension Manifest V3, and OpenAI-compatible AI provider abstraction.

Follow safe and compliant implementation:
- No CAPTCHA bypass
- No private endpoint scraping
- No fake claims
- No private user data collection
- User must confirm extracted product data before saving
```

---

ใช้ชุดนี้เรียงตามลำดับจะได้ผลดีที่สุด: เริ่มจาก **Prompt หลัก** แล้วใช้ **Prompt เสริม 1–10** เพื่อบังคับให้ AI เติมรายละเอียดแต่ละโมดูลจนเป็น source code ที่ครบและรันได้จริง.
