# User / Auth Controllers

## Purpose
Authentication and user management endpoints (login, OTP, registration, profile).

## Responsibilities
- User CRUD and role assignment
- JWT issuance
- OTP verification (auth/otp)

## Dependencies
- services/user, services/otp
- bcrypt, jsonwebtoken

## Public interfaces
Mounted at /api/v1/auth (userRouter) - no TokenCheck on public auth routes.

## Security notes
JWT_SECRET must be set in production. Default passwords via DEFAULT_PASSWORD env.

## Recent changes
| Date | Change |
|------|--------|
| 2026-07-05 | Co-located README added |
