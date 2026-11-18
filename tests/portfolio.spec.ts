import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const slugs = [
  "niolearn",
  "arbdetector",
  "instalead",
  "github-analyser",
  "fnatics",
];

/* Lenis owns smooth scrolling; programmatic jumps must go through it. */
async function jumpTo(page: Page, y: number) {
  await page.evaluate((yy) => {
    const lenis = (
      window as unknown as {
        __lenis?: { scrollTo: (y: number, o: object) => void };
      }
    ).__lenis;
    if (lenis) lenis.scrollTo(yy, { immediate: true, force: true });
    else window.scrollTo(0, yy);
  }, y);
  await page.waitForTimeout(150);
}

async function skipIntro(page: Page) {
  const skip = page.getByRole("button", { name: /skip intro/i });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await expect(page.locator(".intro")).not.toHaveClass(/intro-active/);
}

test("responsive layout, cream hero, five works, journey, no excluded content", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await expect(page.locator(".work-row")).toHaveCount(5);
    await expect(page.locator("body")).not.toContainText(/eduos/i);
  }
  // The decorative hero rectangle is gone for good.
  await expect(page.locator(".hero-rect")).toHaveCount(0);
  await expect(page.locator(".hero canvas")).toHaveCount(0);
  // Cream journey timeline, NioLearn first.
  await expect(page.locator(".timeline-item")).toHaveCount(6);
  await expect(page.locator(".timeline-card").first()).toContainText(
    /NioLearn/,
  );
  await expect(page.locator(".timeline")).toContainText(/8\.95/);
  expect(errors).toEqual([]);
});

test("case study pages load with imagery; excluded routes stay excluded", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const slug of slugs) {
    const r = await page.goto("/projects/" + slug);
    expect(r?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "04 / My contribution" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.images]
            .filter((i) => i.getBoundingClientRect().width > 0)
            .every((i) => i.complete && i.naturalWidth > 0),
        ),
      )
      .toBeTruthy();
  }
  expect((await request.get("/projects/eduos")).status()).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "eduos",
  );
  for (const url of [
    "/images/portrait.webp",
    "/assets/hero.jpg",
    "/assets/about.jpg",
    "/legacy/index.html",
  ])
    expect((await request.get(url)).status()).toBe(404);
  const pdf = await request.get("/resume/Abhiraj-Jain.pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("menu, keyboard focus, in-page navigation and contact", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const b = page.locator(".menu-toggle");
  await b.click();
  await expect(b).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(b).toBeFocused();
  await b.click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect(b).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#about/);
  await expect(page.locator("#about")).toBeInViewport();
  await expect(page.locator(".email-link")).toHaveAttribute(
    "href",
    "mailto:jainabhi90980@gmail.com",
  );
  await page.locator(".copy-button").click();
  await expect(page.locator(".copy-button")).toHaveText(
    /Email copied|Select the email/,
  );
});

test("all technology filters, genuine logos, accessible contrast", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const [name, n] of [
    ["Frontend", 7],
    ["Backend", 6],
    ["Databases", 5],
    ["Tools & Deployment", 4],
    ["Testing & Engineering", 3],
    ["All Categories", 25],
  ] as const) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".technology-card")).toHaveCount(n);
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  expect(
    await page
      .locator(".technology-card img")
      .evaluateAll((els) =>
        els.every(
          (e) =>
            (e as HTMLImageElement).complete &&
            (e as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBeTruthy();
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
});

test("filtering never strands downstream sections (ScrollTrigger refresh)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await skipIntro(page);
  await page.getByRole("button", { name: "Frontend", exact: true }).click();
  await expect(page.locator(".technology-card")).toHaveCount(7);
  // The section shrank; triggers must have been refreshed so journey,
  // experience and contact still reveal and remain reachable.
  await page.waitForTimeout(400);
  await jumpTo(
    page,
    await page.evaluate(() => document.body.scrollHeight),
  );
  await expect(page.locator("#contact")).toBeInViewport();
  await expect(page.locator(".email-link")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("#contact h2").evaluate((e) => getComputedStyle(e).opacity),
      { timeout: 4000 },
    )
    .toBe("1");
  await page.getByRole("button", { name: "All Categories", exact: true }).click();
  await expect(page.locator(".technology-card")).toHaveCount(25);
});

test("greeting intro plays on every full load and is skippable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".intro")).toHaveClass(/intro-active/);
  await expect(
    page.getByRole("button", { name: /skip intro/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /skip intro/i }).click();
  await expect(page.locator(".intro")).not.toHaveClass(/intro-active/);
  // A full reload shows the greeting again (no sessionStorage blanket skip).
  await page.reload();
  await expect(page.locator(".intro")).toHaveClass(/intro-active/);
});

test("per-word scramble: independent words, A-Z0-9 pool, exact restore", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await skipIntro(page);
  const first = page.locator(".scramble-word.name-first");
  const last = page.locator(".scramble-word.name-last-word");
  const role = page.locator(".scramble-word.hero-role");
  await first.hover();
  await expect(first).toHaveClass(/is-scrambling/);
  // The other words are untouched while ABHIRAJ scrambles.
  await expect(last).not.toHaveClass(/is-scrambling/);
  await expect(role).not.toHaveClass(/is-scrambling/);
  expect(await last.textContent()).toBe("jain");
  expect(await role.textContent()).toBe("SOFTWARE ENGINEER");
  // Pool characters only (plus the held spaces).
  const mid = await first.textContent();
  expect(mid).toMatch(/^[A-Z0-9 ]+$/);
  // Exact restore once the run finishes.
  await expect(first).not.toHaveClass(/is-scrambling/, { timeout: 4000 });
  expect(await first.textContent()).toBe("ABHIRAJ");
  // Character slots keep stable widths: no layout shift of the dot.
  const dotX = await page
    .locator(".name-dot")
    .evaluate((e) => e.getBoundingClientRect().x);
  // Re-entering needs the pointer to leave first (pointerenter-driven).
  await page.mouse.move(20, 20);
  await first.hover();
  await expect(first).toHaveClass(/is-scrambling/);
  const dotXMid = await page
    .locator(".name-dot")
    .evaluate((e) => e.getBoundingClientRect().x);
  expect(Math.abs(dotXMid - dotX)).toBeLessThan(2);
});

test("Who Am I reveal changes color, never opacity", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await skipIntro(page);
  const words = page.locator(".whoami-copy .wr-word");
  await expect(words.first()).toBeVisible();
  const colorAt = async () =>
    words.nth(1).evaluate((e) => getComputedStyle(e).color);
  // Approach: first words still muted before the reveal reaches them.
  const aboutTop = await page
    .locator("#about")
    .evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  await jumpTo(page, Math.max(0, aboutTop - 700));
  const muted = await colorAt();
  await jumpTo(page, aboutTop - 200);
  const revealed = await colorAt();
  expect(revealed).not.toBe(muted);
  // No word ever hits opacity 0 anywhere through the section.
  for (const y of [aboutTop - 500, aboutTop - 100, aboutTop + 300]) {
    await jumpTo(page, Math.max(0, y));
    const opacities = await words.evaluateAll((els) =>
      els.slice(0, 12).map((e) => getComputedStyle(e).opacity),
    );
    for (const o of opacities) expect(Number(o)).toBeGreaterThan(0.05);
  }
});

test("What I Do pinned stack fits a 1366x768 viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await skipIntro(page);
  await expect(page.locator(".stack-card")).toHaveCount(4);
  const orbitTop = await page
    .locator(".orbit-section")
    .evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  const pinHeight = await page
    .locator(".whatido-pin")
    .evaluate((e) => (e as HTMLElement).offsetHeight);
  // The pin releases 1.7 viewport-heights after its start; the spacer then
  // fills pinHeight more before the orbit. End state sits just inside it.
  await jumpTo(page, orbitTop - pinHeight - 40);
  await page.waitForTimeout(400);
  const last = await page
    .locator(".stack-card")
    .last()
    .evaluate((e) => e.getBoundingClientRect().toJSON());
  expect(last.top).toBeGreaterThanOrEqual(0);
  expect(last.bottom).toBeLessThanOrEqual(768);
  // Stacking is transform-only: covered cards stay laid out via transforms.
  const firstTransform = await page
    .locator(".stack-card")
    .first()
    .evaluate((e) => getComputedStyle(e).transform);
  expect(firstTransform).toContain("matrix");
});

test("orbit: shared-center wheel rotates with scroll and exits cleanly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await skipIntro(page);
  const wheel = page.locator(".orbit-wheel");
  const orbitTop = await page
    .locator(".orbit-section")
    .evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  // Viewport-derived radius is set once the wheel animates.
  const radius = await wheel.evaluate((e) =>
    (e as HTMLElement).style.getPropertyValue("--orbit-r"),
  );
  expect(Number.parseInt(radius)).toBeGreaterThan(900);
  // Mid-pin: the wheel itself has rotated (parent rotation, tangent words).
  await jumpTo(page, orbitTop + Math.round(900 * 0.8));
  await page.waitForTimeout(400);
  const midTransform = await wheel.evaluate(
    (e) => getComputedStyle(e).transform,
  );
  expect(midTransform).toContain("matrix");
  const m = midTransform.match(/matrix\(([^)]+)\)/);
  expect(m).toBeTruthy();
  const angle =
    (Math.atan2(
      Number(m![1].split(",")[1]),
      Number(m![1].split(",")[0]),
    ) *
      180) /
    Math.PI;
  expect(angle).toBeLessThan(-10);
  expect(angle).toBeGreaterThan(-45);
  // Clean exit: scrolling past the pin lands on Selected Works.
  await jumpTo(page, orbitTop + Math.round(900 * 1.7) + 900);
  await expect(page.locator("#work")).toBeInViewport();
});

test("mobile fallbacks: static orbit list and unpinned cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await skipIntro(page);
  await expect(page.locator(".orbit-stage")).not.toHaveClass(/orbit-animated/);
  const words = page.locator(".orbit-word");
  await expect(words).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await words.nth(i).scrollIntoViewIfNeeded();
    const box = await words.nth(i).evaluate((e) =>
      e.getBoundingClientRect().toJSON(),
    );
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(390);
    expect(box.width).toBeGreaterThan(60);
  }
  // Cards render as a readable static list, no pin-spacer.
  await expect(page.locator(".stack-card").first()).toBeVisible();
  expect(
    await page.locator(".whatido .pin-spacer").count(),
  ).toBe(0);
});

test("technology logo: one 360 turn forward, smooth return to rest", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await skipIntro(page);
  const card = page.locator(".technology-card").first();
  const logo = card.locator("img");
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect
    .poll(() => logo.evaluate((e) => (e as HTMLElement).dataset.spinning))
    .toBe("1");
  // Mid-flight the logo is actually rotated.
  await expect
    .poll(async () =>
      logo.evaluate((e) => getComputedStyle(e).transform),
    )
    .toContain("matrix");
  // One turn out plus the return lands inside ~1.15s; rest orientation
  // is exactly the unrotated state and the guard flag is cleared.
  await expect
    .poll(
      () => logo.evaluate((e) => (e as HTMLElement).dataset.spinning),
      { timeout: 4000 },
    )
    .toBeUndefined();
  const rested = await logo.evaluate((e) => getComputedStyle(e).transform);
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(rested);
  // A re-entry spins again (the tween is rebuilt, not stuck).
  await page.mouse.move(10, 10);
  await card.hover();
  await expect
    .poll(() => logo.evaluate((e) => (e as HTMLElement).dataset.spinning))
    .toBe("1");
});
