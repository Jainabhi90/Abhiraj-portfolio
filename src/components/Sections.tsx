import Image from "next/image";
import Link from "next/link";
import { profile, Project } from "@/content/portfolio";
import { CopyEmail } from "./Interactions";
import { ScrambleName, ScrambleText, WordReveal } from "./Motion";

export function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-top mono">
        <span>
          <i className="status-dot" aria-hidden="true" /> ENGINEERING × PRODUCT
        </span>
        <span>PORTFOLIO / 2026</span>
      </div>
      <div className="hero-center">
        <ScrambleName />
        <p className="hero-tagline">
          Building real products
          <br />
          from <em>idea</em> to production.
        </p>
        <div className="hero-cta">
          <a href="#work" className="cta-pill">
            View selected work <span aria-hidden="true">↘</span>
          </a>
          <a
            href={profile.resume}
            className="cta-text"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download résumé <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-meta mono">
          <a
            className="hero-pill"
            href="https://niolearn.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CO-FOUNDER & CTO · NIOLEARN <span aria-hidden="true">↗</span>
          </a>
          <span className="hero-pill">B.TECH AI & ML · VEDAM × ADYPU</span>
          <span className="hero-socials">
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GITHUB ↗
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LINKEDIN ↗
            </a>
            <a href={`mailto:${profile.email}`}>EMAIL ↗</a>
          </span>
        </div>
      </div>
      <div className="hero-side mono">
        <ScrambleText text="SOFTWARE ENGINEER" className="hero-role" />
        <span>CO-FOUNDER & CTO / NIOLEARN</span>
      </div>
      <div className="hero-bottom mono">
        <a href={profile.github}>
          GITHUB <span aria-hidden="true">↗</span>
        </a>
        <a href={profile.linkedin}>
          LINKEDIN <span aria-hidden="true">↗</span>
        </a>
        <a href="#contact">
          CONTACT <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

const WHOAMI_PARAGRAPHS = [
  "I'm Abhiraj Jain, a Software Engineer and Co-Founder & CTO of NioLearn, based in Pune. I study B.Tech Computer Science with AI & ML at Vedam School of Technology, Ajeenkya DY Patil University.",
  "My work runs across the product: frontend interfaces, backend APIs, authentication flows, payment verification, and the product decisions that tie them together. At NioLearn I lead product and technical development, from timed assessments to a verified Razorpay checkout.",
  "I care about software that holds up in real use: measured performance, automated tests, accessible interfaces, and honest engineering over decoration.",
];

export function WhoAmI() {
  return (
    <section id="about" className="about section whoami">
      <div className="section-top mono">
        <span>01 / THE PERSON BEHIND THE WORK</span>
        <span>PUNE, INDIA</span>
      </div>
      <h2 className="reference-heading">
        WHO <em>am</em> I?
      </h2>
      <span className="mint-rule" />
      <p className="whoami-intro">
        Engineer by practice. Builder by instinct.
      </p>
      <div className="whoami-grid">
        <div className="whoami-visual" aria-hidden="true">
          <svg viewBox="0 0 400 400" role="presentation">
            <defs>
              <linearGradient id="wv-line" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#217e61" stopOpacity="0.85" />
                <stop offset="1" stopColor="#2bcb98" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect
              x="60"
              y="60"
              width="280"
              height="280"
              fill="none"
              stroke="#cdd5cd"
              strokeWidth="1"
            />
            <rect
              x="110"
              y="110"
              width="180"
              height="180"
              fill="none"
              stroke="url(#wv-line)"
              strokeWidth="1.2"
              transform="rotate(12 200 200)"
            />
            <circle
              cx="200"
              cy="200"
              r="58"
              fill="none"
              stroke="#217e61"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <circle cx="200" cy="200" r="4" fill="#2bcb98" />
            <line
              x1="200"
              y1="20"
              x2="200"
              y2="60"
              stroke="#cdd5cd"
              strokeWidth="1"
            />
            <line
              x1="200"
              y1="340"
              x2="200"
              y2="380"
              stroke="#cdd5cd"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1="200"
              x2="60"
              y2="200"
              stroke="#cdd5cd"
              strokeWidth="1"
            />
            <line
              x1="340"
              y1="200"
              x2="380"
              y2="200"
              stroke="#cdd5cd"
              strokeWidth="1"
            />
          </svg>
          <span className="mono whoami-visual-label">
            SYSTEMS / STRUCTURE / PEOPLE
          </span>
        </div>
        <WordReveal paragraphs={WHOAMI_PARAGRAPHS} />
      </div>
    </section>
  );
}

export function ProjectVisual({ project }: { project: Project }) {
  if (project.image)
    return (
      <figure className="project-media">
        <Image
          src={project.image}
          alt={`${project.name} live project homepage, captured November 2026`}
          width={1440}
          height={900}
          sizes="(max-width: 768px) 100vw, 85vw"
        />
        <figcaption className="media-label mono">
          LIVE PROJECT CAPTURE / NOVEMBER 2026
        </figcaption>
      </figure>
    );
  return (
    <div
      className={`project-media project-graphic graphic-${project.slug}`}
      aria-label={`${project.name} editorial project graphic, not a product screenshot`}
    >
      <span className="mono graphic-top">EDITORIAL PROJECT GRAPHIC</span>
      <span className="graphic-word">{project.name}</span>
      <div className="graphic-lines" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="graphic-bottom mono">
        <span>{project.kind}</span>
        <span>NOT A PRODUCT SCREENSHOT</span>
      </div>
    </div>
  );
}

export function Experience() {
  return (
    <section id="experience" className="section experience">
      <div className="section-top mono">
        <span>02 / EXPERIENCE</span>
        <span>BUILD. TEST. ITERATE.</span>
      </div>
      <h2 className="section-title" data-reveal>
        Product thinking.
        <br />
        <em>Engineering depth.</em>
      </h2>
      <article className="experience-row" data-reveal>
        <span className="mono">2026–PRESENT</span>
        <div>
          <h3>
            NioLearn <span>↗</span>
          </h3>
          <p className="experience-role">
            Co-Founder & CTO
            <br />
            Head of Product & Technology
          </p>
        </div>
        <div className="experience-copy">
          <p>
            Leading product and engineering for a live tech admissions platform,
            from student assessments to checkout.
          </p>
          <ul>
            <li>Timed assessments, autosave, and server-side scoring.</li>
            <li>Razorpay order creation, verification, and signed webhooks.</li>
            <li>
              Supabase session refresh and automated authentication tests.
            </li>
          </ul>
          <Link href="/projects/niolearn" className="text-link">
            Read the engineering story ↗
          </Link>
        </div>
      </article>
    </section>
  );
}

const PRESENCE_CARDS = [
  {
    label: "GITHUB",
    title: "@Jainabhi90",
    copy: "Code, experiments, and everything I ship.",
    href: profile.github,
  },
  {
    label: "LINKEDIN",
    title: "Abhiraj Jain",
    copy: "Roles, milestones, and the professional trail.",
    href: profile.linkedin,
  },
  {
    label: "PRODUCT",
    title: "NioLearn",
    copy: "The admissions platform I build as Co-Founder & CTO.",
    href: "https://niolearn.com/",
  },
  {
    label: "EMAIL",
    title: "jainabhi90980@gmail.com",
    copy: "Fastest way to reach me — I reply quickly.",
    href: `mailto:${profile.email}`,
    small: true,
  },
];

export function OnlinePresence() {
  return (
    <section id="presence" className="presence section">
      <div className="section-top mono">
        <span>08 / ONLINE PRESENCE</span>
        <span>FIND ME ONLINE</span>
      </div>
      <h2 className="section-title" data-reveal>
        Everywhere I <em>build.</em>
      </h2>
      <div className="presence-grid">
        {PRESENCE_CARDS.map((c) => (
          <a
            key={c.label}
            className="presence-card"
            href={c.href}
            target={c.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            data-reveal
          >
            <span className="mono presence-card-label">
              {c.label} <span aria-hidden="true">↗</span>
            </span>
            <span
              className={`presence-card-title ${c.small ? "presence-card-title--sm" : ""}`}
            >
              {c.title}
            </span>
            <span className="presence-card-copy">{c.copy}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <footer id="contact" className="contact section">
      <div className="section-top mono">
        <span>09 / YOUR NEXT IDEA STARTS HERE</span>
        <span>
          <i className="status-dot" /> LET&apos;S TALK
        </span>
      </div>
      <h2 data-reveal>
        LET&apos;S BUILD
        <br />
        SOMETHING
        <br />
        <em>REAL.</em>
        <span className="contact-arrow" aria-hidden="true">
          ↗
        </span>
      </h2>
      <div className="contact-bottom">
        <p>
          Open to software engineering opportunities,
          <br />
          interesting products, and meaningful collaborations.
          <br />
          <span className="contact-loc mono">PUNE, INDIA · WORKING WORLDWIDE</span>
        </p>
        <div>
          <a className="email-link" href={`mailto:${profile.email}`}>
            {profile.email} ↗
          </a>
          <CopyEmail email={profile.email} />
        </div>
      </div>
      <div className="footer-bottom mono">
        <span>© 2026 ABHIRAJ JAIN</span>
        <div>
          <a href={profile.github}>GITHUB ↗</a>
          <a href={profile.linkedin}>LINKEDIN ↗</a>
          <a href={profile.resume} target="_blank" rel="noopener noreferrer">
            RÉSUMÉ ↗
          </a>
        </div>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
