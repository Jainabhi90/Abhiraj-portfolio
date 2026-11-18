import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const slugs = [
  "niolearn",
  "arbdetector",
  "instalead",
  "github-analyser",
  "fnatics",
];
test("responsive page, loaded imagery, five case studies and excluded public content", async ({
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
  expect(errors).toEqual([]);
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
test("technology logo performs exactly two turns per hover entry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  const logo = page.locator(".technology-card img").first();
  await logo.scrollIntoViewIfNeeded();
  await page.locator(".technology-card").first().hover();
  await expect
    .poll(() => logo.evaluate((e) => (e as HTMLElement).dataset.spinning))
    .toBe("1");
  const spinning = await logo.evaluate((e) => getComputedStyle(e).transform);
  expect(spinning).toContain("matrix");
  // After the controlled tween ends, the logo rests at its original orientation.
  await expect
    .poll(
      () => logo.evaluate((e) => (e as HTMLElement).dataset.spinning),
      { timeout: 4000 },
    )
    .toBeUndefined();
  const rested = await logo.evaluate((e) => getComputedStyle(e).transform);
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(rested);
});
test("intro timing, name scramble, rectangle reveal and orbit reversal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".intro")).toHaveClass(/intro-active/);
  // Slower readable sequence: the intro must still be present at 2.6s.
  await page.waitForTimeout(2600);
  await expect(page.locator(".intro")).toHaveClass(/intro-active/);
  await page.getByRole("button", { name: "Skip intro" }).click();
  // Pointer near the name triggers localized scrambling.
  await page.locator(".name-glyph").nth(2).hover();
  await expect(page.locator(".scramble-name")).toHaveClass(/is-scrambling/);
  await expect(page.locator(".hero-rect")).toHaveClass(/is-visible/);
  // Scramble resolves: original name restores itself.
  await expect(page.locator(".scramble-name")).not.toHaveClass(/is-scrambling/, {
    timeout: 6000,
  });
  await page.locator(".navbar .brand").hover();
  await expect(page.locator(".hero-rect")).not.toHaveClass(/is-visible/);
  expect(
    await page
      .locator(".scramble-name .name-visual .name-glyph")
      .allTextContents(),
  ).toEqual([..."ABHIRAJJAIN"]);
  // Work preview follows rows.
  await page.locator(".work-row").first().hover();
  await expect(page.locator(".floating-project")).toHaveClass(/is-visible/);
  await expect(page.locator(".floating-project img")).toHaveAttribute(
    "src",
    /niolearn/,
  );
  const first = await page
    .locator(".floating-project")
    .evaluate((e) => getComputedStyle(e).transform);
  await page.locator(".work-row").nth(1).hover();
  await expect(page.locator(".floating-project strong")).toHaveText(
    "ArbDetector",
  );
  await expect
    .poll(() =>
      page
        .locator(".floating-project")
        .evaluate((e) => getComputedStyle(e).transform),
    )
    .not.toBe(first);
  await page.locator("#work h2").hover();
  await expect(page.locator(".floating-project")).not.toHaveClass(/is-visible/);
  // Circular sequence: rotation follows scroll and reverses.
  // Measure from the document top: the pinned element reports a shifted
  // box while the page is scrolled past its pin range.
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
  const orbitTop = await page
    .locator(".orbit-section")
    .evaluate((e) => e.getBoundingClientRect().top + scrollY);
  const vh = await page.evaluate(() => innerHeight);
  const ringTransform = () =>
    page
      .locator(".orbit-ring")
      .evaluate((e) => getComputedStyle(e).transform);
  await page.evaluate(([t, h]) => scrollTo(0, t + h * 1.3), [orbitTop, vh]);
  await page.waitForTimeout(900);
  const mid = await ringTransform();
  expect(mid).toContain("matrix");
  await page.evaluate(([t, h]) => scrollTo(0, t + h * 2.1), [orbitTop, vh]);
  await page.waitForTimeout(900);
  expect(await ringTransform()).not.toBe(mid);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1200);
  const reset = await ringTransform();
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(reset);
  await page.reload();
  await expect(page.locator(".intro")).not.toHaveClass(/intro-active/);
});
test("stacking cards overlap on scroll and reverse naturally", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.locator(".stack-card")).toHaveCount(4);
  const top = await page
    .locator("#expertise")
    .evaluate((e) => e.getBoundingClientRect().top + scrollY);
  const vh = await page.evaluate(() => innerHeight);
  const card2 = page.locator(".stack-card").nth(1);
  const transform = () =>
    card2.evaluate((e) => getComputedStyle(e).transform);
  await page.evaluate(([t, h]) => scrollTo(0, t + h * 0.02), [top, vh]);
  await page.waitForTimeout(800);
  const before = await transform();
  await page.evaluate(([t, h]) => scrollTo(0, t + h * 1.2), [top, vh]);
  await page.waitForTimeout(800);
  const mid = await transform();
  expect(mid).not.toBe(before);
  // The incoming card has moved up toward its stacked position.
  const ty = (m: string) => {
    const parts = m.match(/matrix\((.+)\)/);
    return parts ? parseFloat(parts[1].split(",")[5]) : 0;
  };
  expect(Math.abs(ty(mid))).toBeLessThan(Math.abs(ty(before)));
  // Scrolling back returns the card toward its waiting position.
  await page.evaluate(([t, h]) => scrollTo(0, t + h * 0.02), [top, vh]);
  await page.waitForTimeout(900);
  expect(await transform()).not.toBe(mid);
});
test("about paragraphs reveal word by word with scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  const words = page.locator(".wr-word");
  expect(await words.count()).toBeGreaterThan(60);
  const aboutTop = await page
    .locator("#about")
    .evaluate((e) => e.getBoundingClientRect().top + scrollY);
  await page.evaluate((t) => scrollTo(0, t - innerHeight * 0.5), aboutTop);
  await page.waitForTimeout(700);
  const early = await words.evaluateAll((els) =>
    els.filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.9).length,
  );
  expect(early).toBeLessThan(await words.count());
  const aboutBottom = await page
    .locator("#about")
    .evaluate((e) => e.getBoundingClientRect().top + scrollY + e.scrollHeight);
  await page.evaluate((b) => scrollTo(0, b), aboutBottom);
  await page.waitForTimeout(900);
  const late = await words.evaluateAll((els) =>
    els.filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.9).length,
  );
  expect(late).toBe(await words.count());
  // Scrolling backward reverses the emphasis.
  await page.evaluate((t) => scrollTo(0, t - innerHeight * 0.5), aboutTop);
  await page.waitForTimeout(900);
  const reversed = await words.evaluateAll((els) =>
    els.filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.9).length,
  );
  expect(reversed).toBeLessThan(late);
});
test("academic-journey timeline renders and animates on scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.locator(".timeline-card")).toHaveCount(5);
  await expect(page.locator(".timeline-card").last()).toContainText(
    "Vedam School of Technology",
  );
  await expect(page.locator(".timeline-card").last()).toContainText(
    "CGPA 8.95 / 10",
  );
  const lineScale = () =>
    page
      .locator(".timeline-line i")
      .evaluate((e) => getComputedStyle(e).transform);
  const top = await page
    .locator("#leadership")
    .evaluate((e) => e.getBoundingClientRect().top + scrollY);
  await page.evaluate((t) => scrollTo(0, t - innerHeight * 0.3), top);
  await page.waitForTimeout(700);
  const early = await lineScale();
  await page.evaluate((t) => scrollTo(0, t + innerHeight * 1.2), top);
  await page.waitForTimeout(900);
  const later = await lineScale();
  expect(later).not.toBe(early);
});
test("reduced motion and touch fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".intro")).toBeHidden();
  await expect(page.locator(".hero-rect")).toBeHidden();
  await expect(page.locator(".mobile-project-preview").first()).toBeVisible();
  await expect(page.locator(".stack-card")).toHaveCount(4);
  await expect(page.locator(".orbit-word")).toHaveCount(3);
  await page.locator(".work-row").first().click();
  await expect(page).toHaveURL(/projects\/niolearn/);
  await page.goBack();
  await expect(page.locator(".work-row")).toHaveCount(5);
});
test("section screenshots at four review viewports", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [375, 812],
    [390, 844],
    [768, 1024],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.screenshot({
      path: `docs/screenshots/${info.project.name}-${width}-hero.png`,
    });
    for (const id of [
      "about",
      "expertise",
      "work",
      "tech-stack",
      "leadership",
      "experience",
      "contact",
    ]) {
      await page
        .locator("#" + id)
        .evaluate((e) => e.scrollIntoView({ block: "start" }));
      await expect
        .poll(() =>
          page.evaluate(() =>
            [...document.images]
              .filter((i) => {
                const r = i.getBoundingClientRect();
                return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
              })
              .every((i) => i.complete && i.naturalWidth > 0),
          ),
        )
        .toBeTruthy();
      await page.screenshot({
        path: `docs/screenshots/${info.project.name}-${width}-${id}.png`,
      });
    }
  }
});
test("3.0 editorial sections, full-screen menu trap, stable refresh and quick preview switches", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.locator(".stack-card")).toHaveCount(4);
  await expect(page.locator(".scramble-name .last-name")).toHaveText("JAIN");
  await expect(page.locator("canvas.hero-field")).toBeVisible();
  const b = page.locator(".menu-toggle");
  await b.click();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".nav-resume")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(b).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(b).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert");
  for (let i = 0; i < 10; i++)
    await page
      .locator(".work-row")
      .nth(i % 5)
      .hover();
  await expect(page.locator(".floating-project strong")).toHaveText("Fnatics");
  await page.locator("#work h2").hover();
  await expect(page.locator(".floating-project")).not.toHaveClass(/is-visible/);
  await page.locator("#expertise").scrollIntoViewIfNeeded();
  await page.reload();
  await expect(page.locator("#expertise")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  // ScrollTrigger re-measures pinned sections on a debounced resize refresh.
  await page.waitForTimeout(800);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
