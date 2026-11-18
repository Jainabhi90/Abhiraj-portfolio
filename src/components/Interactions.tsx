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
      sessionStorage.getItem("aj-intro") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    // Each greeting holds ~400ms so it is genuinely readable; the final
    // greeting holds longer before the mask lifts (CSS exit at 3.8s).
    const steps = [400, 400, 400, 400, 400, 400, 400, 1000];
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
        sessionStorage.setItem("aj-intro", "1");
      }, 3800),
    );
    timers.push(setTimeout(() => setActive(false), 4500));
    return () => timers.forEach(clearTimeout);
  }, []);
  function skip() {
    setActive(false);
    document.documentElement.classList.add("intro-complete");
    sessionStorage.setItem("aj-intro", "1");
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
  return <div ref={ref} className="cursor" aria-hidden="true" />;
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

// Original low-poly folded surface. Pointer input bends the mesh, not a gradient overlay.
export function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const fine = matchMedia("(pointer:fine)").matches;
    let frame = 0,
      t = 0,
      w = 0,
      h = 0,
      visible = true;
    const target = { x: 0.68, y: 0.4 },
      pointer = { ...target };
    const hero = canvas.parentElement!;
    function resize() {
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas!.width = w * Math.min(devicePixelRatio, 1.5);
      canvas!.height = h * Math.min(devicePixelRatio, 1.5);
      ctx!.setTransform(canvas!.width / w, 0, 0, canvas!.height / h, 0, 0);
      draw();
    }
    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const columns = 29,
        rows = 15;
      const bw = w * 0.57,
        bh = h * 0.58;
      const ox = w * 0.48,
        oy = h * 0.16;
      const time = reduce ? 0 : t * 0.007;
      const point = (i: number, j: number) => {
        const x = i / columns,
          y = j / rows;
        const wave =
          Math.sin(x * 6.2 + time + y * 2.4) * Math.cos(y * 4.3 - time * 0.45);
        const distance = Math.hypot(x - (pointer.x - 0.4) * 1.5, y - pointer.y);
        const bend =
          Math.exp(-distance * distance * 7) * (pointer.x - 0.5) * 92;
        return [ox + x * bw + (y - 0.5) * 60, oy + y * bh + wave * 42 + bend];
      };
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < columns; i++) {
          const a = point(i, j),
            b = point(i + 1, j),
            c = point(i + 1, j + 1),
            d = point(i, j + 1);
          const light = Math.sin(i * 0.28 + j * 0.31 + time) * 0.5 + 0.5;
          ctx!.fillStyle = `rgba(${8 + light * 8},${25 + light * 34},${21 + light * 27},${0.12 + light * 0.2})`;
          ctx!.strokeStyle = `rgba(83,177,148,${0.055 + light * 0.11})`;
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.moveTo(a[0], a[1]);
          ctx!.lineTo(b[0], b[1]);
          ctx!.lineTo(c[0], c[1]);
          ctx!.lineTo(d[0], d[1]);
          ctx!.closePath();
          ctx!.fill();
          ctx!.stroke();
        }
    }
    function tick() {
      pointer.x += (target.x - pointer.x) * 0.065;
      pointer.y += (target.y - pointer.y) * 0.065;
      if (visible) {
        t++;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    const move = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
    };
    const leave = () => {
      target.x = 0.68;
      target.y = 0.4;
    };
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    observer.observe(hero);
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    if (fine && !reduce) {
      hero.addEventListener("pointermove", move, { passive: true });
      hero.addEventListener("pointerleave", leave);
    }
    resize();
    if (!reduce) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ro.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <canvas ref={ref} className="hero-field" aria-hidden="true" />;
}
