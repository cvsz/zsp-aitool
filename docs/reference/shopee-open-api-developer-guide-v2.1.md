# Shopee Thailand Open API Developer Guide v2.1 Reference

Source document:

```text
ecb708f5284142ceb68be4a84f6cf5a4_TH_SEH_Open API_Developer Guide_v2.1_20220722.pdf
```

Original public URL:

```text
https://deo.shopeemobile.com/shopee/cms_cdn_bucket/ecb708f5284142ceb68be4a84f6cf5a4_TH_SEH_Open%20API_Developer%20Guide_v2.1_20220722.pdf
```

Document title:

```text
Shopee Thailand Open API Developer Guide
Open API Developer Account Signup and Shop Authorization
Open Platform v2.0
July 2022
Private & Confidential
```

## What this reference is for

Use this document as the compliance and onboarding reference for the optional official Shopee Open API integration in `zsp-aitool`.

Do not use this guide as permission to scrape Shopee pages or private endpoints. The only acceptable integration path is the official Shopee Open Platform/OpenAPI flow described by Shopee.

## Key points from the guide

### Evaluation before connecting

Shopee describes OpenAPI connection as an ongoing maintenance effort, not a one-time setup. Developers are expected to evaluate the technical documents and API call flows before connecting.

### Qualification of users

The Thailand Shopee Open API service is described as available to:

- Mall Sellers
- Non-Mall Managed Sellers with a Key Account Manager assigned
- Third-party Partner Platform providers

Applications may be rejected if the qualification does not match Shopee requirements.

### Developer account types

The guide describes developer account types including:

- Shopee Seller
- Registered Business Seller / Mall Seller
- Individual Seller / Non-Mall Managed Seller
- Third-party Partner Platform / Enterprise 3rd Party

### OpenAPI v2.0

The guide states that Shopee was deprecating OpenAPI v1.0 and that new developers should use v2.0 APIs.

Example URL patterns from the guide:

```text
https://partner.shopeemobile.com/api/v1/item/add
https://partner.shopeemobile.com/api/v2/shop/cancel_auth_partner
```

### Signup and test procedure

The guide shows the overall procedure:

1. Register as Developer
2. Profile Audit by Shopee
3. Create APP
4. Obtain Credentials and optional Webhook Setup
5. Test API in Sandbox
6. Request to Go-Live

### Developer account warning

The guide notes that the Open Platform developer account is different from the Shopee marketplace seller account and says not to use the seller username/password as the developer login.

### Sandbox testing

The guide describes Sandbox / test-stable as the test environment for OpenAPI testing before live usage.

### Shop authorization

The guide describes test shop authorization to a partner ID and notes that live authorization should be handled by the seller/business team responsible for the seller account.

### Go-Live

After sandbox testing, the guide says developers request Go-Live and receive live `partner_id` and key after approval.

### API call flow references

The guide’s API call flow section references:

- Add new product: Upload Item
- Add/Edit product variation: Add Model
- Get 3PL tracking number / Print AirWayBill
- Arrange Shipment & Get TrackingNo & Print AirWayBill
- Check order status: Order Status Flow

## zsp-aitool implementation policy

When implementing Shopee Open API support in this repository:

- Use official Shopee Open API only.
- Keep the feature disabled by default.
- Store credentials only in environment variables or secrets.
- Never store partner keys in the database.
- Never expose partner keys in UI, API responses, logs, tests, or docs.
- Do not guess endpoint details that are not present in the available documentation.
- Do not bypass CAPTCHA, login walls, anti-bot protections, rate limits, or private endpoints.
- Do not automate mass scraping.
- Use sandbox/test-stable for testing where applicable.
- Mock Shopee API calls in tests.
- Require user review/edit before saving imported product data.
- Keep manual import, extension payload import, OCR import, and JSON import unchanged.

## Suggested repo path for the PDF binary

The binary PDF can be stored at:

```text
docs/reference/shopee-open-api-developer-guide-v2.1.pdf
```

If the PDF binary is not committed by automation, add it manually with:

```bash
mkdir -p docs/reference
cp "/path/to/ecb708f5284142ceb68be4a84f6cf5a4_TH_SEH_Open API_Developer Guide_v2.1_20220722.pdf" docs/reference/shopee-open-api-developer-guide-v2.1.pdf
git add docs/reference/shopee-open-api-developer-guide-v2.1.pdf docs/reference/shopee-open-api-developer-guide-v2.1.md
git commit -m "docs: add Shopee Open API guide reference"
```

## Follow-up prompt

Use this next:

```text
018-official-shopee-open-api-integration.prompt
```
