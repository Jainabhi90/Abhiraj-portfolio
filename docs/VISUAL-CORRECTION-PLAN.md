# Visual correction plan - Portfolio 2.0

Status: reference screenshots requested, not yet received. This plan is provisional where image-specific composition is required. Keep Next.js architecture, source-grounded content, case-study routes, and branch-only deployment boundary.

## Audit of the first version

- Identity: too uniformly dark, wrong acid-green accent. Replace with near-black / soft ivory rhythm and mint #35D4A0.
- Navigation: conventional sticky bar instead of circular floating menu. Replace its presentation while preserving semantic links, focus handling, and keyboard access.
- Hero: name is readable, but circular color reveal is the exact approach the correction rejects. Replace with position-dependent displacement/warping using semantic text and an aria-hidden visual layer, with static reduced-motion and touch fallback. Include explicit Co-Founder & CTO of NioLearn role.
- Work: oversized inline cards do not match the requested editorial rows. Use ivory surface, SELECTED + mint italic works, numbered uppercase rows, stack metadata and right-side action. Desktop floating rotated preview must ease toward pointer position. Touch gets an inline thumbnail and the same case-study links.
- Skills: plain text list lacks visual cards and filtering. Add source-grounded technology data, recognizable logos, actual category counts, accessible filter controls and useful empty state. Do not pad categories with unverified skills.
- Scroll object: existing one-stage transform is too simple. Design a multi-stage sequence: asymmetric compact rectangle, central geometric expansion, composition change, then alignment into the work section. Use transform/opacity scrub and reversible progress, no mobile scroll trapping.
- About: remove portrait and photo references from active source/assets. Typography-led story, oversized AJ / geometric detail, NioLearn leadership and verified education.
- Intro: retain bounded greeting timeline, refine entry/exit masks and stagger hero metadata/navigation after exit; skip/session/reduced-motion behavior retained.

## Provisional section specification

1. Hero, near-black: large condensed-looking name, understated role text, soft mint atmospheric layer and grain, floating circular nav.
2. Geometric transition: controlled ivory/mint rectangle choreography leads into work, no content dependent on hover or animation.
3. Selected Works, ivory: mint italic word, thin underline and separators, full-width list. Exact spacing, preview size, and title ratio await screenshot two.
4. About, near-black: editorial split typography and facts without any photo, avatar, silhouette, or face-like substitute.
5. Experience, ivory or dark depending on final rhythm: keep accurate NioLearn contributions and timeline.
6. Tech Stack: heading MY TECH stack; data-driven logo-card grid and six filters. Exact card dimensions, column count, category treatment and background await screenshot one.
7. Leadership / education / contact: reuse verified content, align type, mint accent and transitions with the corrected system. No portrait in cases or social imagery.

## Review gates

- Obtain the two actual screenshots before declaring fidelity.
- Inspect desktop and mobile pixels at 390/768/1440/1920, with larger section crops rather than a tiny full-page overview.
- Record hover following, filtering and counts, intro timing/skip, scroll reversal and navigation.
- Re-run route, PDF, TypeScript, lint, build and accessibility checks after design changes.
- Deliver a genuine hosted preview. Local video is supporting evidence only; Vercel MFA currently blocks that step.
- Main, production deployment, and domain settings remain untouched.

## Implemented correction, November 19, 2026

Live references were inspected on desktop and mobile. Aitezaz's lower work and tech sections were inspected directly; work hover and the Frontend category filter were exercised. Pratham's hero name was hovered. Olivier's current homepage is an editorial composition, so the rectangle is an original GSAP interpretation, not a claim to reproduce a currently visible interaction.

Implemented: mint #35D4A0 dark theme; ivory Work, Experience and Leadership; circular top-right menu; SVG displacement plus proximity-based glyph bending; six ivory work rows with viewport-clamped eased previews; touch inline previews; five technology groups and all-categories filter; 18 genuine Devicon logos; no portrait; multi-stage reversible scroll rectangle and composition change; greeting mask exit and staggered hero/supporting navigation reveal.

Accessibility adjustment: on ivory only, the emphasized works heading uses a darker green #17835E to meet text contrast. Mint remains the dark-surface accent and decorative underline. Category names are requested labels, not claims that every subdiscipline in each name is represented. Java/Git/GitHub appear in AI, Testing & Tools; this does not claim an AI framework or testing-library skill.

Validation: typecheck, lint, production build and four Playwright test groups pass. Automated checks cover nine viewport widths (including 390/768/1440/1920), all six case-study routes and the resume PDF, keyboard menu, clipboard, WCAG2/2.1/2.2 AA axe scan, intro skip, displacement activation, work preview movement/change/dismissal, six filter counts and portrait URL absence. Pixel review uses separate section captures at each of the four requested widths, plus hover and rectangle progress states. There was an actual 768px overflow from an invisible preview; corrected with viewport-fixed, clamped positioning. There was an actual contrast failure for the light mint heading; corrected with darker green on ivory.

Still not accepted as complete: the two original screenshot attachments have not been supplied, so only live-reference resemblance can be assessed. Hosted Vercel preview is not yet available because the account needs MFA. Local tests and screenshots do not satisfy that hosted-preview gate. No main, production deployment or domain settings changed.
