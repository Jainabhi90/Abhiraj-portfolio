"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function MotionSystem() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      anchors: true,
    });
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    gsap.ticker.add(update);
    const ctx = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>("[data-reveal]")
        .forEach((el) =>
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            // Default state stays visible; the from-state only applies
            // once the trigger actually fires, so stale triggers can
            // never strand content at opacity 0.
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          }),
        );
    });
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    return () => {
      ctx.revert();
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [path]);
  useEffect(() => {
    if (path !== "/") {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
  }, [path]);
  return null;
}

/* Multilingual greeting. Plays on every full document load (first
   visit, normal reload, hard refresh). The layout stays mounted across
   client-side navigation, so internal navigation never replays it.
   introDoneInThisDocument is module state: it resets with the document
   and guards React Strict Mode's development double-mount. */
let introDoneInThisDocument = false;

/* The greeting plays on the first open of the site in a browser
   session. Reloads in the same tab (normal or hard: page JS cannot
   distinguish the two) skip it, per the user's direction. */
const INTRO_KEY = "aj-intro-seen";
function introSeenThisSession() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}
function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* storage unavailable: fall back to per-document behavior */
  }
}

export function Preloader() {
  const [active, setActive] = useState(false);
  const [word, setWord] = useState(0);
  const greetings = [
    "Hello",
    "नमस्ते",
    "Bonjour",
    "Hola",
    "Ciao",
    "こんにちは",
    "Hallo",
    "Hello, I'm Abhiraj.",
  ];
  useEffect(() => {
    if (
      introDoneInThisDocument ||
      introSeenThisSession() ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    // Each greeting holds ~300ms so it is genuinely readable; the final
    // greeting holds longer before the mask lifts (CSS exit at 2.9s).
    // Owner: greeting a little faster (Nov 19 2026).
    const steps = [300, 300, 300, 300, 300, 300, 300, 800];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const init = setTimeout(() => setActive(true), 0);
    timers.push(init);
    let elapsed = 0;
    steps.forEach((hold, i) => {
      elapsed += hold;
      if (i < steps.length - 1)
        timers.push(setTimeout(() => setWord(i + 1), elapsed));
    });
    timers.push(
      setTimeout(() => {
        document.documentElement.classList.add("intro-complete");
        introDoneInThisDocument = true;
        markIntroSeen();
      }, 2900),
    );
    timers.push(setTimeout(() => setActive(false), 3600));
    return () => timers.forEach(clearTimeout);
  }, []);

  /* While the full-screen intro obscures the page, the content below
     must not be keyboard-focusable. */
  useEffect(() => {
    const main = document.querySelector("main");
    const header = document.querySelector(".navbar");
    if (active) {
      if (main) main.inert = true;
      header?.setAttribute("inert", "");
    } else {
      if (main) main.inert = false;
      header?.removeAttribute("inert");
    }
    return () => {
      if (main) main.inert = false;
      header?.removeAttribute("inert");
    };
  }, [active]);

  function skip() {
    setActive(false);
    document.documentElement.classList.add("intro-complete");
    introDoneInThisDocument = true;
    markIntroSeen();
  }
  return (
    <div
      className={`intro ${active ? "intro-active" : ""}`}
      aria-hidden={!active}
    >
      <span className="mono intro-brand">AJ. / AN INTRODUCTION</span>
      <div className="greeting" key={word}>
        {greetings[word]}
      </div>
      <button onClick={skip} tabIndex={active ? 0 : -1}>
        Skip intro ↗
      </button>
      <span className="intro-caption mono">A BRIEF HELLO. THEN, THE WORK.</span>
      <span className="intro-track">
        <i />
      </span>
    </div>
  );
}

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !matchMedia("(pointer:fine)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
        el.style.opacity = "1";
        const target = e.target as HTMLElement;
        el.classList.toggle("cursor-link", !!target.closest("a,button"));
      });
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      {/* Kick Buttowski's glove in its original yellowish colour,
          replacing the native arrow. The fingertip is the pointer
          hotspot (see CSS margin). */}
      <img src="/images/kick/kick-glove.png" alt="" width={89} height={125} />
    </div>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const [message, setMessage] = useState("Copy email");
  return (
    <>
      <button
        className="copy-button mono"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setMessage("Email copied ✓");
          } catch {
            setMessage("Select the email to copy");
          }
        }}
      >
        {message}
      </button>
      <span className="sr-only" role="status">
        {message === "Copy email" ? "" : message}
      </span>
    </>
  );
}
