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
/* HERO: rapid character scramble + rectangular reveal                 */
/* ------------------------------------------------------------------ */

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@";
const NAME_LINES = ["ABHIRAJ", "JAIN"];

type GlyphState = {
  el: HTMLElement;
  dup: HTMLElement | null;
  original: string;
  frame: number;
  total: number;
  active: boolean;
  cooldownUntil: number;
};

function GlyphSpans() {
  return (
    <>
      {NAME_LINES.map((line, i) => (
        <span key={line} className={i ? "last-name name-line" : "name-line"}>
          {[...line].map((c, j) => (
            <span key={j} className="name-glyph" data-char={c}>
              {c}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

export function ScrambleName() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const dupBoxRef = useRef<HTMLDivElement>(null);
  const states = useRef<GlyphState[]>([]);
  const raf = useRef(0);
  const nameDelta = useRef({ x: 0, y: 0, w: 0 });

  /* Measure the original name's position inside the hero so the
     duplicate inside the moving rectangle can align exactly. */
  const measure = () => {
    const hero = nameRef.current?.closest(".hero") as HTMLElement | null;
    if (!hero || !nameRef.current) return;
    const h = hero.getBoundingClientRect();
    const n = nameRef.current.getBoundingClientRect();
    nameDelta.current = { x: n.left - h.left, y: n.top - h.top, w: n.width };
    const clone = dupBoxRef.current?.querySelector<HTMLElement>(
      ".hero-name-clone",
    );
    if (clone) clone.style.width = `${n.width}px`;
  };

  useEffect(() => {
    const name = nameRef.current;
    const hero = name?.closest(".hero") as HTMLElement | null | undefined;
    if (!name || !hero) return;

    states.current = [...name.querySelectorAll<HTMLElement>(".name-glyph")].map(
      (el, i) => ({
        el,
        dup:
          dupBoxRef.current?.querySelectorAll<HTMLElement>(".name-glyph")[i] ??
          null,
        original: el.dataset.char || el.textContent || "",
        frame: 0,
        total: 0,
        active: false,
        cooldownUntil: 0,
      }),
    );

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);

    let running = false;

    const tick = () => {
      let scrambling = false;
      for (const s of states.current) {
        if (!s.active) continue;
        scrambling = true;
        s.frame++;
        if (s.frame >= s.total) {
          s.active = false;
          s.cooldownUntil = performance.now() + 350;
          s.el.textContent = s.original;
          if (s.dup) s.dup.textContent = s.original;
        } else if (s.frame % 2 === 0) {
          const c = POOL[(Math.random() * POOL.length) | 0];
          s.el.textContent = c;
          if (s.dup) s.dup.textContent = c;
        }
      }
      name.classList.toggle("is-scrambling", scrambling);
      if (scrambling) {
        raf.current = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const startGlyph = (s: GlyphState) => {
      const now = performance.now();
      if (s.active || now < s.cooldownUntil) return;
      s.active = true;
      s.frame = 0;
      // Different letters resolve at different times.
      s.total = 6 + ((Math.random() * 16) | 0);
    };

    const wake = () => {
      if (running) return;
      running = true;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(tick);
    };

    /* Pointer-driven scrambling, localized around the cursor. */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || reduceMotion()) return;
      const radius = 150;
      let started = false;
      for (const s of states.current) {
        const r = s.el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < radius) {
          const was = s.active;
          startGlyph(s);
          if (!was && s.active) started = true;
        }
      }
      if (started) wake();
    };

    /* Rectangle reveal following the pointer across the hero. */
    const rect = rectRef.current;
    const dupBox = dupBoxRef.current;
    let rectVisible = false;
    const showRect = () => {
      if (rectVisible || !rect) return;
      rectVisible = true;
      measure();
      rect.classList.add("is-visible");
    };
    const hideRect = () => {
      rectVisible = false;
      rect?.classList.remove("is-visible");
    };
    const moveRect = (e: PointerEvent) => {
      if (!rect || !dupBox || e.pointerType === "touch" || reduceMotion())
        return;
      showRect();
      const h = hero.getBoundingClientRect();
      const w = rect.offsetWidth;
      const ht = rect.offsetHeight;
      const x = Math.max(
        6,
        Math.min(h.width - w - 6, e.clientX - h.left - w / 2),
      );
      const y = Math.max(
        6,
        Math.min(h.height - ht - 6, e.clientY - h.top - ht / 2),
      );
      gsap.to(rect, {
        x,
        y,
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
      // Keep the duplicate aligned while the rectangle glides.
      gsap.ticker.add(syncDup);
    };
    const syncDup = () => {
      if (!rect || !dupBox || !rectVisible) {
        gsap.ticker.remove(syncDup);
        return;
      }
      const rx = Number(gsap.getProperty(rect, "x")) || 0;
      const ry = Number(gsap.getProperty(rect, "y")) || 0;
      dupBox.style.transform = `translate(${nameDelta.current.x - rx}px, ${nameDelta.current.y - ry}px)`;
    };

    /* Touch devices: one short self-playing pass, then a stable name. */
    let autoPlayed = false;
    const autoPlay = () => {
      if (autoPlayed || reduceMotion()) return;
      autoPlayed = true;
      states.current.forEach((s, i) => {
        setTimeout(() => {
          s.active = true;
          s.frame = 0;
          s.total = 8 + ((Math.random() * 12) | 0);
          wake();
        }, 350 + i * 95);
      });
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) autoPlay();
      },
      { threshold: 0.4 },
    );
    if (!finePointer()) io.observe(hero);

    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointermove", moveRect, { passive: true });
    hero.addEventListener("pointerleave", hideRect);

    return () => {
      cancelAnimationFrame(raf.current);
      gsap.ticker.remove(syncDup);
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointermove", moveRect);
      hero.removeEventListener("pointerleave", hideRect);
      if (rect) gsap.killTweensOf(rect);
    };
  }, []);

  return (
    <>
      <h1 ref={nameRef} className="hero-name scramble-name" aria-label="Abhiraj Jain">
        <span className="sr-only">Abhiraj Jain</span>
        <span aria-hidden="true" className="name-visual">
          <GlyphSpans />
        </span>
      </h1>
      <div ref={rectRef} className="hero-rect" aria-hidden="true">
        <div ref={dupBoxRef} className="hero-rect-dup">
          <div className="hero-name hero-name-clone">
            <GlyphSpans />
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* WHO AM I: word-by-word scroll reveal                                */
/* ------------------------------------------------------------------ */

export function WordReveal({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduceMotion()) return;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".wr-word", ref.current);
      if (!words.length) return;
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
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
/* WHAT I DO: vertically stacking cards                                */
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
    title: "Performance, Testing & Reliability",
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
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        const area = root.current?.querySelector(".stack-area");
        area?.classList.add("stack-animated");
        const cards = gsap.utils.toArray<HTMLElement>(
          ".stack-card",
          root.current,
        );
        if (cards.length < 2) return;
        gsap.set(cards.slice(1), { yPercent: 130 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + Math.round(window.innerHeight * 2.8),
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        for (let i = 1; i < cards.length; i++) {
          const at = i - 1;
          tl.fromTo(
            cards[i],
            { yPercent: 130 },
            { yPercent: 0, duration: 1 },
            at,
          );
          for (let j = 0; j < i; j++) {
            const depth = i - j;
            tl.to(
              cards[j],
              {
                scale: 1 - 0.05 * depth,
                yPercent: -4 * depth,
                filter: `brightness(${Math.max(0.35, 1 - 0.28 * depth)})`,
                duration: 1,
              },
              at,
            );
          }
        }
        return () => {
          tl.scrollTrigger?.kill();
          area?.classList.remove("stack-animated");
        };
      },
    );
    mm.add(
      "(max-width: 899px), (prefers-reduced-motion: reduce)",
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
            scrollTrigger: { trigger: c, start: "top 92%", once: true },
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
/* ANALYZE / DESIGN / BUILD: circular scroll sequence                  */
/* ------------------------------------------------------------------ */

const ORBIT_WORDS = ["ANALYZE", "DESIGN", "BUILD"];
const ORBIT_DOTS = [
  { a: 35, r: 0.62, s: 5 },
  { a: 95, r: 0.78, s: 3 },
  { a: 160, r: 0.55, s: 4 },
  { a: 205, r: 0.72, s: 3 },
  { a: 262, r: 0.6, s: 5 },
  { a: 318, r: 0.82, s: 3 },
  { a: 280, r: 0.45, s: 3 },
  { a: 60, r: 0.4, s: 3 },
];

export function Orbit() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const stage = root.current?.querySelector(".orbit-stage");
        stage?.classList.add("orbit-animated");
        const ring = root.current?.querySelector(".orbit-ring");
        if (!ring) return;
        const tween = gsap.fromTo(
          ring,
          { rotation: 0 },
          {
            rotation: -240,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + Math.round(window.innerHeight * 2.6),
              scrub: 0.55,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          },
        );
        return () => {
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
          <span>ANALYZE → DESIGN → BUILD</span>
        </div>
        <div className="orbit-ring" aria-hidden="true">
          {ORBIT_WORDS.map((word, i) => (
            <span
              key={word}
              className="orbit-word"
              style={{ ["--a" as string]: `${i * 120}deg` }}
            >
              {word}
            </span>
          ))}
          {ORBIT_DOTS.map((d, i) => (
            <i
              key={i}
              className="orbit-dot"
              style={
                {
                  ["--a" as string]: `${d.a}deg`,
                  ["--r" as string]: `${d.r}`,
                  ["--s" as string]: `${d.s}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <h2 className="sr-only">Analyze, Design, Build</h2>
        <div className="orbit-center mono" aria-hidden="true">
          PROCESS
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* BEYOND THE CODE: academic-journey timeline                          */
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
          const right = item.classList.contains("right");
          const card = item.querySelector(".timeline-card");
          const dot = item.querySelector(".timeline-dot");
          const st = {
            trigger: item,
            start: "top 90%",
            end: "top 58%",
            scrub: 0.4,
          } as const;
          if (card)
            gsap.fromTo(
              card,
              { opacity: 0.05, x: right ? 56 : -56 },
              { opacity: 1, x: 0, ease: "none", scrollTrigger: st },
            );
          if (dot)
            gsap.fromTo(
              dot,
              { scale: 0.4, opacity: 0.3 },
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
