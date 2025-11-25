# safety-tips (tips shown to users)
CRUD for safety tips (admin) and public fetch for About page.

## Files
- `safetytip.route.ts` / `safetytip.controller.ts` / `safetytip.service.ts`

## Frontend connection
`about.html` pulls `GET /safety-tips`; admins manage tips via POST/PATCH/DELETE.
