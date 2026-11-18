# Abhiraj Jain / Portfolio 2.0

An editorial developer portfolio built with Next.js, TypeScript, GSAP and Lenis. Static pages, small client interaction components, self-hosted fonts, and five engineering case studies.

## Start

```sh
npm ci
npm run dev
```

## Validate

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

## Review

See [the current audit](docs/AUDIT-2026-11-19.md) and [screenshots](docs/screenshots/) for the latest corrections and verification scope. Older reports below describe previous work and are superseded by the audit.


See [the implementation report](docs/IMPLEMENTATION.md) for architecture, content provenance, executed test results, performance measurements, known limits, and deployment steps. This is a review branch, not permission to update production.

The supplied résumé is included unchanged in `public/resume/Abhiraj-Jain.pdf`. Contact and project content is in `src/content/portfolio.ts`. Theme tokens and responsive styles are in `src/app/globals.css`. The obsolete one-file page and stored portrait assets were removed on the audit branch. The original remains in Git history.

No database, service key, or runtime environment variable is needed by the site. Tests run against an isolated production server on port 3101.
