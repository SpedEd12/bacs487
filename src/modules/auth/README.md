# auth (login/signup)
Endpoints for creating accounts and logging in (JWT).

## Files
- `auth.route.ts` (routes)
- `auth.controller.ts` (parse/validate)
- `auth.service.ts` (hash passwords, issue tokens)

## Frontend connection
`login.html`, `signup.html` → `POST /auth/login`, `POST /auth/signup` (frontend stores the JWT).
