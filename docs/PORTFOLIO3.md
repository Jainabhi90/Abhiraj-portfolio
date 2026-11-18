# Portfolio 3.0 implementation and review

19 November 2026. This report supersedes the 2.0 visual direction and earlier audit's light hero.

## Consolidation

Verified original main `e9afbec11ae3a386cbacfdd8931427000020acf5`, portfolio-2.0 `bcd0cd50dcf3ba36d69920610bcf9cb7fca920d6`, and audit-fixes `d0b1d2b4300bfa26177e759fe9057895576b0b14`. The feature branches were 60 and 61 commits ahead of main, with no divergence. Audit-fixes contained all 2.0 history.

Created `backup-main-2026-11-19` at original main. Baseline build, lint, typecheck, and six test groups each in Chromium and Firefox passed. PR #1 consolidated the source with a normal, history-preserving merge after the follow-up discussion. This was not a fast-forward: merge commit `d7c8d1080513ddd3f167caa01dc73eee797fb91d` has original main and audit-fixes as its two parents. Its tree exactly matched audit-fixes. Both feature branches remain. No force push, production-setting edits or DNS edits.

## Design and interactions

Primary reference: https://www.prathamperiwal.dev/ . Desktop and mobile hero, navigation and lower editorial layouts were inspected. The original stacked sans name, italic subtitle, specialty pills, edge socials and paired resume/contact actions follow that composition. The rest of the site uses the requested dark editorial adaptation, not the reference owner's personal content, metrics or assets. The current reference also uses light lower sections; this implementation follows the brief's dark sections instead.

An original canvas folded mesh bends and eases in response to the pointer behind the name. SVG displacement and per-glyph transforms affect the rendered name itself. The mesh is capped to a 1.5 pixel ratio, stops drawing off-screen, and is static for reduced motion. Touch does not require hover. No stock photos, personal photograph, replacement portrait or AI face was added.

Aitezaz (https://aitezaz.xyz/) informs only the multilingual introduction, ivory Selected Works and filtered Tech Stack. Work has five projects in the requested order, floating project-specific desktop previews with inertia, keyboard previews and static mobile imagery. Tech uses category-left/logo-grid-right structure with six controls and counts 7/6/5/4/3, total 25. Brand logos use MIT-licensed Devicon artwork. Standards and practices without brand logos use original neutral diagram symbols, not mismatched brand marks. GSAP is explicitly labeled as this portfolio's implementation technology.

The supporting scroll rectangle has scale, perspective and rotation states and reverses upward. It sits before Work and cannot cover its previews. GSAP/ScrollTrigger and Lenis own scroll motion; short CSS transitions handle menu and hover feedback. Heading and content reveals respect reduced motion and clean up on route changes.

The full-screen menu has all seven requested destinations, direct resume access, Escape, focus return and a keyboard loop. Main content becomes inert while it is open. QA caught an immediate-keyboard timing issue during reveal; removing the delayed visibility transition fixed it.

## Content and imagery

NioLearn public homepage was freshly inspected at https://niolearn.com/ and captured signed out, without private student information or analytics consent. The 64 KB WebP is used in Work and the case study. Its illustrated product mascot is part of the genuine product screen, not a portrait of the portfolio owner. No protected dashboard was invented or captured. Two projects without verified screens retain explicitly labeled editorial visuals.

EduOS is absent from shared public project data, generated routes, sitemap, metadata, previews, count and next-project sequence. Direct route returns 404. Legacy index and personal image asset paths return 404. The unchanged supplied resume was text-checked and does not mention EduOS. Historical documentation and Git history may still mention the removed project; they are not served by the application.

## Verification

Production build, TypeScript and ESLint pass. Seven groups in each of Chromium and Firefox pass (14 total). Tests cover nine widths; five case studies; sitemap and excluded routes/assets; loaded images; resume; mailto and copy fallback; keyboard and focus loop; intro skip and session logic; name movement/reset; previews including ten rapid row switches; six filters; logos; automated WCAG AA; reduced-motion/touch fallback; reverse scroll; navigation history; resize and arbitrary-position refresh.

Actual section images were inspected at 1440×900, 1920×1080, 768×1024, 390×844 and 375×812. Review covered hero, hero exit, multiple rectangle states, Work hover, expertise, Tech Stack, About, experience, leadership, contact and open menu. Visual checks found and corrected overlay sizing, mobile close-button position, light-to-dark contrast and image aspect metadata. Screenshots and test success are separate evidence: neither is claimed to prove exact reference fidelity.

Production-build Lighthouse, local Chrome, one mobile and one desktop run: mobile performance 97, accessibility 100, best practices 100, SEO 100; desktop performance 99, accessibility 100, best practices 100, SEO 100. Mobile LCP 0.9 s; desktop LCP 0.7 s. Scores are one-run lab measurements, not field guarantees.

## Limits and deployment

WebKit could not launch because required host libraries are unavailable. Real iOS/Android devices and assistive-technology review are not claimed. The source brief references screenshots that were not available in this conversation; live references were used and no exact screenshot-match claim is made.

Main development is authorized, including possible automatic publication. GitHub Pages was configured to publish main/root and may no longer serve its old HTML site after consolidation; that consequence was discussed and accepted. Vercel project linkage could not be inspected without sign-in. No Vercel or domain settings were changed. Repository commits and local production-build review do not establish a successful external deployment.
