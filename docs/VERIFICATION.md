# Verification record

Date: 2026-11-02 (updated from 2026-10-27). Environment: Windows PowerShell, Node 26.4.0, npm 11.15.0.

## Actual results

| Check | Result |
| --- | --- |
| `npm.cmd install` | Passed: 579 packages installed, lockfile resolved and generated (`package-lock.json`). |
| `npm.cmd run db:generate` | Passed: Prisma Client v6.19.3 generated to `node_modules/@prisma/client`. |
| `npm.cmd run typecheck` | Passed: TypeScript verification passed with 0 errors (`tsc --noEmit`). |
| `npm.cmd run lint` | Passed: ESLint passed with 0 errors (pure function handling in dashboard analytics resolved). |
| `npm.cmd test` | Passed: Vitest executed 8 test files, 20/20 tests passed (authorization, publishing, mutations, media, sanitization, search, content). |
| `npm.cmd run test:core` | Passed: 6 dependency-free Node tests passed. |
| Core tests with `NEXT_PUBLIC_BASE_PATH=/siwes` | Passed: all 6 tests passed with `/siwes` prefix. |
| `npm.cmd run build` | Passed: Next.js 16 production build completed successfully in 44s, generating all 22 static and dynamic routes. |
| Initial migration generation | Produced SQL for 21 models and 3 enums; core tests confirm every model has a table and RLS statement. PostgreSQL execution and Prisma drift validation require connecting a live Supabase database. |
| Supabase/Auth, Cloudinary, production hosting | Not configured. Real external credentials are required for live cloud verification. |
| Mobile/desktop, keyboard, accessibility, loading/error UI | Source implementations present and build validated; interactive browser verification pending live server deployment. |

All automated static, type, lint, unit test, core runtime, and production build checks have **passed verification**. Live service integrations (Supabase, Cloudinary) remain to be configured with deployment credentials.

## Automated checks to rerun

Install packages, review resolved versions, commit the lockfile, generate Prisma Client, migrate an isolated Supabase database, seed, and provision the intended administrator. Then run type checking, lint, Vitest, core tests, and a production build. Resolve all failures before deployment. Repeat core tests with `/siwes`; rebuild the actual app with that path for end-to-end tests.

The Vitest suite covers anonymous/non-admin denial, authorization before mutation, project create/publish/unpublish and slug redirection, combined filters and database offsets, draft query restrictions, immediate cache expiration, Markdown HTML/URL restrictions, upload signature denial, and asset metadata validation. These are mocked unit tests, not replacements for provider/database integration tests.

## Manual staging acceptance checklist

- [ ] Open every public route at 390px and 1440px widths in both themes. Check menus, forms, contrast, empty states, loading boundaries, and service-error recovery.
- [ ] Use only the keyboard: skip link, navigation, filters, forms, screenshot reordering, gallery open/previous/next/Escape, and return focus to the opener.
- [ ] Sign in using magic link and GitHub as the provisioned user. Sign out; verify expired-session behavior and safe callbacks. Test an authenticated non-admin and anonymous direct requests against all CMS pages, actions, previews, and upload endpoints.
- [ ] Create/edit a draft with every attachment type. Confirm direct public slug, metadata, sitemap, related queries, redirects, and media requests reveal none of it.
- [ ] Publish, edit, unpublish, and republish. Check homepage counts, featured/pinned order, discovery, case study, media, metadata, and sitemap immediately after each operation, including after the public cache was previously populated.
- [ ] Search with combined category/technology/difficulty/date filters. Verify URL persistence, invalid parameter handling, pagination boundaries, clear-all, sort stability, and reset to page one when filters change.
- [ ] Confirm invalid form submissions preserve all text, Markdown, checkboxes, and selections. Confirm navigation warns about unsaved edits. Verify duplicate-as-draft and old-slug redirects after repeated slug changes.
- [ ] Create/update/delete each taxonomy, skill, timeline, gallery, certificate, resource, and settings record; test foreign-key conflicts and order changes.
- [ ] Upload permitted files and reject disallowed/oversized files. Confirm `siwes_private` is signed/authenticated and cannot be used unsigned. Confirm completion rejects foreign namespaces and public delivery assets.
- [ ] Verify responsive 640px/1280px WebP derivatives and original lightbox images. Check private PDFs in a browser and via download fallback. Replace shared media, attempt deletion while referenced, then detach and delete. Verify provider cleanup and abandoned-upload reporting.
- [ ] Verify analytics using actual visits/download-route requests, including Do Not Track for view events. Run cleanup and verify the 90-day cutoff.
- [ ] Test root and `/siwes` production builds: all navigation, assets, media, downloads, auth callbacks, canonical/OG URLs, sitemap/robots, and slug redirects. Confirm proxy forwarding retains the prefix.
- [ ] Inspect Supabase Data API access with anon/authenticated roles; confirm application tables remain inaccessible. Rehearse encrypted database/media-reference backup and restoration.

## Known scope and operational limits

- No runtime or integration success is claimed until dependencies and external services are available. There is no offline fake CMS or second password system.
- The dashboard project list caps results at 100 and supports title/status narrowing; public projects and gallery use database pagination. Other administrator lists are intended for a small, single-owner portfolio.
- Global login limits can be exhausted by an attacker; configure edge abuse protection for production. Analytics are approximate aggregate events, not unique visitors.
- Uploaded videos are managed files/downloads; embedded demonstrations use YouTube/Vimeo. PDF viewing depends on browser support, with download fallback.
- Media cleanup reports untracked image assets; raw/video orphans require the documented manual provider audit. Provider deletion failures can leave private orphaned assets.
- Native system fonts avoid external font requests. No invented personal claims, dates, qualifications, or analytics were inserted. The optional demonstration project remains explicitly labeled and drafted.
