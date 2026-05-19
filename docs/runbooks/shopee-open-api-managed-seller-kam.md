# Shopee Open API Managed Seller / KAM Eligibility Runbook

This runbook documents what to do when Shopee Open Platform Console blocks profile submission with messages such as:

```text
You do not meet one of the criteria:
- Managed Sellers
- Mall Seller

Please enter the correct Shopee KA email
```

## Source reference

Primary repo reference:

```text
docs/reference/shopee-open-api-developer-guide-v2.1.md

Official reference checklist (must exist before enabling live API calls):

- Shopee Open Platform developer console docs for your region (auth, scope, callback, webhook, and go-live policy)
- Endpoint-level official request/response references stored under `docs/reference/` in this repo
- Internal setup runbook: `docs/runbooks/shopee-open-api-integration.md`
```

Original uploaded PDF title:

```text
Shopee Thailand Open API Developer Guide
Open API Developer Account Signup and Shop Authorization
Open Platform v2.0
July 2022
```

## What the error means

For Thailand, the guide states that Shopee Open API service is available to qualified sellers/platforms, specifically:

- Mall Seller
- Non-Mall Managed Seller with a Key Account Manager assigned
- Third-party Partner Platform provider

If the shop is a normal individual seller without a Key Account Manager, the Open Platform profile audit may be rejected or blocked.

The Shopee KA email field must be the official Key Account Manager email assigned to that shop. A personal email or unrelated email will not satisfy this validation.

## What to do next

### Path A — You already have a KAM

1. Contact the Shopee Key Account Manager assigned to the shop.
2. Ask them to confirm whether the shop is eligible for Shopee Thailand Open API.
3. Ask for the exact Shopee KA email to enter in Open Platform Console.
4. Re-enter the KA email exactly as provided.
5. Continue profile submission.

### Path B — You are Mall Seller but do not know the KAM email

1. Contact Shopee Seller support or the account/business contact for the Mall shop.
2. Ask them to identify the assigned Key Account Manager or Open API profile approval contact.
3. Use only the official Shopee KA email returned by Shopee.

### Path C — You are not Mall / Managed Seller

1. Do not attempt to bypass the validation.
2. Ask Shopee Seller support whether your shop can be upgraded/considered for managed seller support.
3. If Shopee does not assign a KAM, use an approved third-party partner/ERP or keep using zsp-aitool's safe non-OpenAPI import modes.

Safe zsp-aitool alternatives remain available:

- Manual product input
- User-confirmed visible-page browser extension capture
- OCR screenshot import
- JSON import
- Affiliate link management
- AI content generation from user-reviewed data

## Message template to Shopee / KAM

Thai:

```text
สวัสดีครับ ต้องการสมัครใช้งาน Shopee Open Platform / Open API v2.0 สำหรับร้านนี้
ตอนนี้ระบบแจ้งว่าไม่เข้า criteria Managed Seller / Mall Seller และต้องกรอก Shopee KA email
รบกวนช่วยตรวจสอบว่าร้านนี้มีสิทธิ์ใช้งาน Open API หรือไม่ และขอ Shopee KA email ที่ถูกต้องสำหรับกรอกใน Open Platform Console ครับ
```

English:

```text
Hello, I would like to apply for Shopee Open Platform / Open API v2.0 for this shop.
The console currently says the shop does not meet the Managed Seller / Mall Seller criteria and asks for the correct Shopee KA email.
Could you please confirm whether this shop is eligible for Open API and provide the correct Shopee KA email for the Open Platform Console profile audit?
```

## zsp-aitool implementation policy while blocked

Until Shopee confirms eligibility and provides valid credentials:

```text
SHOPEE_OPEN_API_ENABLED=false
IMPLEMENTATION_MODE=FOUNDATION_ONLY_DISABLED_BY_DEFAULT
```

Do not:

- guess partner IDs or keys
- store seller passwords
- automate Shopee login
- bypass CAPTCHA or OTP
- scrape private endpoints
- claim Open API is active in production

## Integration readiness checklist

Before enabling real Open API calls:

- [ ] Seller is Mall Seller or Non-Mall Managed Seller with KAM, or approved Third-party Partner Platform
- [ ] Profile audit approved by Shopee
- [ ] App created in Open Platform Console
- [ ] Sandbox credentials obtained
- [ ] Sandbox/test-stable tested
- [ ] Go-Live approved by Shopee
- [ ] Live partner_id and key stored only in environment/secret manager
- [ ] Endpoint-level official docs are available in `docs/reference/`
- [ ] Signature/auth algorithm confirmed from official docs
- [ ] zsp-aitool tests mock all Shopee API calls
- [ ] User review-before-save remains enforced
- [ ] No seller password is collected or stored anywhere in zsp-aitool

## Current recommended next prompt

```text
018-official-shopee-open-api-integration.prompt
```

Use foundation-only mode until eligibility and endpoint docs are complete.
