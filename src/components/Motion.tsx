"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { leadership } from "@/content/portfolio";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => matchMedia("(pointer: fine)").matches;

/* ------------------------------------------------------------------ */
/* Word-level rapid character scramble                                 */
/*                                                                     */
/* One ScrambleText instance per interactive word. Only the hovered    */
/* word scrambles; every word restores its exact original text.        */
/* ------------------------------------------------------------------ */

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TICK_MS = 34; // character update cadence (~30fps, inside 25-45ms)
const TOTAL_MS = 620; // total scramble duration (inside 450-800ms)

export function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = [...el.querySelectorAll<HTMLElement>(".sc-ch")];
    if (!chars.length) return;
    const originals = chars.map((c) => c.dataset.char || "");

    /* Freeze each character slot's width so random glyphs never shift
       the layout, the CTA, or the hero height. */
    const freeze = () => {
      chars.forEach((c) => {
        c.style.minWidth = `${c.getBoundingClientRect().width}px`;
      });
    };
    let measured = false;
    const measure = () => {
      if (measured) return;
      measured = true;
      freeze();
    };
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    const t = setTimeout(measure, 1200);

    let timer: ReturnType<typeof setInterval> | null = null;
    let resolveAt: number[] = [];
    let tickCount = 0;

    const finish = () => {
      if (timer) clearInterval(timer);
      timer = null;
      chars.forEach((c, i) => {
        c.textContent = originals[i];
      });
      el.classList.remove("is-scrambling");
    };

    const tick = () => {
      tickCount++;
      let done = true;
      chars.forEach((c, i) => {
        if (tickCount >= resolveAt[i]) {
          c.textContent = originals[i];
        } else {
          done = false;
          c.textContent = POOL[(Math.random() * POOL.length) | 0];
        }
      });
      if (done) finish();
    };

    const start = () => {
      if (timer) return; // one animation at a time, never queued
      measure();
      const totalTicks = Math.max(6, Math.round(TOTAL_MS / TICK_MS));
      const len = chars.length;
      // Original characters resolve progressively, first to last.
      resolveAt = chars.map(
        (_, i) =>
          Math.floor(((i + 1) / len) * (totalTicks * 0.72)) +
          2 +
          ((Math.random() * (totalTicks * 0.22)) | 0),
      );
      tickCount = 0;
      el.classList.add("is-scrambling");
      timer = setInterval(tick, TICK_MS);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch" || reduceMotion()) return;
      start();
    };
    el.addEventListener("pointerenter", onEnter);
    return () => {
      clearTimeout(t);
      el.removeEventListener("pointerenter", onEnter);
      finish();
    };
  }, []);

  return (
    <span ref={ref} className={`scramble-word ${className || ""}`}>
      <span aria-hidden="true">
        {[...text].map((c, i) => (
          <span key={i} className="sc-ch" data-char={c}>
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* HERO NAME: two independently interactive words                      */
/* ------------------------------------------------------------------ */

export function ScrambleName() {
  const ref = useRef<HTMLHeadingElement>(null);

  /* Touch devices: one short self-playing pass, then a stable name. */
  useEffect(() => {
    if (finePointer() || reduceMotion()) return;
    const name = ref.current;
    if (!name) return;
    const words = name.querySelectorAll(".scramble-word");
    const timer = setTimeout(() => {
      words.forEach((w) => w.dispatchEvent(new PointerEvent("pointerenter")));
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 ref={ref} className="hero-name" aria-label="Abhiraj Jain">
      <span className="sr-only">Abhiraj Jain</span>
      <span aria-hidden="true" className="hero-name-visual">
        <ScrambleText text="ABHIRAJ" className="name-first" />
        <span className="name-last">
          <ScrambleText text="jain" className="name-last-word" />
          <span className="name-dot">.</span>
        </span>
      </span>
    </h1>
  );
}

/* ------------------------------------------------------------------ */
/* WHO AM I: word-by-word scroll reveal through readable colors        */
/* ------------------------------------------------------------------ */

export function WordReveal({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduceMotion()) return;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".wr-word", ref.current);
      if (!words.length) return;
      // Contrast transition between two readable colors, never opacity 0.
      gsap.fromTo(
        words,
        { color: "var(--word-dim)" },
        {
          color: "var(--ink)",
          ease: "none",
          duration: 0.35,
          stagger: 0.09,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "bottom 42%",
            scrub: 0.45,
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="whoami-copy">
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p.split(" ").map((w, j) => (
            <span key={j} className="wr-word">
              {w}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WHAT I DO: readable stacking cards                                  */
/*                                                                     */
/* Card i+1 slides up over card i; earlier cards stay visible as slim  */
/* top strips. Transforms only, clear z-index, no opacity or darkening.*/
/* ------------------------------------------------------------------ */

const STACK_CARDS = [
  {
    title: "Full-Stack Product Engineering",
    desc: "Frontend and backend built as one coherent product, from the interface to authentication, data and checkout.",
    caps: [
      "Timed assessments with autosave and server-side scoring",
      "Razorpay order creation with signed webhook verification",
      "Supabase session handling covered by automated tests",
    ],
  },
  {
    title: "Frontend Engineering",
    desc: "Interfaces that stay usable under real conditions: small screens, slow networks, keyboards and screen readers.",
    caps: [
      "Responsive Next.js and React application screens",
      "Accessible components with keyboard support",
      "Mobile adaptations for test and assignment flows",
    ],
  },
  {
    title: "Backend & API Engineering",
    desc: "Server logic where correctness matters: scoring, payments, imports and the routes that connect them.",
    caps: [
      "REST APIs and serverless routes in production",
      "PDF question imports with duplicate checks and review",
      "Server-side scoring and payment verification",
    ],
  },
  {
    title: "Performance & Reliability",
    desc: "Work is not done when it renders once. It is checked, measured and verified before it ships.",
    caps: [
      "Automated authentication and token-refresh tests",
      "Cross-browser Playwright checks on every release",
      "Measured rendering performance and error states",
    ],
  },
];

export function WhatIDo() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)",
      () => {
        const area = root.current?.querySelector(".stack-area");
        const pinEl = root.current?.querySelector<HTMLElement>(".whatido-pin");
        area?.classList.add("stack-animated");
        const cards = gsap.utils.toArray<HTMLElement>(
          ".stack-card",
          root.current,
        );
        if (cards.length < 2 || !pinEl) return;

        /* Geometry: the strip each covered card leaves visible. Waiting
           cards sit just past the pinned container's bottom edge, which
           is offscreen, and slide up over the stack. */
        const strip = () =>
          Math.max(12, Math.min(24, Math.round(window.innerHeight * 0.022)));
        const place = () => {
          const s = strip();
          const base = pinEl.clientHeight;
          cards.forEach((c, i) => {
            gsap.set(c, {
              y: i === 0 ? 0 : base + i * s,
              zIndex: i + 1,
            });
          });
        };
        place();
        const ro = new ResizeObserver(place);
        ro.observe(pinEl);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinEl,
            pin: true,
            start: "top top",
            end: () => "+=" + Math.round(window.innerHeight * 1.7),
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: place,
          },
        });
        for (let i = 1; i < cards.length; i++) {
          const at = i - 1;
          tl.to(cards[i], { y: () => i * strip(), duration: 1 }, at);
        }
        return () => {
          ro.disconnect();
          tl.scrollTrigger?.kill();
          area?.classList.remove("stack-animated");
        };
      },
    );
    mm.add(
      "(max-width: 899px), (max-height: 559px), (prefers-reduced-motion: reduce)",
      () => {
        if (reduceMotion()) return;
        const cards = gsap.utils.toArray<HTMLElement>(
          ".stack-card",
          root.current,
        );
        const tweens = cards.map((c) =>
          gsap.from(c, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: c, start: "top 94%", once: true },
          }),
        );
        return () => tweens.forEach((t) => t.scrollTrigger?.kill());
      },
    );
    return () => mm.revert();
  }, []);
  return (
    <section
      id="expertise"
      ref={root}
      className="whatido"
      aria-label="What I do"
    >
      <div className="whatido-pin">
        <div className="section-top mono">
          <span>02 / WHAT I DO</span>
          <span>FROM INTERFACE TO INFRASTRUCTURE</span>
        </div>
        <div className="whatido-head">
          <h2 className="reference-heading">
            WHAT <em>i</em> DO
          </h2>
          <span className="mint-rule" />
          <p className="whatido-sub">
            Four kinds of engineering work, one standard: it has to hold up in
            production.
          </p>
        </div>
        <div className="stack-area">
          {STACK_CARDS.map((card, i) => (
            <article className="stack-card" key={card.title}>
              <div className="stack-card-top mono">
                <span>0{i + 1}</span>
                <span>0{i + 1} / 04</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <ul>
                {card.caps.map((cap) => (
                  <li key={cap}>
                    <span aria-hidden="true">—</span> {cap}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ANALYZE / DESIGN / BUILD: typography wheel                          */
/*                                                                     */
/* One shared wheel. Words sit on the same circle (each wrapper is    */
/* rotated around the wheel center, word offset by the radius), and    */
/* scrolling rotates the wheel itself. Center below the viewport so    */
/* the upper arc is the active reading area. Compact scroll distance.  */
/* ------------------------------------------------------------------ */

const ORBIT_WORDS = ["ANALYZE", "DESIGN", "BUILD"];
const ORBIT_STEP_DEG = 26; // angular spacing between word centers
const ORBIT_DOTS = [13, -13, 39, -39, 65]; // small dots along the arc

export function Orbit() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const stage = root.current?.querySelector(".orbit-stage");
        stage?.classList.add("orbit-animated");
        const wheel = root.current?.querySelector(".orbit-wheel");
        if (!wheel) return;

        /* Radius and center derive from the viewport, recomputed on
           refresh so resize keeps the composition framed. */
        const layout = () => {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const radius = Math.max(vw * 1.15, vh * 1.9);
          const el = wheel as HTMLElement;
          el.style.setProperty("--orbit-r", `${Math.round(radius)}px`);
        };
        layout();
        const ro = new ResizeObserver(layout);
        ro.observe(wheel);

        const tween = gsap.fromTo(
          wheel,
          { rotation: 0 },
          {
            rotation: -ORBIT_STEP_DEG * (ORBIT_WORDS.length - 1),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + Math.round(window.innerHeight * 1.6),
              scrub: 0.55,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefresh: layout,
            },
          },
        );
        return () => {
          ro.disconnect();
          tween.scrollTrigger?.kill();
          stage?.classList.remove("orbit-animated");
        };
      },
    );
    return () => mm.revert();
  }, []);
  return (
    <section
      ref={root}
      className="orbit-section"
      aria-label="How I think: analyze, design, build"
    >
      <div className="orbit-stage">
        <div className="orbit-caption mono">
          <span>03 / HOW I THINK</span>
          <span>PROCESS</span>
        </div>
        <div className="orbit-wheel" aria-hidden="true">
          {ORBIT_WORDS.map((word, i) => (
            <span
              key={word}
              className="orbit-slot"
              style={{ ["--a" as string]: `${i * ORBIT_STEP_DEG}deg` }}
            >
              <span className="orbit-word">{word}</span>
            </span>
          ))}
          {ORBIT_DOTS.map((a) => (
            <span
              key={a}
              className="orbit-slot orbit-dot-slot"
              style={{ ["--a" as string]: `${a}deg` }}
            >
              <i className="orbit-dot" />
            </span>
          ))}
        </div>
        <h2 className="sr-only">Analyze, Design, Build</h2>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* BEYOND THE CODE: editorial journey timeline                         */
/* ------------------------------------------------------------------ */

const ACADEMIC = {
  date: "2025–2029",
  name: "Vedam School of Technology",
  role: "Ajeenkya DY Patil University · B.Tech Computer Science, AI & ML",
  meta: "CGPA 8.95 / 10",
};

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const items = [
    ...leadership.map(([date, name, role]) => ({ date, name, role, meta: "" })),
    ACADEMIC,
  ];
  useEffect(() => {
    if (reduceMotion()) return;
    const ctx = gsap.context(() => {
      const line = root.current?.querySelector(".timeline-line i");
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root.current?.querySelector(".timeline"),
              start: "top 72%",
              end: "bottom 62%",
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          },
        );
      }
      gsap.utils
        .toArray<HTMLElement>(".timeline-item", root.current)
        .forEach((item) => {
          const card = item.querySelector(".timeline-card");
          const dot = item.querySelector(".timeline-dot");
          const st = {
            trigger: item,
            start: "top 94%",
            end: "top 62%",
            scrub: 0.4,
          } as const;
          if (card)
            gsap.fromTo(
              card,
              { opacity: 0.35, y: 26 },
              { opacity: 1, y: 0, ease: "none", scrollTrigger: st },
            );
          if (dot)
            gsap.fromTo(
              dot,
              { scale: 0.5, opacity: 0.4 },
              { scale: 1, opacity: 1, ease: "none", scrollTrigger: st },
            );
        });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section
      id="leadership"
      ref={root}
      className="journey section"
      aria-label="Leadership and academic journey"
    >
      <div className="section-top mono">
        <span>05 / BEYOND THE CODE</span>
        <span>PEOPLE & PRACTICE</span>
      </div>
      <h2 className="reference-heading">
        BEYOND THE <em>code</em>
      </h2>
      <span className="mint-rule" />
      <p className="journey-sub">
        Leadership, events, and collaborative work.
      </p>
      <div className="timeline">
        <div className="timeline-line" aria-hidden="true">
          <i />
        </div>
        {items.map((item, i) => (
          <div
            className={`timeline-item ${i % 2 ? "right" : "left"}`}
            key={item.name + item.date}
          >
            <span className="timeline-dot" aria-hidden="true" />
            <article className="timeline-card">
              <span className="mono timeline-date">{item.date}</span>
              <h3>{item.name}</h3>
              <p>{item.role}</p>
              {item.meta ? (
                <span className="mono timeline-meta">{item.meta}</span>
              ) : null}
            </article>
          </div>
        ))}
      </div>
      <div className="achievements">
        <div>
          <strong>150+</strong>
          <p>
            LeetCode problems solved
            <br />
            with Java and Python
          </p>
        </div>
        <div>
          <strong>
            24<em>h</em>
          </strong>
          <p>
            Vedam hackathon
            <br />
            Organizer & frontend participant
          </p>
        </div>
        <div>
          <strong>91.56</strong>
          <p>JEE percentile</p>
        </div>
      </div>
      <p className="workshop mono">ALSO / COMPLETED THE BE10X AI TOOLS WORKSHOP</p>
    </section>
  );
}
