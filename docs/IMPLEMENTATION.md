# Portfolio 2.0 - Implementation and review report

## Changes
A fresh Next.js App Router rebuild replaces the one-file HTML architecture. The old source is preserved in `legacy/index.html` and in main's history. Main, the live website, Namecheap, and DNS are not changed by this branch.

## Architecture and stack
- Next.js 16.4.6, React 19.3.1, TypeScript strict mode.
- Tailwind 4.3.5 with centralized CSS tokens and responsive custom styles.
- GSAP 3.15.1 / ScrollTrigger for reversible scroll choreography; Lenis 1.3.27 for desktop scrolling.
- Static homepage and six statically generated case studies. No database, CMS, or contact backend.
- Server-rendered sections and content models are separate from client interactions.
- Local Space Grotesk, Instrument Serif italic, and JetBrains Mono fonts. License files included.

## Design and animation
Dark ivory/charcoal composition, restrained green accents, large name typography, editorial serif contrast, indexed work, and a simple responsive navigation. Existing portrait reused in grayscale, not AI-generated.

The intro is a 2.15-second greeting timeline, not a fake network-loading percentage. It can be skipped, plays once per session, and is omitted for reduced motion. Hindi and Japanese rely on the device's Unicode font fallback.

The name uses real semantic HTML plus an aria-hidden, pointer-positioned surface reveal. No WebGL dependency is needed. A decorative cursor leaves the native cursor available and is disabled for touch/reduced motion.

The geometric scroll object starts small and angled on desktop, then expands and resolves into an original engineering-map composition before the work section. It reverses with scroll, does not pin or trap the page, and has a static mobile/reduced-motion fallback. This is a documented interpretation, not a claimed exact copy of Olivier's current site. The current reference sites differ from parts of the written brief.

Project visuals are either existing live-site captures (InstaLead, GitHub Analyser) or clearly labeled editorial graphics. The NioLearn graphic is not a fabricated product screenshot. ArbDetector's promotional homepage was not reused because it includes return guarantees that this portfolio should not repeat.

## Content provenance
- Supplied resume: education (8.95 CGPA), NioLearn role/contributions, project contributions, leadership, achievements, verified embedded links, and the actual downloadable PDF.
- Supplied blueprint: Gmail overrides the academic address for site contact; EduOS is included as development-stage work; explicit branch-only/no-production direction.
- Existing repository: original source, portraits, and project destinations.
- EduOS README, package.json, and architecture specification: monorepo and documented design direction. No production readiness, shipped modules, security guarantees, test pass counts, or customer figures are invented.

NioLearn's team authorship is explicit. Fnatics is a team hackathon prototype. No revenue, customer, or enrollment statistics are added. The resume itself remains byte-for-byte unchanged and still contains the academic email supplied in the original PDF; site contact uses Gmail.

## QA executed
- Production build: pass, 12 generated static pages including not-found/metadata routes.
- TypeScript: pass.
- ESLint: pass, no warnings.
- Playwright: 3 test groups pass. Nine requested widths (320/375/390/430/768/1024/1280/1440/1920) checked for horizontal overflow; all six case-study routes checked.
- Resume route: HTTP 200, PDF MIME type, original 91,388-byte document checked.
- Mobile menu, Escape/focus return, navigation close, clipboard success, mailto destination: pass.
- Reduced motion, pointer-following name, reversed scroll transform, reload at scroll position, browser history: pass in Chromium.
- axe scan using WCAG A/AA tags through 2.2: zero violations on the tested mobile homepage. This automated scan is not a full accessibility certification.
- Firefox: homepage, mobile-width overflow, menu and NioLearn case-study smoke checks pass.
- WebKit could not launch due to missing host libraries. Real Safari, iOS Safari, and Android hardware were not tested. Chromium mobile viewport checks are not real-device testing.
- Visually inspected desktop hero/work/case-study and 390px hero/work/about/contact screenshots. No horizontal clipping or unreadable blocks observed at those captured states.

## Local performance measurement
Lighthouse against the production localhost build, default mobile simulation, November 18, 2026:
- Performance: 100
- Accessibility: 100
- Best practices: 100
- SEO: 100
- FCP: 0.8s; LCP: 0.8s; CLS: 0; TBT: 30ms; Speed Index: 1.6s.

These are one local lab run, not deployed/field results or guarantees. INP was not measured. Hosting/network conditions can change the result.

## Known limitations and review items
- Safari/WebKit and real-device compatibility need follow-up testing.
- No production or custom-domain deployment has been made. Canonical currently uses the existing `abhirajjain.vercel.app` host. Update the content model only when the custom domain is connected and serving the approved build.
- NioLearn's public homepage returned a browser-check interstitial during capture, so its product claims come from the user's resume, not an independent public audit.
- LinkedIn destination is extracted exactly from the supplied resume; access may require login. No invented handle.
- Project demos depend on their own upstream services. ArbDetector data-feed/mock fallback and trade executability have not been audited; the case study states that limit. No investment advice or guaranteed returns.
- No fake email form or unconnected backend. Contact is mailto plus copy-to-clipboard.
- Hero interaction uses a CSS reveal rather than liquid WebGL distortion. Mobile uses a readable static treatment.
- Project card imagery is inline and gains a hover scale, not a hover-only content reveal. All content and links remain available without hover.

## Run locally
1. Use Node 20.19+ (validated with Node 22.23.5).
2. `npm ci`
3. `npm run dev`
4. For the production build: `npm run build && npm run start`.
5. `npm run lint && npm run typecheck && npm run test:e2e`.
   Run `npx playwright install chromium` to use Playwright's managed browser. An existing Chrome executable can be selected through `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

## Deployment after review
1. Review the branch and all project case studies; do not merge until approved.
2. In the existing Vercel project, verify its connected repository, production branch, domain list, and current framework settings before changing anything.
3. Use a preview deployment from this branch with Framework = Next.js, Install = npm ci, Build = npm run build, and default Next.js output. No application secrets are needed.
4. Recheck navigation, PDF, all six routes, images, clipboard, metadata and performance at the actual preview URL.
5. After explicit production approval, merge to the verified production branch or promote the approved preview. Do not set a static HTML output directory for Next.js.
6. Connect abhirajjain.me only with separate user approval and the exact DNS values Vercel supplies. Then update the canonical/site URL and verify HTTPS, redirects, sitemap and social preview.
7. Rollback: restore the prior Vercel deployment and/or revert the merge. Original HTML and assets remain recoverable from main's original commit and `legacy/`.

## Visual correction, November 19, 2026

The first version's visual acceptance was rejected. See VISUAL-CORRECTION-PLAN.md for the replacement design, direct live-reference findings, tested interactions and open acceptance gates. This correction supersedes the acid-green/portrait/inline-project-card presentation. Do not infer current design acceptance from the first version's build or Lighthouse results. A corrected production build, typecheck, lint and four browser test groups pass locally. A Vercel preview and exact fidelity to the missing screenshot attachments remain pending.
