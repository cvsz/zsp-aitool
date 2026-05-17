# UX/UI Review — zsp-aitool (Thai-first affiliate workspace)

Date: 2026-05-17  
Scope: landing, dashboard, products list/new/detail, generator, content history, templates, OCR, similar products, settings, login/register.

## Executive summary

Current UI is a solid technical scaffold, but it still reads as a mixed-language prototype rather than a professional Thai-first affiliate workspace. The highest-impact gaps are:

1. **Inconsistent information architecture and primary workflow signaling** (Product → Content → History → Export is not explicit enough).
2. **Mixed Thai/English labels and inconsistent product naming context** (several pages use English headers/buttons).
3. **Uneven state handling** (some pages have Empty/Loading/Error states; others are raw text or JSON).
4. **Weak form feedback/accessibility semantics** (inputs lack visible labels and ARIA error binding).
5. **Dashboard value communication is low** (overview currently exposes raw JSON instead of actionable metrics).

## Findings by evaluation criteria

### 1) Information architecture
- Dashboard nav includes key modules but does not clearly present a guided pipeline.
- Core flow steps exist as separate pages, yet no “next action” rails connect them.
- Export is not visibly promoted as the end of the workflow on pages where users expect completion.

### 2) Navigation/sidebar
- Sidebar covers feature breadth well.
- Mobile nav only includes 4 shortcuts and omits content history/templates/OCR, increasing task hops on mobile.
- Active menu state is not visually emphasized.

### 3) Thai-first copy quality
- Thai and English are mixed in critical CTAs/headings (e.g., “New Product”, “Add Product”, “Login”).
- Tone is functional but not productized for affiliate outcomes.

### 4) Product name consistency (`zsp-aitool` only)
- Brand appears as “ZSP AI Tool” in the landing hero.
- Recommend standardizing display name to `zsp-aitool` across page titles, auth pages, and dashboard header context.

### 5) Empty states
- Good reusable EmptyState pattern exists, but only used in selected pages.
- Some pages still fall back to plain strings (e.g., “No history found”) with no recovery CTA.

### 6) Loading states
- LoadingSpinner exists and is reused in some dashboard pages.
- Other pages still use plain “Loading...” text, reducing perceived quality.

### 7) Error states
- Error treatment varies by page; some use styled alert boxes, others plain red text.
- Missing retry actions on non-dashboard pages.

### 8) Form validation display
- Browser-native validation works, but visible inline guidance is minimal.
- Error copy is mixed language and generic (e.g., “Login failed”).

### 9) Mobile responsiveness
- Layout is responsive at baseline.
- Fixed bottom nav is helpful, but four-item limit hides key workflow pages for content operations.

### 10) Accessibility
- Several forms rely on placeholders instead of explicit `<label>`s.
- Limited semantic regions/aria-live for async status and errors.
- Unknown keyboard focus visibility consistency across interactive components.

### 11) CTA clarity
- CTA priorities are unclear on several pages (multiple forms/sections without “recommended next step”).
- Product detail page lacks a direct CTA to generate content from that product.

### 12) Dashboard metrics usefulness
- Current dashboard view renders fetched data as JSON, not KPI cards.
- Missing practical affiliate metrics (products saved, contents generated, top platforms, export count).

### 13) Workflow continuity (Product → Content → History → Export)
- Feature capabilities exist, but user path is implicit.
- Need persistent workflow breadcrumb or “next step” cards at end of each page.

## Page-by-page review

### 1. Landing page
- Strength: concise value proposition.
- Gaps: too lightweight for SaaS trust; no role-based CTA split.
- Improve: add Thai-first proof points and two CTAs (“เริ่มใช้ฟรี”, “ดูวิธีใช้งาน 3 ขั้นตอน”).

### 2. Dashboard
- Strength: has shared page scaffolding and state components.
- Gaps: raw API JSON doesn’t support decision-making.
- Improve: replace JSON block with KPI cards + recent activity + next-step CTA.

### 3. Products list
- Strength: clear entry point to create product.
- Gaps: “New Product” English; unknown empty-state action quality from list component.
- Improve: rename CTA to Thai, add import shortcuts and count summary.

### 4. Product new
- Strength: combines manual form and import form.
- Gaps: heading English, may feel dense without stepper/tab structure.
- Improve: add segmented import methods and validation helper text.

### 5. Product detail
- Strength: simple readable product facts.
- Gaps: minimal hierarchy, no sticky action area.
- Improve: add primary CTA “สร้างคอนเทนต์จากสินค้านี้” + secondary “หาสินค้าที่คล้ายกัน”.

### 6. Generator
- Strength: dedicated module exists.
- Gaps: page framing still English-heavy.
- Improve: add contextual product selector and disclosure reminder near output.

### 7. Content history
- Strength: basic state coverage exists.
- Gaps: plain loading/error/empty strings and no export action per item.
- Improve: adopt shared Empty/Loading/Error components; add quick export/copy.

### 8. Templates
- Strength: strongest CRUD UX surface in current app.
- Gaps: still English headings/buttons; lacks onboarding empty state.
- Improve: localize labels and add first-template guidance.

### 9. OCR
- Strength: review step exists after extraction (good trust pattern).
- Gaps: limited status narrative while processing/failure.
- Improve: add progress messaging + “ตรวจทานก่อนบันทึก” callout prominence.

### 10. Similar products
- Strength: already integrated with shared state components.
- Gaps: results presented as JSON, not cards.
- Improve: card layout with reason badges and direct reuse actions.

### 11. Settings
- Strength: dedicated page and form component exists.
- Gaps: page-level context/help and save feedback unknown.
- Improve: section grouping + sticky save bar + success timestamp.

### 12. Login/Register
- Strength: straightforward flow.
- Gaps: English-only UI, placeholder-only inputs, generic errors.
- Improve: Thai-first labels, password requirements hint, link between login/register, and auth trust microcopy.

## Copy improvements (targeted)

- `New Product` → `เพิ่มสินค้า`
- `Add Product` → `เพิ่มสินค้าใหม่`
- `AI Content Generator` → `สร้างคอนเทนต์ด้วย AI`
- `Content History` → `ประวัติคอนเทนต์`
- `Prompt Templates` → `เทมเพลตพรอมป์`
- `Restore Defaults` → `คืนค่าเทมเพลตเริ่มต้น`
- `Login` / `Register` → `เข้าสู่ระบบ` / `สมัครสมาชิก`
- `Login failed` → `เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน`
- `No history found` → `ยังไม่มีประวัติคอนเทนต์ ลองสร้างคอนเทนต์จากสินค้าแรกของคุณ`

## Missing states checklist (high impact)

1. **Products list**: explicit empty state with CTA pair (manual add + import URL).
2. **Product detail**: missing/fetch error state with retry and back action.
3. **Generator**: loading skeleton for generated blocks + regenerate disabled state.
4. **History**: filter-empty state (when date/platform filter returns none).
5. **Templates**: first-run empty state with “use defaults/create custom”.
6. **OCR**: upload error, extraction timeout, and parse confidence warning states.
7. **Settings**: save success/failure inline banner + unsaved changes guard.

## Component reuse recommendations

- Standardize on shared primitives across all pages:
  - `PageTitle` for all page headers.
  - `EmptyState` / `LoadingSpinner` / styled ErrorAlert for all async modules.
  - Unified `PrimaryButton`, `SecondaryButton`, `DangerButton` variants (currently style duplication in many buttons).
- Introduce `WorkflowNextStepCard` reusable component:
  - Contextual CTA linking next step in Product → Content → History → Export.
- Add `FormField` wrapper component:
  - Label + description + error + required marker + `aria-describedby`.

## Prioritized UI implementation plan (focused, non-redesign)

### P0 (ship first: 1–2 sprints)
1. **Thai-first copy pass + brand normalization (`zsp-aitool`)** on all reviewed pages.
2. **State consistency pass**: replace plain text loading/error/empty with shared components.
3. **Workflow continuity rails**: add next-step CTA card on Product detail, Generator, and History.
4. **Dashboard KPI uplift**: replace raw JSON with 4–6 actionable cards and recent activity list.

### P1
1. **Form accessibility pass** for login/register/product forms (labels, aria error links, hints).
2. **Mobile nav enhancement**: quick access to History and Templates (or “More” sheet).
3. **Similar products visualization**: card-based list instead of JSON.

### P2
1. **Micro-interactions polish**: skeletons, optimistic save feedback, inline progress for OCR/generation.
2. **CTA hierarchy tuning** across all pages with consistent primary button placement.

## Suggested acceptance criteria

- 100% of reviewed pages use Thai-first primary headings and primary CTAs.
- All async pages expose loading + empty + error + retry paths.
- At least 3 key pages include explicit workflow-forward CTA.
- Dashboard contains non-JSON KPI view with meaningful affiliate metrics.
- Login/Register/Product forms have visible labels and inline validation messages.
