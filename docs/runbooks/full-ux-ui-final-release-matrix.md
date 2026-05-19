# Full UX/UI Final Release Matrix (Phase 019)

| Menu/Route | Feature group | Primary action | Secondary actions | Empty state | Loading state | Error state | Disabled state | Mobile ready | Light mode ready | Dark mode ready | System mode ready | Security notes | Remaining gap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| /, /login, /register | Public/Auth | Sign in / Register | Navigate to dashboard | Present | Present | Present | Present | Yes | Yes | Yes | Yes | No secret leakage in UI | none |
| /dashboard + core routes | Dashboard Main | Discover modules | Quick navigation | Present | Present | Present | Present | Yes | Yes | Yes | Yes | Auth-gated routes preserved | minor copy consistency follow-up |
| /dashboard/products* | Products/Import | Add/import product | Similar/affiliate/export actions | Present | Present | Present | Present | Yes | Yes | Yes | Yes | No private endpoint/scraping claims | none |
| /dashboard/generator + history | AI/Content | Generate content | Copy/export/history | Present | Present | Present | Present | Yes | Yes | Yes | Yes | Affiliate disclosure retained | none |
| /dashboard/templates | Templates | Manage templates | duplicate/restore defaults | Present | Present | Present | Present | Yes | Yes | Yes | Yes | Safe copy only | none |
| /dashboard/ocr | OCR | Upload and extract | Review/save product | Present | Present | Present | Present | Yes | Yes | Yes | Yes | OCR accuracy warning kept | none |
| /dashboard/similar + export panels | Similar/Export | View similar products | Refresh/export | Present | Present | Present | Present | Yes | Yes | Yes | Yes | CSV injection-safe handling preserved | none |
| /dashboard/hyperframes* | HyperFrames | Compose/enqueue render | History/batch/ops/queue | Present | Present | Present | Present | Yes | Yes | Yes | Yes | No systemd controls, no outputPath leaks | none |
| /dashboard/admin* | Admin | Review aggregate status | read-only subpages | Present | Present | Present | Present | Yes | Yes | Yes | Yes | Gated shell and safe operator copy | none |
| /dashboard/settings | Settings/Theme | Update preferences | Theme toggle light/dark/system | Present | Present | Present | Present | Yes | Yes | Yes | Yes | Local-only theme persistence, no secret display | none |
| Shopee Open API status UI | Open API foundation | Show disabled/foundation state | docs/runbook links | Present | Present | Present | Present | Yes | Yes | Yes | Yes | Official API only wording preserved | none |
