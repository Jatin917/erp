# Services

## Purpose
Business logic layer between controllers and Prisma.

## Modules
| Directory | Domain |
|-----------|--------|
| school/ | Branches, custom fields, school ops |
| student/ | Student admission, enrollment |
| fees/ | Fee heads, templates, transactions |
| attendance/ | Student and faculty attendance |
| user/ | User operations |
| producers-notifications/ | BullMQ job producers, schedulers |
| utils/ | Shared service helpers |
| otp.ts, redis.ts | OTP and Redis clients |

## Conventions
Services export async functions; controllers handle HTTP. Use prisma from server.ts.

## Recent changes
| Date | Change |
|------|--------|
| 2026-07-05 | Co-located README added |
