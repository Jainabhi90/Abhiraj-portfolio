# Abhiraj Jain / Portfolio 2.0

A dark, editorial developer portfolio built with Next.js, TypeScript, GSAP and Lenis. Static pages, small client interaction components, self-hosted fonts, and six engineering case studies.

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
npx playwright install chromium
npm run test:e2e
```

## Review

See [the implementation report](docs/IMPLEMENTATION.md) for architecture, content provenance, executed test results, performance measurements, known limits, and deployment steps. This is a review branch, not permission to update production.

The supplied résumé is included unchanged in `public/resume/Abhiraj-Jain.pdf`. Contact and project content is in `src/content/portfolio.ts`. Theme tokens and responsive styles are in `src/app/globals.css`. The original one-file website is in `legacy/index.html` and the original main history.

No database, service key, or runtime environment variable is needed by the site. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` is an optional test-only executable override.
