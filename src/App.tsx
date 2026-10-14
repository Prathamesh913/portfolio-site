import { useCallback, useEffect, useState, type ReactNode } from "react";
import { blogPosts, blogSeries, buildProjects, experience, galleryItems, skills, socialLinks, toolkit } from "./data";
import type { BlogPost, ExperienceItem, GalleryItem } from "./data";
import { allCaseStudies, CASE_ORDER } from "./data/caseStudies";
import type { CaseStudy } from "./data/caseStudies";
import { CaseStudyPage } from "./components/CaseStudyPage";
import { CurrentlySection } from "./components/CurrentlySection";
import { InitialLoader } from "./components/InitialLoader";
import { GithubActivity } from "./components/GithubActivity";
import { HireForm } from "./components/HireForm";
import { ImageLightbox, useImageLightbox } from "./components/ImageLightbox";
import { OutsideOfWork } from "./components/OutsideOfWork";
import { SkillIcon, SocialIcon } from "./components/SkillIcons";
import { GoToTop, ScrollProgress, SiteHeader } from "./components/SiteHeader";
import { useInViewOnce } from "./lib/useInViewOnce";
import { useChipStamp } from "./lib/useChipStamp";
import { useKeyboardShortcuts } from "./lib/useKeyboardShortcuts";

const GITHUB_URL = "https://github.com/Prathamesh913";

/** Fade-and-rise a section the first time it scrolls into view. */
function useReveal<T extends Element>() {
  const { ref, inView } = useInViewOnce<T>();
  return { ref, revealClass: inView ? "reveal is-inview" : "reveal" };
}

const caseStudies: Record<string, CaseStudy> = Object.fromEntries(
  allCaseStudies.map((c) => [c.slug, c])
);

function getCaseSlug(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/^#\/work\/([a-z0-9-]+)/);
  return match ? match[1] : null;
}

function isNonEmpty(value: string | undefined): value is string {
  return !!value && value.trim().length > 0 && value.trim().toLowerCase() !== "placeholder";
}

/** Render `**metric**` spans as emphasized, non-color-only text. */
function renderEmphasis(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong className="exp-metric" key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

type ArchiveView = "gallery" | "blogs";

// Honest local time — the one fact about "now" this page can always show,
// and the reason a message lands fastest at certain hours. Pure instrument:
// no words, no status copy.
function LocalClock() {
  const [time, setTime] = useState(() =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );
  useEffect(() => {
    const id = setInterval(
      () =>
        setTime(
          new Intl.DateTimeFormat("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
          }).format(new Date())
        ),
      15_000
    );
    return () => clearInterval(id);
  }, []);
  return (
    <span className="footer-clock" title="My local time (IST)">
      IST {time}
    </span>
  );
}

function getArchiveView(): ArchiveView {
  return new URLSearchParams(window.location.search).get("view") === "blogs" ? "blogs" : "gallery";
}

function formatBlogDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${iso}T00:00:00`)
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="coll-card" role="listitem">
      {post.image && (
        <img className="coll-cover" src={post.image.src} alt={post.image.alt} loading="lazy" decoding="async" width={600} height={400} />
      )}
      <p className="coll-meta">
        {formatBlogDate(post.date)}
        {post.readingTime ? ` · ${post.readingTime} min read` : ""}
      </p>
      <h4 className="coll-title">{post.title}</h4>
      <p className="coll-desc">{post.description}</p>
      <p className="coll-tags">
        {post.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag} </span>)}
      </p>
      <p className="coll-links">
        <a href={post.url} target="_blank" rel="noreferrer">
          Read on Medium ↗<span className="sr-only">: {post.title} (opens in a new tab)</span>
        </a>
      </p>
    </article>
  );
}

function galleryMeta(item: GalleryItem): string {
  return [item.type, item.year, item.device].filter((part): part is string => !!part).join(" · ");
}

// One experience row, collapsed by default. The whole head is the trigger;
// details (highlights + supporting note) live in an animated panel. Single
// open row at a time keeps the page compact — state lives in the parent.
function ExperienceRow({
  job,
  index,
  open,
  onToggle,
}: {
  job: ExperienceItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const headId = `exp-head-${index}`;
  const panelId = `exp-panel-${index}`;
  return (
    <article className={`exp-row${open ? " is-open" : ""}`}>
      <span className="exp-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div className="exp-row__main">
        <h3 className="exp-row__title" id={headId}>
          <button
            type="button"
            className="exp-row__trigger"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
          >
            <span className="exp-row__role">
              {job.role} <span className="exp-org">— {job.org}</span>
            </span>
            <span className="exp-period">{job.period}</span>
            <span className="exp-row__chevron" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l5 5 5-5" />
              </svg>
            </span>
          </button>
        </h3>
        <div className="exp-row__panel" id={panelId} role="region" aria-labelledby={headId}>
          <div className="exp-row__panel-inner">
            <ul className="exp-highlights">
              {job.highlights.map((highlight) => (
                <li key={highlight}>{renderEmphasis(highlight)}</li>
              ))}
            </ul>
            {job.supporting && <p className="exp-supporting">{renderEmphasis(job.supporting)}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

function GallerySection() {
  const galleryEntries = galleryItems.map((item) => ({
    src: item.image.src,
    alt: item.image.alt,
    w: item.image.w,
    h: item.image.h,
    title: item.title,
    meta: galleryMeta(item),
    description: item.description,
    details: item.points,
  }));
  const lightbox = useImageLightbox("gallery-thumb");

  return (
    <div>
      <p className="gallery-note">Select any image for a larger view.</p>
      <div className="gallery-strip" role="list" tabIndex={0} aria-label={`Gallery: scrollable list, ${galleryItems.length} UI screenshots`}>
        {galleryItems.map((item, i) => (
          <figure className="gallery-card" role="listitem" key={item.id}>
            <button
              type="button"
              id={`gallery-thumb-${i}`}
              className="gallery-thumb"
              aria-haspopup="dialog"
              aria-label={`Open larger view: ${item.title}`}
              onClick={() => lightbox.open(i)}
            >
              <img
                src={item.image.src}
                alt=""
                loading="lazy"
                decoding="async"
                width={item.image.w}
                height={item.image.h}
              />
            </button>
            <figcaption>
              <span className="gallery-title">{item.title}</span>
              <span className="gallery-meta">{galleryMeta(item)}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {lightbox.index !== null && (
        <ImageLightbox
          entries={galleryEntries}
          index={lightbox.index}
          onClose={lightbox.close}
          onNavigate={lightbox.navigate}
        />
      )}
    </div>
  );
}

function App() {
  const [booted, setBooted] = useState(() => {
    try { return sessionStorage.getItem("portfolio-booted") !== "1"; }
    catch { return true; }
  });
  const handleBootDone = useCallback(() => {
    try { sessionStorage.setItem("portfolio-booted", "1"); } catch {}
    setBooted(false);
  }, []);
  const caseProjects = CASE_ORDER.map((slug) => caseStudies[slug]).filter((c): c is CaseStudy => !!c);
  const toolProjects = buildProjects;
  // Contact row: GitHub first, then whatever social/resume links have URLs.
  const contactLinks = [
    { label: "Github", href: GITHUB_URL, note: "GitHub profile" },
    ...socialLinks.filter((link) => link.href),
  ];
  const [activeSection, setActiveSection] = useState<string>("top");
  const [caseSlug, setCaseSlug] = useState<string | null>(getCaseSlug());
  const [archiveView, setArchiveView] = useState<ArchiveView>(getArchiveView);
  // Experience accordion: collapsed by default, one row open at a time.
  const [openExp, setOpenExp] = useState<number | null>(null);

  const revealWork = useReveal<HTMLElement>();
  const revealArchive = useReveal<HTMLElement>();
  const revealExperience = useReveal<HTMLElement>();
  const revealContact = useReveal<HTMLElement>();
  // One-shot stamp entrances for the two chip grids.
  const skillsStamp = useChipStamp<HTMLDivElement>();
  const toolkitStamp = useChipStamp<HTMLDivElement>();
  // Keyboard instruments: t theme, w/a/e/c sections.
  useKeyboardShortcuts();

  const toggleArchiveView = (view: ArchiveView) => {
    setArchiveView(view);
    const url = new URL(window.location.href);
    if (view === "gallery") url.searchParams.delete("view");
    else url.searchParams.set("view", "blogs");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      // In-page anchors (e.g. "#cs-overview" from the skip link) are not
      // routes — ignore them so they don't unload the current page.
      if (hash && !hash.startsWith("#/") && hash !== "#") return;
      setCaseSlug(getCaseSlug());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    // CaseStudyPage sets its own title; restore the default on home.
    if (!caseSlug || !caseStudies[caseSlug]) {
      document.title = "Prathamesh | Design, build, explore";
    }
  }, [caseSlug]);

  useEffect(() => {
    const ids = ["work", "archive", "experience", "contact"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (caseSlug && caseStudies[caseSlug]) {
    return (
      <>
        {booted && <InitialLoader onDone={handleBootDone} />}
        <CaseStudyPage key={caseSlug} data={caseStudies[caseSlug]} />
      </>
    );
  }

  return (
    <>
      {booted && <InitialLoader onDone={handleBootDone} />}
      <div className="site-shell">
      <ScrollProgress />
      <GoToTop />
      <a className="skip-link" href="#work">Skip to work</a>

      <SiteHeader
        wordmarkHref="#top"
        wordmarkLabel="Prathamesh home"
        wordmarkText="prathamesh"
        navLabel="Primary navigation"
      >
        <a href="#work" className={activeSection === "work" ? "is-active" : ""} data-shortcut="w" aria-keyshortcuts="w">work</a>
        <a href="#archive" className={activeSection === "archive" ? "is-active" : ""} data-shortcut="a" aria-keyshortcuts="a">archive</a>
        <a href="#experience" className={activeSection === "experience" ? "is-active" : ""} data-shortcut="e" aria-keyshortcuts="e">experience</a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">github</a>
        <a href="#contact" className={activeSection === "contact" ? "is-active" : ""} data-shortcut="c" aria-keyshortcuts="c">contact</a>
      </SiteHeader>

      <main id="main-content">
        <section className="intro section-frame" id="top">
          <h1>Prathamesh</h1>
          <p>I design interfaces for operational software and build small tools.</p>
        </section>

        <CurrentlySection />

        <GithubActivity />

        <section className={`work section-frame ${revealWork.revealClass}`} ref={revealWork.ref} id="work" aria-label="Work">
          <h2>Work <span className="section-count">{caseProjects.length} case studies · {toolProjects.length} tools</span></h2>

          <div className="collections-strip" role="list" tabIndex={0} aria-label={`Case studies: scrollable list, ${caseProjects.length} projects`}>
            {caseProjects.map((cs) => {
              const preview = cs.galleries[0]?.screens[0];
              const isExploration = cs.kind === "exploration";
              const context = isExploration ? "Independent" : cs.company;
              const kindLabel = isExploration ? "exploration" : "case study";
              const actionLabel = isExploration ? "View exploration" : "Read case study";
              const href = `#/work/${cs.slug}`;
              return (
                <article className="coll-card coll-card--project" role="listitem" key={cs.slug} id={cs.slug}>
                  {preview && (
                    <a className="coll-media coll-media--link" href={href} aria-label={`Open ${cs.title} ${kindLabel}`}>
                      <img className="coll-cover coll-project-cover" src={preview.src} alt="" loading="lazy" decoding="async" width={preview.w} height={preview.h} />
                      <span className="coll-media__cta" aria-hidden="true">View <span className="coll-link__arrow">→</span></span>
                    </a>
                  )}
                  <h3 className="coll-title"><a className="work-title-link" href={href}>{cs.title}</a></h3>
                  <p className="coll-meta">{context} · {kindLabel} · {cs.year}</p>
                  <p className="coll-desc">{cs.cardSummary ?? cs.summary}</p>
                  <p className="coll-links">
                    <a className="coll-link coll-link--primary" href={href}>
                      {actionLabel}<span className="coll-link__arrow" aria-hidden="true">→</span>
                    </a>
                    {cs.marketplaceUrl && (
                      <a href={cs.marketplaceUrl} target="_blank" rel="noreferrer">
                        Marketplace ↗<span className="sr-only">: {cs.title} on the Omarchy marketplace (opens in a new tab)</span>
                      </a>
                    )}
                  </p>
                </article>
              );
            })}
          </div>

          <h3 className="work-group-label">Playground</h3>
          <div className="collections-strip" role="list" tabIndex={0} aria-label={`Playground: scrollable list, ${toolProjects.length} tools`}>
            {toolProjects.map((project) => {
              const primaryHref = project.liveUrl ?? project.marketplaceUrl;
              const primaryLabel = project.liveUrl ? "Visit" : "View marketplace";
              const primaryArrow = project.liveUrl ? "↗" : "→";
              const secondary = [
                project.repositoryUrl && {
                  href: project.repositoryUrl,
                  label: "GitHub",
                  note: `${project.title} repository`,
                },
                project.marketplaceUrl &&
                  project.marketplaceUrl !== primaryHref && {
                    href: project.marketplaceUrl,
                    label: "Marketplace",
                    note: `${project.title} on the Omarchy marketplace`,
                  },
              ].filter((link): link is { href: string; label: string; note: string } => !!link);
              return (
                <article className="coll-card" role="listitem" key={project.slug} id={project.slug}>
                  {project.cover && !project.cover.src.includes("/placeholder/") && (
                    <span className="coll-media">
                      <img className="coll-cover coll-project-cover" src={project.cover.src} alt="" loading="lazy" decoding="async" />
                    </span>
                  )}
                  <h3 className="coll-title">{project.title}</h3>
                  <p className="coll-meta">
                    Independent{project.openSource ? " · open source" : ""}
                    {" · "}
                    {project.status === "live"
                      ? (<><span className="live-dot" aria-hidden="true">●</span> live</>)
                      : project.status}
                    {isNonEmpty(project.year) ? ` · ${project.year}` : ""}
                  </p>
                  <p className="coll-desc">{project.cardSummary ?? project.tagline ?? project.description}</p>
                  {(primaryHref || secondary.length > 0) && (
                    <p className="coll-links">
                      {primaryHref && (
                        <a className="coll-link coll-link--primary" href={primaryHref} target="_blank" rel="noreferrer">
                          {primaryLabel}<span className="coll-link__arrow" aria-hidden="true">{primaryArrow}</span>
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      )}
                      {secondary.map((link) => (
                        <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                          {link.label} ↗<span className="sr-only">: {link.note} (opens in a new tab)</span>
                        </a>
                      ))}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className={`collections section-frame ${revealArchive.revealClass}`} ref={revealArchive.ref} id="archive" aria-label="Archive">
          <div className="collections-head">
            <h2>Archive <span className="section-count">{galleryItems.length} images · {blogPosts.length} posts</span></h2>
            <div className="collections-toggle" role="group" aria-label="Switch between gallery and blogs">
              <button type="button" aria-pressed={archiveView === "gallery"} onClick={() => toggleArchiveView("gallery")}>Gallery</button>
              <button type="button" aria-pressed={archiveView === "blogs"} onClick={() => toggleArchiveView("blogs")}>Blogs</button>
            </div>
          </div>

          {archiveView === "gallery" ? (
            <div className="archive-panel" key="gallery">
              <GallerySection />
            </div>
          ) : (
            <div className="archive-panel" key="blogs">
              {(() => {
                const seriesPosts = blogPosts.filter((p) => p.series === "enterprise-ux").sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
                const standalonePosts = blogPosts.filter((p) => !p.series).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
                return (
                  <>
                    <h3 className="blog-series-label">{blogSeries["enterprise-ux"]}<span> · series · {seriesPosts.length} parts</span></h3>
                    <div className="collections-strip" role="list" tabIndex={0} aria-label={`Enterprise UX series: scrollable list, ${seriesPosts.length} articles`}>
                      {seriesPosts.map((post) => <BlogCard key={post.slug} post={post} />)}
                    </div>
                    <h3 className="blog-series-label">Articles<span> · {standalonePosts.length}</span></h3>
                    <div className="collections-strip" role="list" tabIndex={0} aria-label={`Articles: scrollable list, ${standalonePosts.length} articles`}>
                      {standalonePosts.map((post) => <BlogCard key={post.slug} post={post} />)}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </section>

        <div id="experience" className="experience-anchor" aria-hidden="true" />

        <section className={`experience section-frame ${revealExperience.revealClass}`} ref={revealExperience.ref} aria-label="Experience">
          <h2>Experience</h2>
          <div className="exp-list">
            {experience.map((job, i) => (
              <ExperienceRow
                key={`${job.org}-${job.period}`}
                job={job}
                index={i}
                open={openExp === i}
                onToggle={() => setOpenExp(openExp === i ? null : i)}
              />
            ))}
          </div>
        </section>

        <section className="skills section-frame" aria-label="Skills">
          <h2>Skills</h2>
          <div className="skills-grid">
            {skills.map((group) => (
              <section className="skills-group" key={group.label} aria-labelledby={`skills-${group.label.toLowerCase()}`}>
                <h3 id={`skills-${group.label.toLowerCase()}`}>
                  {group.label}
                </h3>
                <div className="skill-chips chip-stamp" ref={skillsStamp}>
                  {group.items.map((item) => (
                    <span className="skill-chip" key={item}>
                      <span className="skill-chip__icon" aria-hidden="true"><SkillIcon name={item} /></span>
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="toolkit section-frame" aria-label="Current toolkit">
          <h2>Toolkit</h2>
          <div className="toolkit-chips chip-stamp" ref={toolkitStamp}>
            {toolkit.split(" · ").map((tool) => (
              <span className="tool-chip" key={tool}>
                <span className="tool-chip__icon" aria-hidden="true"><SkillIcon name={tool} /></span>
                {tool}
              </span>
            ))}
          </div>
        </section>

        <OutsideOfWork />

        <footer className={`site-footer section-frame ${revealContact.revealClass}`} ref={revealContact.ref} id="contact">
          <HireForm />

          <div className="contact-links">
            <h3 className="contact-links__title">reach out to me at</h3>
            <div className="skill-chips">
              {contactLinks.map((link) => (
                <a className="skill-chip" href={link.href} target="_blank" rel="noreferrer" key={link.label}>
                  <span className="skill-chip__icon" aria-hidden="true"><SocialIcon name={link.label} /></span>
                  {link.label}
                  <span className="sr-only">: {link.note} (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>

          <p className="footer-meta">
            <LocalClock /> · <span className="footer-keys">t theme · w/a/e/c sections · ← → images</span>
          </p>
          <p className="footer-meta">© 2026 Prathamesh · <a href="#top">top ↑</a></p>
        </footer>
      </main>
      </div>
    </>
  );
}

export default App;
