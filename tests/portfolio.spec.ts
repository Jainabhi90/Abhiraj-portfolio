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
  }
  // The decorative hero rectangle is gone for good.
  await expect(page.locator(".hero-rect")).toHaveCount(0);
  await expect(page.locator(".hero canvas")).toHaveCount(0);
  // Cream journey timeline, NioLearn first; EduOS stays excluded.
  await expect(page.locator(".timeline-item")).toHaveCount(7);
  await expect(page.locator("body")).not.toContainText(/eduos/i);
  await expect(page.locator(".timeline-card").first()).toContainText(
    /NioLearn/,
  );
  await expect(page.locator(".timeline")).toContainText(/8\.95/);
  // Experience moved directly after Who Am I, before What I Do.
  const order = await page.evaluate(() => {
    const ids = ["about", "experience", "expertise", "work", "presence", "contact"];
    return ids.map(
      (id) => document.getElementById(id)!.getBoundingClientRect().top,
    );
  });
  for (let i = 1; i < order.length; i++)
    expect(order[i]).toBeGreaterThan(order[i - 1]);
  // Hero meta: role pills + inline socials.
  await expect(page.locator(".hero-pill")).toHaveCount(2);
  await expect(page.locator(".hero-meta .social-link")).toHaveCount(3);
  await expect(page.locator(".contact .social-link")).toHaveCount(3);
  // Online presence cards with verified links.
  const cards = page.locator(".presence-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0)).toHaveAttribute(
    "href",
    "https://github.com/Jainabhi90",
  );
  await expect(cards.nth(1)).toHaveAttribute("href", /linkedin/);
  await expect(cards.nth(3)).toHaveAttribute(
    "href",
    "mailto:jainabhi90980@gmail.com",
  );
  // Stats trimmed to LeetCode, JEE and CGPA only (2026-11-19 user request);
  // hackathon lives in Beyond the Code, Class 10/12 stats and the ALSO line are gone.
  const achievements = page.locator(".achievements");
  await expect(achievements).toContainText("150+");
  await expect(achievements).toContainText("91.56");
  await expect(achievements).toContainText("8.95");
  await expect(achievements).not.toContainText("97.6%");
  await expect(achievements).not.toContainText("~94%");
  await expect(achievements).not.toContainText("hackathon");
  await expect(page.locator(".workshop")).toHaveCount(0);
  // Presence cards switch to a green background with light text on hover.
  const firstCard = cards.nth(0);
  const bgBefore = await firstCard.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  await firstCard.hover();
  await expect
    .poll(
      () => firstCard.evaluate((el) => getComputedStyle(el).backgroundColor),
    )
    .toBe("rgb(33, 126, 97)");
  expect(bgBefore).not.toBe("rgb(33, 126, 97)");
  const titleColor = await firstCard
    .locator(".presence-card-title")
    .evaluate((el) => getComputedStyle(el).color);
  expect(titleColor).toBe("rgb(246, 245, 240)");
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

test("greeting intro plays once per session and is skippable", async ({
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
  // A reload in the same tab session does not replay the greeting
  // (page JS cannot distinguish a hard reload from a normal one).
  await page.reload();
  await page.waitForTimeout(1200);
  await expect(page.locator(".intro")).not.toHaveClass(/intro-active/);
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

test("What I Do pinned stack keeps every card heading visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await skipIntro(page);
  await expect(page.locator(".stack-card")).toHaveCount(4);
  const pinStart = await page
    .locator(".whatido-pin")
    .evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  // Pin distance is 1.8 viewport-heights across 3 timeline units; the
  // full stack has nearly settled by this point, just before the orbit
  // rise starts dissolving it.
  await jumpTo(page, pinStart + Math.round(768 * 1.8) - 4);
  await page.waitForTimeout(400);
  const heads = page.locator(".stack-card h3");
  await expect(heads).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const box = await heads
      .nth(i)
      .evaluate((e) => e.getBoundingClientRect().toJSON());
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.bottom).toBeLessThanOrEqual(768);
    expect(box.height).toBeGreaterThan(12);
  }
  // Covered cards never fully cover: later cards sit lower than earlier ones.
  const tops = await page
    .locator(".stack-card")
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
  for (let i = 1; i < tops.length; i++)
    expect(tops[i]).toBeGreaterThan(tops[i - 1] + 40);
  // Stacking is transform-only: moved cards stay laid out via transforms.
  const lastTransform = await page
    .locator(".stack-card")
    .nth(2)
    .evaluate((e) => getComputedStyle(e).transform);
  expect(lastTransform).toContain("matrix");
});

test("fresh-load continuous scroll stacks cards in order, card 1 first", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await skipIntro(page);
  const pinStart = await page
    .locator(".whatido-pin")
    .evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  // Walk to the pin in small steps, like a real continuous scroll.
  for (let y = 0; y <= pinStart + 2; y += 140) {
    await jumpTo(page, Math.min(y, pinStart + 2));
  }
  await page.waitForTimeout(400);
  const tops = () =>
    page
      .locator(".stack-card")
      .evaluateAll((els) =>
        els.map((e) => e.getBoundingClientRect().top),
      );
  // At pin start only card 1 is in view; cards 2-4 park below the fold.
  let t = await tops();
  expect(t[0]).toBeGreaterThan(100);
  expect(t[0]).toBeLessThan(500);
  for (let i = 1; i < 4; i++) expect(t[i]).toBeGreaterThanOrEqual(760);
  // Early progress: card 2 rises in; cards 3 and 4 stay parked.
  const early = pinStart + Math.round(768 * 2 * 0.25);
  for (let y = pinStart; y <= early; y += 120) await jumpTo(page, y);
  await page.waitForTimeout(400);
  t = await tops();
  expect(t[1]).toBeLessThan(768);
  expect(t[1]).toBeGreaterThan(t[0]);
  expect(t[2]).toBeGreaterThanOrEqual(760);
  expect(t[3]).toBeGreaterThanOrEqual(760);
  // Dwell before handoff: card 4 fully readable at rest, headings 1-3
  // visible above it, and the stack not yet shrinking.
  const dwell = pinStart + Math.round(768 * 2 * 0.92);
  for (let y = early; y <= dwell; y += 120) await jumpTo(page, y);
  await page.waitForTimeout(400);
  t = await tops();
  for (let i = 0; i < 4; i++) expect(t[i]).toBeGreaterThanOrEqual(0);
  expect(t[0]).toBeLessThan(t[1]);
  expect(t[1]).toBeLessThan(t[2]);
  expect(t[2]).toBeLessThan(t[3]);
  expect(t[3]).toBeLessThan(660);
  const card4 = page.locator(".stack-card").nth(3);
  const body = await card4.locator("p").first().boundingBox();
  expect(body).not.toBeNull();
  expect(body!.y + body!.height).toBeLessThan(768);
  // Card 4's complete content, including its last bullet, sits inside
  // the unclipped viewport area and inside the card's own box (no
  // overflow clipping).
  const lastBullet = card4.locator("li").last();
  const lb = await lastBullet.boundingBox();
  expect(lb).not.toBeNull();
  expect(lb!.y + lb!.height).toBeLessThan(760);
  const c4 = await card4.boundingBox();
  expect(c4).not.toBeNull();
  expect(lb!.y + lb!.height).toBeLessThanOrEqual(c4!.y + c4!.height - 2);
  // Not covered either: the topmost element at the last bullet's center
  // belongs to card 4 (catches the orbit panel masking the stack).
  const coveredBy = await lastBullet.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(
      r.left + r.width / 2,
      r.top + r.height / 2,
    );
    return top ? el.contains(top) || top.contains(el) : false;
  });
  expect(coveredBy).toBe(true);
  const scale = await page
    .locator(".stack-area")
    .evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a);
  expect(scale).toBeGreaterThan(0.9);
  // Reverse to the pin start: card 1 stands alone again.
  for (let y = early; y >= pinStart; y -= 160) await jumpTo(page, y);
  await page.waitForTimeout(400);
  t = await tops();
  for (let i = 1; i < 4; i++) expect(t[i]).toBeGreaterThanOrEqual(760);
});

test("What I Do to orbit: stack shrinks into the shared viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await skipIntro(page);
  const pinStart = await page
    .locator(".whatido-pin")
    .evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  // Tail: the stack dissolves (scrubbed by the orbit rise) while the
  // forest orbit panel climbs over the bottom of the same viewport.
  await jumpTo(page, pinStart + Math.round(768 * 2.3));
  await page.waitForTimeout(600);
  const scale = await page.locator(".stack-area").evaluate((e) => {
    const m = getComputedStyle(e).transform.match(/matrix\(([^)]+)\)/);
    return m ? Number(m[1].split(",")[0]) : 1;
  });
  expect(scale).toBeLessThan(0.85);
  expect(scale).toBeGreaterThan(0.6);
  const orbitBox = await page
    .locator(".orbit-stage")
    .evaluate((e) => e.getBoundingClientRect().toJSON());
  expect(orbitBox.top).toBeLessThan(768);
  expect(orbitBox.top).toBeGreaterThan(768 * 0.3);
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
  // Viewport-derived radius is set once the wheel animates: compact
  // semicircle (roughly half the viewport width), not a giant arc.
  const radius = await wheel.evaluate((e) =>
    (e as HTMLElement).style.getPropertyValue("--orbit-r"),
  );
  expect(Number.parseInt(radius)).toBeGreaterThan(600);
  expect(Number.parseInt(radius)).toBeLessThan(1200);
  // Mid-pin: the sweep is rotating the wheel toward its rest state.
  await jumpTo(page, orbitTop + Math.round(900 * 0.5));
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
  expect(angle).toBeGreaterThan(10);
  expect(angle).toBeLessThan(45);
  // Completed state (owner direction, Nov 19 2026 - radius slightly
  // reduced at the owner's request): all four words rest fully inside
  // the viewport, ANALYZE and DELIVER near the left and right edges.
  await jumpTo(page, orbitTop + Math.round(900 * 1.3) - 80);
  await page.waitForTimeout(500);
  const words = page.locator(".orbit-word");
  await expect(words).toHaveCount(4);
  const boxes = [] as { left: number; right: number; top: number; bottom: number; width: number }[];
  for (let i = 0; i < 4; i++) {
    boxes.push(
      await words.nth(i).evaluate((e) => e.getBoundingClientRect().toJSON()),
    );
    expect(boxes[i].width).toBeGreaterThan(60);
    expect(boxes[i].top).toBeGreaterThanOrEqual(0);
    expect(boxes[i].bottom).toBeLessThanOrEqual(900);
  }
  for (const i of [1, 2]) {
    expect(boxes[i].left).toBeGreaterThanOrEqual(0);
    expect(boxes[i].right).toBeLessThanOrEqual(1440);
  }
  // Outer words rest at their edges, no longer clipped past them.
  expect(boxes[0].left).toBeGreaterThanOrEqual(-10);
  expect(boxes[0].left).toBeLessThan(80);
  expect(boxes[3].right).toBeLessThanOrEqual(1450);
  expect(boxes[3].right).toBeGreaterThan(1360);
  // Clean exit: scrolling past the pin lands on Selected Works.
  await jumpTo(page, orbitTop + Math.round(900 * 1.3) + 900);
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
  await expect(words).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
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

test("floating project preview positions on pointerenter after scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await skipIntro(page);
  // Park the cursor where the first work row will land, then scroll the row
  // under the stationary cursor: pointerenter fires without pointermove.
  await page.mouse.move(700, 300);
  const row = page.locator(".work-row").first();
  await row.scrollIntoViewIfNeeded();
  await jumpTo(
    page,
    (await row.evaluate(
      (e) => e.getBoundingClientRect().top + window.scrollY - 260,
    )) as number,
  );
  await page.waitForTimeout(400);
  const preview = page.locator(".floating-project");
  await expect(preview).toHaveClass(/is-visible/);
  const box = await preview.evaluate((e) =>
    e.getBoundingClientRect().toJSON(),
  );
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(1440);
  expect(box.top).toBeGreaterThanOrEqual(0);
});
