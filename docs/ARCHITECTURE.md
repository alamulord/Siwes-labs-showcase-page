# Architecture and security model

## Boundaries

Server Components render public content. Prisma is the sole application data layer. Supabase is used for Auth, not browser-side data access. Server Actions mutate content; Route Handlers handle OAuth/email callbacks, signed upload initiation/completion, authenticated media, aggregate analytics, and downloads. Client Components provide theme switching, subtle motion, live Markdown preview, form state, upload progress, and the Radix lightbox.

`AdminProfile.id` is a trusted Supabase `auth.users.id` UUID. Provisioning verifies this relationship through a server-only SQL query; Prisma does not own the Supabase Auth schema. No registration or application UI can create administrator records. The application validates the Supabase user on each privileged operation, then checks the record. Proxy checks refresh sessions but are not authorization.

## Database access

Prisma's connection is privileged and may bypass RLS. Therefore **RLS does not protect Prisma operations**: application authorization and explicit publication filters do. The initial migration enables RLS without browser policies and revokes table/sequence privileges from Supabase `anon` and `authenticated` roles when those roles exist. Do not grant these roles access later. For future migrations, enable RLS and revoke privileges on every new application table. Confirm Supabase API exposure settings and avoid exposing the application schema through unrelated RPCs/views.

The administrator's UUID must never be inferred from an email domain or editable user metadata. Authenticated non-admins receive generic denial. Database credentials and Cloudinary secrets are imported through server-only modules. Zod validates environment values and every content mutation. ORM queries and the provisioning SQL use parameters. Database constraints protect uniqueness, relationships, and reference-aware deletion. Multi-record project writes and duplication use transactions.

## Publication and caching

Public queries explicitly require `PUBLISHED`, including related/adjacent projects, metadata, sitemap, redirects, media references, resources, and timelines. Admin preview is a separate authenticated route with uncached dynamic rendering. Cached public settings, taxonomy, project pages, and individual case studies share the `content` tag. Mutations expire that tag immediately and revalidate the root layout; no stale-while-revalidate window is used after unpublishing. Other public queries are dynamic. Media is always checked live and served with `private, no-store`.

Slug changes reserve the previous slug in `SlugRedirect`. Redirects resolve the current project by ID only while published. Reserved slugs cannot be claimed by other projects. Project deletion removes associated redirects and joins; referenced media survives for explicit cleanup.

## Content and media

Markdown disables raw HTML, sanitizes the rendered tree, allows HTTPS links only, and limits Markdown image hosts to Cloudinary. Never paste signed provider URLs into Markdown; use managed attachments to preserve publication-based access checks. Static Markdown media URLs cannot be revoked by the app. Embed providers are explicitly allowlisted. A baseline CSP, frame restriction, MIME sniffing protection, and referrer policy are configured. The baseline CSP permits inline framework scripts/styles; a nonce-based policy is a future hardening option, not an implemented guarantee.

Authenticated Cloudinary uploads protect originals and derivatives at the provider. Random upload IDs are scoped to the administrator; authoritative provider metadata is re-fetched before attachment. Signed-preset restrictions must be configured at Cloudinary as well as checked in the app: completion validation cannot undo bandwidth/storage already used by an upload.

The media gateway streams short-lived authenticated download requests server-side. This avoids permanent signed delivery URLs in public HTML and stale optimizer caches after unpublishing. Existing downloaded copies cannot be revoked. Raster uploads synchronously generate authenticated 640px and 1280px WebP derivatives with automatic quality. Responsive image markup requests these through the same authorization gateway; transformed Cloudinary URLs stay server-only. Originals remain available for the lightbox and downloads. This avoids public optimizer caching; enforce compact source images (maximum 5 MB). Existing media imported outside this upload flow needs matching derivatives before using responsive image markup. Derivative generation and delivery remain unverified without Cloudinary credentials. Video embeds support YouTube/Vimeo; uploaded video files are downloadable attachments, not a dedicated streaming service.

Asset deletion first removes an unreferenced database row (foreign keys reject shared usage), then asks Cloudinary to destroy the asset. Provider failure leaves a private orphan, logs a generic cleanup message, and requires reconciliation. Uploaded-but-unattached records remain in Media until explicitly deleted. Failed completion can leave provider-only assets; inspect assets older than 24 hours and compare provider asset IDs with the database before deletion. The cleanup script reports untracked images and does not automatically destroy them. Audit raw/video resources separately.

## Analytics and limits

Daily buckets count page views, project views, and resource download-route requests. No raw IP, user-agent, visitor identifier, or fingerprint is stored. View events are deduplicated with a sessionStorage flag and honor Do Not Track. Download events count requests and may include bots or repeats; they do not measure completed downloads. Counts are approximate, not unique visitors.

PostgreSQL-backed fixed-window limits apply globally to login/OAuth/analytics and per administrator to signed uploads/completion. This avoids IP collection and works across app instances, but global login limits can be exhausted by an attacker. A deployment-edge limiter is recommended for public abuse resistance. Retain aggregate analytics for 90 days; run cleanup daily to enforce retention and remove expired rate buckets. Access/error logs managed by your hosting provider are separate; configure their redaction and retention.
