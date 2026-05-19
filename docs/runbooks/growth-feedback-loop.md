# Growth + Feedback Loop (First 7 Days and First 100 Users)

## Target user

- Shopee Affiliate creator in Thailand.

## First 7 days launch plan

Day 1-2:
- Verify Thai-first landing message clarity.
- Verify onboarding flow for login/register/product import.

Day 3-4:
- Run 3 sample workflows end-to-end:
  1. Product capture -> AI post generation
  2. OCR -> product review -> save
  3. Product -> HyperFrames render request

Day 5-7:
- Conduct first 10 feedback sessions.
- Log friction points manually.
- Prioritize fixes by activation impact and safety risk.

## First 100 users checklist

- Track activation milestones manually (signup, first product, first generated content).
- Review support/feedback themes weekly.
- Prioritize onboarding clarity and reliability fixes over new risky features.
- Keep affiliate disclosure visible in relevant generated content surfaces.

## User onboarding funnel review checklist

- Landing page promise matches dashboard reality.
- Product import review-before-save is clear.
- AI generation includes safe compliance reminders.
- OCR screens show extraction may be inaccurate.
- HyperFrames render expectations and queue behavior are understandable.

## Feedback interview questions (Thai)

1. "จุดไหนในขั้นตอนเริ่มใช้งานที่ทำให้คุณสับสนมากที่สุด?"
2. "ตอนเพิ่มสินค้า คุณมั่นใจข้อมูลก่อนกดบันทึกมากน้อยแค่ไหน?"
3. "ผลลัพธ์คอนเทนต์ AI ตรงกับสิ่งที่คุณต้องการหรือไม่ เพราะอะไร?"
4. "ขั้นตอน OCR มีจุดไหนที่ใช้เวลานานหรือต้องแก้ไขบ่อย?"
5. "ถ้าจะให้เราปรับปรุง 1 อย่างที่ช่วยให้คุณใช้งานต่อเนื่องมากขึ้น คุณอยากให้ปรับอะไร?"

## Content compliance reminders

- Do not make unsupported income claims.
- Do not generate fake product reviews.
- Do not invent product specifications.
- Keep affiliate disclosure visible and editable.

## Analytics planning (document-only for now)

Proposed future privacy-preserving, opt-in events:
- `onboarding_completed`
- `product_saved`
- `ai_content_generated`
- `ocr_import_reviewed`
- `hyperframes_render_requested`
- `hyperframes_render_completed`

Rules:
- No private Shopee user data collection.
- No secret/token capture.
- Keep event payload minimal and non-sensitive.
