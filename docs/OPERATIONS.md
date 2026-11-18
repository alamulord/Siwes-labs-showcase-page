# Operations, backup, and recovery

## Release

1. Use an isolated staging Supabase project and Cloudinary environment first.
2. Install dependencies, review/commit the lockfile, and run all documented checks.
3. Back up PostgreSQL before applying migrations. Apply `npm run db:migrate` through a trusted migration connection.
4. Set host secrets, build with the intended origin/base path, and deploy to a Node-compatible host.
5. Verify public/draft access, provider callbacks, upload completion, downloading, publishing, unpublishing, and sitemap isolation.

Do not run `prisma migrate reset` against production. Application rollback does not automatically reverse database changes; prefer compatible additive migrations and forward repairs.

## Backups

- Enable Supabase managed backups/PITR appropriate to your plan. Periodically export application schema/data using `pg_dump` with a direct/session connection, storing encrypted backups outside the application host. Use a secrets manager or protected environment for connection strings; do not paste credentials into shell history.
- Include all application tables, especially `MediaAsset`, attachment joins, settings, slug redirects, and `AdminProfile`. Auth identities are managed separately; verify Supabase's Auth restore guarantees for your backup method.
- Database backups contain media references, not media bytes. Enable Cloudinary's backup/versioning capability where available and retain separate encrypted exports of critical reports and certificates. Retain original public IDs, provider asset IDs, resource types, and authenticated delivery types.
- Define an operational recovery point/time objective and rehearse restoration. No recovery SLA is claimed by this code.

## Restore

Restore to an isolated Supabase project first. Apply the matching migrations or restore the schema from the same backup version, not both blindly. Restore media to the intended Cloudinary environment with matching references, or update references transactionally. Verify `MediaAsset` IDs and every foreign key, check Auth UUID continuity, and provision the intended administrator only after verifying their identity. Revoke obsolete sessions and rotate compromised credentials. Configure the new origin/provider callbacks, rebuild, and run the manual verification checklist before switching DNS/traffic.

## Daily maintenance

Run `npm run media:cleanup` in a trusted scheduled environment with database and Cloudinary variables. It removes analytics older than 90 days and expired rate-limit buckets, and reports untracked image assets older than 24 hours. Review those reports and audit raw/video assets in Cloudinary. Do not delete provider assets merely because a public page does not show them: drafts and shared references may use them.

Back up before manually deleting abandoned media. Inspect provider metadata and all database references. Successful provider deletion should invalidate delivery copies; private application responses already use no-store. Review deployment logs for generic cleanup/provider failures, without logging request bodies, cookies, authorization headers, SMTP tokens, or connection strings.

## Subpath deployment

For `alamulord.online/siwes`, use origin `https://alamulord.online`, base path `/siwes`, and forward that prefix intact to Next.js. Rebuild after changes. Configure Supabase callback/confirmation allowlists and email templates with the same prefix. Check `/siwes/projects`, `/siwes/dashboard`, `/siwes/media/...`, `/siwes/auth/callback`, `/siwes/sitemap.xml`, and `/siwes/robots.txt`. Root deployment uses an empty base path. Never strip the prefix in a proxy while also enabling Next.js `basePath`.
