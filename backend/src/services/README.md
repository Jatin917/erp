# Services

## Purpose
Business logic layer between controllers and Prisma.

## Modules
| Directory | Domain |
|-----------|--------|
| school/ | Branches, custom fields, school ops |
| student/ | Student admission, enrollment, async bulk upload |
| fees/ | Fee heads, templates, transactions |
| attendance/ | Student and faculty attendance |
| user/ | User operations |
| producers-notifications/ | BullMQ job producers, schedulers, email + bulk-upload workers |
| utils/ | Shared service helpers |
| otp.ts, redis.ts | OTP and Redis clients |

## Conventions
Services export async functions; controllers handle HTTP. Use prisma from server.ts.

## Public interfaces (school)
- `createCustomFieldService` / `updateCustomFieldService` / `getCustomField(s)Service`
- Option helpers: `customFieldRequiresOptions`, `normalizeCustomFieldOptions`

## Recent changes
| Date | Change |
|------|--------|
| 2026-09-20 | Welcome email worker (`email-queue` / `send-welcome-email`); run via `npm run worker-email` |
| 2026-09-18 | Custom field update + option normalization |
| 2026-09-18 | Async bulk upload (`student/bulk-upload.ts`) + queue producer |
| 2026-07-05 | Co-located README added |
