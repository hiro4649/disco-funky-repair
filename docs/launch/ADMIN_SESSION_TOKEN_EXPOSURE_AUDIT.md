# P1-AUTH-01 Admin Session Token Exposure Audit

## Scope

- Repo: `hiro4649/disco-funky-repair`
- Checked commit: `cf277011bfa9c9b67b6172407ae422dde486ec0e`
- Audit type: docs-only static source audit
- Code changes: none
- Staging update: not performed
- Funded tx verification: not performed because tBNB is not funded
- Production ready: not declared

This audit follows:

- `docs/process/FUNKY_SPEC_AUTHORITY.md`
- `docs/process/FUNKY_RELEASE_GATE.md`
- `docs/process/FUNKY_ASSET_OPERATION_RUNBOOK.md`
- `AGENTS.md`

## Audited Paths

- `apps/backend/src/app/config/passport.ts`
- `apps/backend/src/app/middlewares`
- `apps/backend/src/app/routes`
- `apps/backend/src/app/controllers`
- `apps/backend/src/app/lib`
- `apps/frontend/src/components/admin`
- `apps/frontend/src/context`
- `apps/frontend/src/store`
- `apps/frontend/src/utils`
- `apps/frontend/utils`
- `apps/frontend/src/components/Header`
- `apps/frontend/src/components/Layouts`
- `docs/launch`
- `docs/process`

## Static Commands Run

No secret values were copied into this report. Commands were used only for source inspection.

```powershell
git rev-parse HEAD
rg --files apps/backend/src/app/config apps/backend/src/app/middlewares apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/lib apps/frontend/src/components/admin apps/frontend/src/context apps/frontend/src/store apps/frontend/src/utils apps/frontend/utils apps/frontend/src/components/Header apps/frontend/src/components/Layouts docs/launch docs/process
rg -n "AuthAdmin|Authenticate|jwt|JWT|sign\(|verify\(|cookie|sameSite|httpOnly|secure|Authorization|Bearer|localStorage|sessionStorage|apiClient|withCredentials|credentials|adminKey|console\.log|console\.error|safeLogger|secretLogger|CORS|cors|SESSION_SECRET|NEXT_PUBLIC" <audited-paths>
rg -n "res\.cookie|clearCookie|cookie\(|cookie\.|session\(|express-session|passport|jwt\.sign|jwt\.verify|JWT_SECRET|ADMIN|admin" apps/backend/src/app/config/passport.ts apps/backend/src/app/middlewares apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/lib
rg -n "localStorage|sessionStorage|Authorization|Bearer|adminToken|userAuth|adminAuth|apiClient|withCredentials|credentials|cookie|document\.cookie|Cookies" apps/frontend/src/components/admin apps/frontend/src/context apps/frontend/src/store apps/frontend/src/utils apps/frontend/utils apps/frontend/src/components/Header apps/frontend/src/components/Layouts
rg -n "/admin" apps/backend/src/app/routes --glob "*.ts"
rg -n "adminKey|ADMIN_KEY" apps/backend/src/app/routes apps/backend/src/app/controllers apps/backend/src/app/middlewares apps/backend/src/app/config apps/backend/src/app/lib apps/frontend/src/components/admin apps/frontend/src/components/Layouts apps/frontend/src/components/Header apps/frontend/src/context apps/frontend/src/store apps/frontend/src/utils apps/frontend/utils
rg -n "cors\(|BACKEND_CORS_ORIGINS|credentials|origin:" apps/backend/src apps/backend
rg -n "configureSecurityMiddleware|express\.json|cookieParser|credentials|cors" apps/backend/src/app apps/backend/src
rg -n "adminAuth|userAuth|Authorization|Bearer|jwt|token" apps/frontend/src/components/Header apps/frontend/src/components/Layouts apps/frontend/src/components/admin apps/frontend/src/context apps/frontend/src/store apps/frontend/src/utils apps/frontend/utils
rg -n "req\.headers|req\.cookies|req\.body|authorization|adminAuth|userAuth" apps/backend/src/app/controllers apps/backend/src/app/routes apps/backend/src/app/middlewares apps/backend/src/app/config apps/backend/src/app/lib
```

## PASS

- `AuthAdmin` and `Authenticate` require a signed JWT and reject missing tokens.
- `AuthAdmin` checks the decoded admin against the `admin` table before granting access.
- `Authenticate` checks the decoded user id and wallet address against the `user` table before granting access.
- Admin mutation/read route files found in the audited backend route scope use `AuthAdmin`, except auth routes that perform signin/logout/verify.
- `body adminKey` bypass was not found in production route/controller/middleware code. Matches in audited source are tests or forbidden-env validation.
- Admin and user auth cookies are set with `httpOnly: true`, production `secure: true`, production `sameSite: strict`, and bounded `maxAge`.
- Backend CORS uses explicit origins from `BACKEND_CORS_ORIGINS` in strict runtime modes and enables credentials.
- `BACKEND_CORS_ORIGINS` strict validation rejects localhost, raw IP, example/invalid hosts, non-HTTPS origins, and path/query/hash in staging/production.
- Frontend `apiClient` uses `withCredentials: true`.
- No admin token storage in `localStorage` or `sessionStorage` was found.
- Frontend secret-like `NEXT_PUBLIC_*` validation exists and forbids public private key, secret, admin key, owner key, relayer key, hot wallet, and JWT env names.
- No active frontend private-key admin signer path was found in this audit scope.

## P0 Candidates

None found in this static audit.

No evidence was found that:

- `AuthAdmin` is disabled.
- A general user can access an admin token/session directly.
- `body adminKey` can perform admin operations.
- Admin JWT or Authorization header values are intentionally rendered in public UI.

## P1 Candidates

### P1-1: Admin JWT is returned to browser JavaScript and stored in Redux memory

Evidence:

- `apps/backend/src/app/controllers/auth.controller.ts:530-548` signs an admin JWT, sets an `adminAuth` cookie, and also returns the token in the JSON response.
- `apps/frontend/src/components/Auth/Signin/index.tsx:58-65` reads that token, dispatches it to Redux, and sets an Authorization header.
- `apps/frontend/src/store/slices/adminSlice.ts:33-39` stores `adminToken` in client-side state.
- `apps/frontend/src/components/Layouts/AdminLayout.tsx:40-42` re-applies the token to `apiClient` defaults.

Impact:

- The admin token becomes JavaScript-readable despite the httpOnly cookie.
- XSS, browser extensions, devtools screenshots, or raw error logging can expose the admin token.
- This conflicts with a cookie-only admin session boundary.

Suggested next PR:

- Remove `token` from admin signin JSON.
- Remove `adminToken` from Redux state.
- Use the httpOnly `adminAuth` cookie plus `/admin/verify` for admin session state.
- Do not set browser-side Authorization for admin UI.

### P1-2: `AuthAdmin` accepts Authorization header fallback

Evidence:

- `apps/backend/src/app/config/passport.ts:101-108` accepts `adminAuth` cookie first, then accepts a Bearer token from the Authorization header.
- `apps/backend/src/app/index.ts:48-52` allows the Authorization header in CORS.

Impact:

- Admin auth has two credential transport paths.
- If frontend or logs accidentally expose a Bearer token, the token remains usable without the httpOnly cookie.
- This weakens the intended cookie-only admin boundary.

Suggested next PR:

- Remove browser-facing Authorization fallback from `AuthAdmin`, or split machine/API auth from browser admin auth.
- Remove Authorization from browser CORS allowed headers unless a separated non-browser API explicitly needs it.

### P1-3: Global frontend `apiClient` Authorization default can attach admin token outside admin flows

Evidence:

- `apps/frontend/src/components/Auth/Signin/index.tsx:63-65` and `apps/frontend/src/components/Layouts/AdminLayout.tsx:40-42` set a process-wide `apiClient.defaults.headers.common.Authorization`.
- The same `apiClient` module is used by general UI contexts/components such as `apps/frontend/src/context/AuthContext.tsx`, `apps/frontend/src/components/Header/index.tsx`, and `apps/frontend/src/components/Header/DropdownUser.tsx`.

Impact:

- After admin login, non-admin API calls in the same browser runtime can carry the admin Bearer token.
- This can increase accidental exposure through request inspection, logs, or non-admin error handling.
- It also makes it harder to prove that general UI never touches admin authentication material.

Suggested next PR:

- Remove the global admin Authorization default.
- If temporary header auth remains, isolate it to an admin-only API client instance and clear it on route changes and logout.

### P1-4: Raw frontend error logging can include request config and Authorization header

Evidence:

- `apps/frontend/src/components/Layouts/AdminLayout.tsx:80` logs raw logout errors.
- Several admin components log raw error objects from `apiClient` calls.
- Axios error objects can include request config and headers.

Impact:

- While a browser-readable admin token exists, raw frontend error logging can expose it in the browser console.
- Console logs are not a secret-safe evidence channel.

Suggested next PR:

- Replace raw frontend `console.log(err)` / `console.error(error)` in admin session and admin API flows with sanitized status-only logging.
- Do not log request config, headers, cookies, or raw response payloads.

### P1-5: Raw backend error/body logging is not consistently using `safeLogger`

Evidence:

- `apps/backend/src/app/utils/safeLogger.ts` exists and redacts URLs, Bearer values, JWTs, and private-key-shaped strings.
- `apps/backend/src/app/config/passport.ts` uses safe auth logging that avoids token values.
- Several audited backend files still log raw `error`, `err`, or request body directly.
- Examples include `apps/backend/src/app/routes/routes.ts`, `apps/backend/src/app/controllers/auth.controller.ts`, `apps/backend/src/app/controllers/users.controller.ts`, and `apps/backend/src/app/routes/nft.routes.ts`.

Impact:

- Raw errors can carry headers, config, request bodies, URLs, or provider payloads.
- Raw body logging can record secret-like fields if a caller sends them.
- This violates the authority rule that raw payloads and credential material must not appear in logs.

Suggested next PR:

- Route admin/auth/backend boundary logging through `safeLogError` / sanitized metadata.
- Remove raw request body logging from admin routes.

### P1-6: Logout and session expiry are ambiguous

Evidence:

- `apps/backend/src/app/routes/auth.routes.ts:16` exposes admin logout as GET.
- `apps/backend/src/app/controllers/auth.controller.ts:557-565` clears only the cookie.
- Frontend clears Redux/header state only after a successful logout response in `apps/frontend/src/components/Layouts/AdminLayout.tsx:69-76`.
- `apps/backend/src/app/controllers/auth.controller.ts:680-729` verifies admin session only from cookie, not from the Authorization header.

Impact:

- If logout request fails, browser-side admin token state may remain.
- Admin state can desync between cookie verification and Authorization header state.
- GET logout is a state-changing action and should not be the final admin session contract.

Suggested next PR:

- Make admin logout POST.
- Clear client-side admin state in a `finally` path after logout is requested.
- Prefer cookie-only session verification and remove token-header state.

### P1-7: Express session cookie adds an extra session surface

Evidence:

- `apps/backend/src/app/middlewares/security.ts:68-82` configures `express-session` with a 24h cookie.
- The audited admin authentication path uses JWT cookies, not `req.session`.

Impact:

- An extra session cookie exists without a clear admin auth responsibility.
- If production uses the default session store, session behavior and expiry are not launch-ready evidence.
- This increases session/cookie complexity for audits and runtime operations.

Suggested next PR:

- Remove unused `express-session`, or document and configure a production session store with explicit scope and expiry.

## P2 Candidates

- `apps/backend/src/app/controllers/auth.controller.ts:552-554` uses an admin signin catch message that says "creating admin"; this is misleading and should be renamed during logging cleanup.
- `apps/frontend/utils/setAuthToken.ts` is present but was not found as an active call in the audited source; remove or quarantine it after cookie-only admin auth is adopted.
- `apps/frontend/utils/apiClient.ts` imports cookie/JWT helper libraries that are not used in that file; cleanup can reduce confusion after the admin token response is removed.
- Admin UI stores only `adminLocale` in `localStorage`; this is non-secret, but a short docs note can make future storage boundaries clear.

## UNKNOWN

- Runtime logs were not collected. This was source-wide static audit only.
- Browser bundle artifacts were not inspected.
- Hosting, CI, PM2, Docker, and deployed runtime env values were not inspected.
- It is not proven from static audit alone that no browser extension, proxy, or monitoring system records request headers.
- It is not proven from static audit alone that all future admin pages avoid importing the shared `apiClient`.

## BLOCKED

- Staging runtime smoke was not run because staging was not updated.
- Runtime log secret scan was not run against staging logs.
- tBNB is not funded; deploy, mint, sendToWallet, tier tx, governance tx, and funded tx smoke remain blocked.
- Staging domain is not finalized, so final staging cookie/CORS/HTTPS confirmation remains blocked.

## Next Small PRs

1. Cookie-only admin session PR:
   Remove admin JWT from signin response, Redux, and browser Authorization defaults. Use `adminAuth` httpOnly cookie and `/admin/verify`.

2. Browser Authorization boundary PR:
   Remove or split `AuthAdmin` Bearer fallback for browser routes, and remove Authorization from browser CORS unless a separate machine API is defined.

3. Safe logging PR:
   Replace raw admin/auth/frontend Axios error logging and backend raw error/body logging with sanitized status-only or `safeLogger` metadata.

## Final Notes

- Code was not changed.
- Staging was not updated.
- tBNB is not funded.
- Tx verification was not executed and is not marked PASS.
- This audit does not declare production ready.
