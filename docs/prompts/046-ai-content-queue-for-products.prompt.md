# 046 — AI Content Queue for Products Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after Product import, deduplication, and social draft persistence are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
046 — AI Content Queue for Products.

Priority:
High. Operators need safe bulk content generation for imported products without blocking requests, exceeding quotas, or calling providers unsafely.

Primary objective:
Build a database-backed queue for bulk generating posts/captions/descriptions from imported Product records, with quotas, retries, progress, review status, and safe provider error handling.

Hard constraints:
- Do not call real AI providers in tests.
- Do not expose API keys, prompts with secrets, provider stack traces, local paths, DATABASE_URL, tokens, cookies, sessions, or raw headers.
- Do not auto-publish generated content.
- Generated content must remain reviewable/editable before use.
- Enforce user/tenant scoping and quotas.
- Preserve affiliate disclosure when content includes affiliate URLs.
- Avoid fake reviews, fake personal experience, fake urgency, guaranteed income/savings, medical/financial unsupported claims.

Review first:
- src/services/AIContentService.ts
- src/services/PromptBuilder.ts
- src/services/TemplateRenderer.ts
- src/app/api/ai/generate/route.ts
- src/app/api/ai/generate-batch/route.ts
- src/services/BudgetService.ts
- prisma/schema.prisma
- src/app/dashboard/generator/**
- src/components/**generator**
- tests/services/AIContentService.test.ts
- tests/api/ai-generate-routes.test.ts if present
- tests/components/growth-copy-safety-static.test.ts
- package.json
- start.sh

Required design:
1. Schema
Add model(s) if not present:
```prisma
model AIContentQueueJob {
  id             String @id @default(cuid())
  userId         String
  productId      String?
  status         String @default("PENDING")
  kind           String
  platform       Platform?
  tone           Tone?
  language       Language @default(TH)
  input          Json?
  output         Json?
  errorSummary   String?
  attempt        Int @default(0)
  maxAttempts    Int @default(3)
  startedAt      DateTime?
  completedAt    DateTime?
  failedAt       DateTime?
  cancelledAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([userId, status, createdAt])
  @@index([status, createdAt])
}
```

Use enums if repo style prefers.

2. Service
Create/finalize:
```text
src/services/AIContentQueueService.ts
```

Responsibilities:
- enqueue jobs for selected products.
- enforce quota/budget.
- build safe prompts using Product data.
- reject unsafe claim requests.
- process jobs with retries/backoff.
- store output safely.
- cancel jobs.
- list job progress.

3. API routes:
```text
POST /api/ai/content-queue
GET  /api/ai/content-queue
GET  /api/ai/content-queue/[id]
POST /api/ai/content-queue/[id]/cancel
POST /api/ai/content-queue/[id]/retry
POST /api/products/bulk-generate-content
```

Behavior:
- auth required.
- user scoped.
- input product IDs must belong to user.
- quota checked before enqueue and before processing.
- safe shaped errors.

4. Worker:
Create:
```text
scripts/ai/content-queue-worker.ts
```

Add npm scripts:
```json
"ai:content-worker": "tsx scripts/ai/content-queue-worker.ts",
"ai:content-worker:once": "tsx scripts/ai/content-queue-worker.ts --once",
"ai:content-queue-status": "tsx scripts/ai/content-queue-status.ts"
```

Worker behavior:
- atomically claims pending jobs.
- processes bounded batch.
- retries transient provider failures.
- marks failed after max attempts.
- never logs raw provider keys.

5. Dashboard UI
Add bulk generation UX to `/dashboard/products` or `/dashboard/generator`:
- select products.
- choose platform/tone/language/template.
- enqueue generation.
- show job progress.
- show outputs for review.
- send approved output to SocialDraft or ContentGeneration if appropriate.

6. Tests:
```text
tests/services/AIContentQueueService.test.ts
tests/api/ai-content-queue.test.ts
tests/scripts/ai-content-queue-worker-static.test.ts
tests/components/ai-content-queue-static.test.tsx
tests/security/ai-content-queue-redaction.test.ts
```

Coverage:
- auth required.
- user scoping.
- product ownership validation.
- quota enforcement.
- enqueue/list/get/cancel/retry.
- worker retry behavior.
- no real provider calls.
- unsafe claims rejected/sanitized.
- no secret/path leakage.

7. Documentation:
Create:
```text
docs/runbooks/ai-content-queue-for-products.md
```

8. start.sh marker:
```text
AI_CONTENT_QUEUE_CONFIGURED=true
```

Verification:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run typecheck
npm run test
npm run build
npm run ai:content-worker:once
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- AI_CONTENT_QUEUE_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. Queue/service behavior
7. API behavior
8. Worker behavior
9. Dashboard behavior
10. Safety/quota behavior
11. Commands run
12. Blocking issues
13. Remaining risks
14. Commit hash
15. PR status

Final line:
AI_CONTENT_QUEUE_READY=true or AI_CONTENT_QUEUE_READY=false
```
