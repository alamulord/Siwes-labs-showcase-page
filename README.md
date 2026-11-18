# SIWES Cybersecurity Portfolio

A Next.js App Router portfolio and single-administrator CMS for documenting industrial training. Public pages expose published content; Supabase authentication and a separately provisioned administrator record protect the CMS. Personal information starts as editable placeholders. Optional demonstration content is labeled and seeded as a draft.

**Verification status:** Automated checks (**Prisma client generation, TypeScript type checking, ESLint, Vitest test suite, core runtime tests, and Next.js production build**) have all **passed verification**. `package-lock.json` has been generated and validated. Live service integrations (Supabase and Cloudinary) require configuring deployment credentials. See [verification](docs/VERIFICATION.md) for details.

## Requirements and compatibility

- Node.js 22 LTS (22.12+) and npm; PostgreSQL through Supabase; Cloudinary.
- Next.js 16 / React 19, TypeScript strict, Tailwind 4, local shadcn/ui-style primitives with Radix, Framer Motion, Zod 4, Supabase SSR, Prisma 6.
- Prisma 6 uses the native PostgreSQL engine and `directUrl` configuration. Moving to Prisma 7 requires its driver adapter/configuration migration; do not update the major version independently.
- Dependencies are installed and locked in `package-lock.json`. All automated tests and builds pass.
- This is a standard Next.js Node deployment, not a static export or Cloudflare Workers/Vinext project. Use a supported Node host or Vercel.

## Install and configure

```powershell
npm.cmd install
Copy-Item .env.example .env
Copy-Item .env.example .env.local
```

On other shells use `npm` and `cp`. Windows `npm.cmd` avoids PowerShell script execution-policy issues. Set real values in both environment files, or export them centrally. Next.js reads `.env.local`; Prisma and the CLI scripts use `.env`. Neither file belongs in Git.

Configure `DATABASE_URL` using Supabase's transaction pooler, including `pgbouncer=true`, and `DIRECT_URL` using a direct connection or session pooler. URL-encode password characters. Keep both credentials server-only. Use the Supabase project URL and publishable key for Auth; no service-role key is needed in the app. Set the Cloudinary cloud name, API key, and API secret. See [.env.example](.env.example).

Without service variables, public pages show clean empty states and login explains setup. This is **not an alternative local authentication or persistence system**. For a fully working local environment, connect development Supabase/PostgreSQL and Cloudinary accounts. A configured but unavailable database produces the error boundary, rather than fabricated records.

## Database, seed, and administrator

```powershell
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
```

The versioned initial migration creates 21 relational tables, indexes, constraints, and deny-by-default RLS. Inspect it before applying to an existing database; use a dedicated Supabase project. Prisma migrations are the application schema source of truth. For later changes use `npx prisma migrate dev --name descriptive_change` against development, then commit the migration and deploy it. Do not rerun the initial-migration bootstrap utility against an established schema.

The seed is idempotent, creates editable taxonomy and placeholder settings, and does not assert skills or qualifications. Set `SEED_DEMO=true` only if you want a labeled demonstration project, saved as a draft with an explicitly illustrative date.

Create your intended administrator in **Supabase Dashboard → Authentication → Users**. Put that Auth UUID in `ADMIN_USER_ID`, then run:

```powershell
npm.cmd run admin:provision
```

Provisioning checks `auth.users`, serializes concurrent attempts, and refuses a different second administrator. Never expose this command as an application endpoint. To transfer access, revoke the old administrator's sessions, reassign its media ownership, and replace its `AdminProfile` using a trusted database maintenance session. Authentication of any other user grants no CMS privileges.

## Authentication providers

1. Enable email authentication and configure production SMTP in Supabase. Disable public email sign-ups. The app sends magic links with `shouldCreateUser: false` and returns generic responses.
2. Set Supabase Site URL to your configured origin plus deployment path. Allow exact callback URLs such as `https://example.com/auth/callback` and `https://example.com/auth/confirm` (or their `/siwes` forms).
3. The default PKCE code flow uses `/auth/callback`. For the email template using token hashes, set the link to `https://YOUR-ORIGIN[/siwes]/auth/confirm?token_hash={{ .TokenHash }}&type=email`. The confirmation endpoint accepts email tokens only.
4. Enable GitHub in Supabase and configure a GitHub OAuth application with the callback URL **Supabase provides**, usually `https://PROJECT.supabase.co/auth/v1/callback`. Store provider secrets in Supabase, not this repository.
5. Link the administrator's GitHub identity to the same Supabase Auth UUID. A separately created OAuth user is denied until trusted provisioning explicitly changes access.

Sessions use Supabase SSR cookies, refreshed by the Next.js proxy. Pages, actions, private queries, and signature endpoints check the administrator independently. Redirect destinations are restricted to dashboard paths. Expired sessions return to login or a generic action error; no password system is implemented.

## Cloudinary

Create a **signed** upload preset named `siwes_private`:

- Delivery type: `authenticated`; never `upload` or `private`.
- Restrict formats to JPG/JPEG, PNG, WebP, AVIF, PDF, MP4, WebM, TXT, ZIP, PPTX.
- Restrict size to 25 MB; raster images are additionally rejected above 5 MB by attachment verification.
- Disable overwrite. Do not permit unsigned use. Confirm your account permits private PDF/document delivery; Cloudinary can restrict PDF/ZIP delivery on new accounts.

Upload authorization returns a signed, random, administrator-scoped public ID. Completion retrieves authoritative metadata from Cloudinary and validates ownership namespace, delivery type, size, and format before storing a reference. Browser-reported URLs, sizes, and MIME types are not trusted.

Uploads remain authenticated at the provider. `/media/[id]` checks publication or administrator access, fetches a short-lived provider download server-side, and streams it without exposing the provider URL. Media responses are never cached. PDFs open in the browser with explicit download fallback links. Replace an attachment by uploading a new asset and selecting it in its content editor. Delete unused assets from Media; foreign keys reject deletion while referenced.

See [security and media notes](docs/ARCHITECTURE.md) for the tradeoff between immediate access revocation and CDN optimization, plus abandoned uploads.

## Run and verify

```powershell
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run test:core
npm.cmd run build
npm.cmd start
```

`test` runs Vitest tests for authorization, publishing, mutation denial, public filtering, cache invalidation, Markdown safety, and media restrictions. `test:core` runs dependency-free Node tests for URL generation, redirect safety, video allowlisting, and migration completeness. No coverage percentage is claimed or enforced. Run the manual service/browser checklist in [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Content workflow

Start in `/dashboard/settings`, then create categories, technologies, tags, skill categories, and skills. Upload media before attaching it. Projects have one category and multiple technologies/tags. Save drafts, preview while authenticated, then choose `PUBLISHED` and save. Use `DRAFT` to unpublish. Publication validates required metadata and case-study length. Feature projects and set lower pinned-order numbers to show them first.

Use one Markdown case study for objectives, problem, method, challenges, results/evidence, and lessons; architecture, screenshots, video, and downloads have structured attachments. Raw HTML is disabled. External links require HTTPS. Only YouTube and Vimeo embeds are accepted. For image captions/alt text, edit Media. Reorder screenshots with keyboard-operable Earlier/Later controls; other ordered content uses a numeric order field.

Dashboard lists expose edit/delete operations and project duplication. Project lists search titles and filter publication state, displaying at most 100 matching records; narrow the title search for older records. Public project discovery uses database pagination and combined URL filters. Home statistics count published projects by their **exclusive** `ProjectType` enum: security labs are `SECURITY_LAB`, programming projects are `PROGRAMMING`. Technology count is distinct technologies attached to published projects. Training duration is elapsed calendar days when both dates exist.

## Deploy at the root or `/siwes`

Set `NEXT_PUBLIC_SITE_ORIGIN=https://alamulord.online` and either an empty `NEXT_PUBLIC_BASE_PATH` or `/siwes`. These public variables are **build-time configuration**: rebuild when either changes. Do not include `/siwes` in the origin. Next Link handles `basePath`; raw anchors, fetches, callbacks, media, canonical URLs, and sitemap URLs use the centralized URL helpers.

For `/siwes`, deploy the Next app behind a host/reverse proxy that forwards `/siwes` **without stripping it**. Route the rest of the domain to your main portfolio. Configure the matching Supabase redirects and update the email template. Do not use a root-only static rewrite. Run the base-path tests and the complete browser checklist after rebuilding.

Configure server environment variables in the deployment host, run migrations in a trusted release step using the migration connection, build, and start. Use HTTPS, a supported Node runtime, and a private database network where available. Do not publish before installing dependencies, resolving checks, configuring providers, and verifying access isolation. [Backup and recovery](docs/OPERATIONS.md) covers ongoing operations.

## Source layout

- `src/app/`: public routes, protected CMS, server actions, authentication and upload handlers.
- `src/components/`: reusable UI, Radix lightbox, Markdown editor/rendering, theme and motion.
- `src/lib/`: server-only data/auth/media, validation, URL generation, taxonomy editor configuration.
- `prisma/`: schema, versioned migration, and labeled seed.
- `scripts/`, `tests/`, `docs/`: trusted operator tools, verification, and deployment/security notes.

## Evidence-led landing page

The landing page and `/work/[slug]` lab records use the local catalog in `src/lib/labs.ts` and the image manifest in `src/lib/evidence.json`. Optimized WebP copies of the supplied screenshots live in `public/evidence/`; the original `labs_images/` folder is retained. Add an entry to the catalog and its associated images to extend the showcase. The report control is a placeholder until a report is supplied. Run `npm install` and `npm run dev` to preview locally, or `npm run build` for a production build. The evidence-led landing page does not require CMS credentials.
