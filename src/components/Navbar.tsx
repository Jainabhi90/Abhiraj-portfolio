"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/portfolio";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const main = document.querySelector("main");
    if (main) main.inert = true;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (e.key === "Tab") {
        const items = menu.current?.querySelectorAll<HTMLElement>("a");
        if (!items?.length) return;
        const first = button.current,
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      if (main) main.inert = false;
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
    };
  }, [open]);
  const links = [
    ["Home", "top"],
    ["About", "about"],
    ["What I Do", "expertise"],
    ["Selected Work", "work"],
    ["Tech Stack", "tech-stack"],
    ["Journey", "leadership"],
    ["Experience", "experience"],
    ["Contact", "contact"],
  ];
  return (
    <header className={`navbar ${open ? "menu-open" : ""}`}>
      <Link
        className="brand"
        href="/"
        aria-label="Abhiraj Jain home"
        onClick={() => setOpen(false)}
      >
        Abhiraj<span>.</span>
      </Link>
      <a
        className="nav-direct-resume mono"
        href={profile.resume}
        target="_blank"
        rel="noopener noreferrer"
      >
        RESUME ↗
      </a>
      <button
        ref={button}
        className="menu-toggle mono"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen(!open)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span className="menu-lines" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <nav
        ref={menu}
        id="main-navigation"
        aria-label="Main navigation"
        className={open ? "nav-links is-open" : "nav-links"}
      >
        <div className="nav-social mono">
          <a href={profile.github}>GITHUB ↗</a>
          <a href={profile.linkedin}>LINKEDIN ↗</a>
          <a href={`mailto:${profile.email}`}>EMAIL ↗</a>
        </div>
        {links.map(([label, id], i) => (
          <Link
            key={id}
            href={`/#${id}`}
            onClick={() => {
              setOpen(false);
              button.current?.focus();
            }}
          >
            <span>{label}</span>
            <small className="mono" aria-hidden="true">
              0{i + 1}
            </small>
          </Link>
        ))}
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-resume"
        >
          View Resume ↗
        </a>
      </nav>
    </header>
  );
}
