import Image from "next/image";
import Link from "next/link";
import { profile, Project } from "@/content/portfolio";

import { SocialLinks } from "./SocialLinks";
import { KickTrack, ScrambleName, ScrambleText, WordReveal } from "./Motion";

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
          <span className="sr-only">
            Building real products from idea to production.
          </span>
          <ScrambleText text="Building" /> <ScrambleText text="real" />{" "}
          <ScrambleText text="products" />
          <br />
          <ScrambleText text="from" />{" "}
          <em>
            <ScrambleText text="idea" />
          </em>{" "}
          <ScrambleText text="to" /> <ScrambleText text="production." />
        </p>
        <div className="hero-side mono">
          <ScrambleText text="SOFTWARE ENGINEER" className="hero-role" />
          <span className="hero-accent">CO-FOUNDER & CTO / NIOLEARN</span>
        </div>
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
            className="hero-pill hero-pill-lead"
            href="https://niolearn.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CO-FOUNDER & CTO · <span className="hero-accent">NIOLEARN</span>{" "}
            <span aria-hidden="true">↗</span>
          </a>
          <span className="hero-pill">
            B.TECH AI & ML · <span className="hero-accent">VEDAM × ADYPU</span>
          </span>
          <SocialLinks items={["github", "linkedin", "email"]} />
        </div>
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
      {/* Kick rides a red stunt rail across the hero, starting directly
          from the left edge mark on open/refresh (owner's direction,
          Nov 19 2026). */}
      <KickTrack />
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
          {/* Half-dark Kick Buttowski portrait (the approved GitHub profile
              artwork), framed like the rest of the site's media. Restored at
              the owner's request (Nov 19 2026). */}
          <div className="whoami-kick">
            <Image
              src="/images/kick/kick-portrait-dark.png"
              alt=""
              width={640}
              height={640}
            />
          </div>
          <span className="mono whoami-visual-label">
            KICK BUTTOWSKI / DAREDEVIL MINDSET
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
    copy: "Direct line for opportunities and collaborations.",
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

export function Marquee() {
  const words = [
    "LET'S BUILD SOMETHING REAL",
    "OPEN TO OPPORTUNITIES",
    "AVAILABLE FOR WORK",
    "PUNE · WORKING WORLDWIDE",
  ];
  const seq = [...words, ...words, ...words];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track mono">
        {[0, 1].map((half) => (
          <div className="marquee-half" key={half}>
            {seq.map((w, i) => (
              <span className="marquee-item" key={i}>
                <i className="marquee-dot" />
                {w}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
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
      {/* Large Kick artwork anchoring the right of the dark panel
          (owner pick: a bigger piece in place of the small sticker). */}
      <img
        className="contact-kick"
        src="/images/kick/kick-contact.jpg"
        alt=""
        width={514}
        height={556}
        aria-hidden="true"
      />
      <div className="contact-bottom">
        <p>
          Open to software engineering opportunities,
          <br />
          interesting products, and meaningful collaborations.
          <br />
          <span className="contact-loc mono">PUNE, INDIA · WORKING WORLDWIDE</span>
        </p>
        <a className="email-link" href={`mailto:${profile.email}`}>
          {profile.email} ↗
        </a>
      </div>
      <div className="footer-bottom mono">
        <span>© 2026 ABHIRAJ JAIN</span>
        <div>
          <SocialLinks items={["github", "linkedin", "resume"]} />
        </div>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
