# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains no application code, assets, tests, or build configuration. The workspace is named `Siwes landing page`; confirm the implementation stack before adding framework-specific files.

When creating the application, keep source code in `src/`, static assets in `public/` or the framework's standard asset directory, and tests alongside the features they cover. Use descriptive filenames such as `HeroSection` and `ContactForm`, following the chosen framework's conventions. Update this guide when the actual structure is established.

## Build, Test, and Development Commands

No development, build, lint, or test commands are configured yet. Do not assume commands such as `npm test` are available.

When introducing tooling, document its prerequisites and exact commands in `README.md`. For a Node.js project, expose consistent package scripts such as `dev`, `build`, `lint`, and `test`, and commit the selected package manager's lockfile.

## Coding Style & Naming Conventions

Follow the formatter and linter selected during project setup. Until then, use consistent indentation within each file, descriptive names, and small modules with clear responsibilities. Use lowercase, hyphen-separated names for static assets, for example `siwes-logo.svg`. Avoid introducing multiple formatting conventions or package managers.

## Testing Guidelines

No testing framework or coverage threshold is configured. Add tests for interactive behavior when implementing features, using the selected framework's naming convention, such as `ContactForm.test.tsx`. Document how to run them. For visual changes, check narrow and wide viewports, keyboard navigation, and browser console errors.

## Commit & Pull Request Guidelines

No Git history is available to establish existing commit conventions. Use short, imperative subjects such as `Add landing page hero section`, and keep each commit focused.

Pull requests should describe the change, explain validation performed, link relevant issues, and include screenshots for visual updates. Identify any setup steps or remaining limitations.

## Security & Configuration

Keep credentials and local environment files out of version control. If configuration is needed, provide a sanitized example file and document required variables.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
