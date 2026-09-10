import { useEffect, useRef, useState } from "react";
import { blogPosts, blogSeries, buildProjects, experience, galleryItems, now, outside, skills, toolkit } from "./data";
import type { BlogPost, GalleryItem } from "./data";
import { allCaseStudies, CASE_ORDER } from "./data/caseStudies";
import type { CaseStudy } from "./data/caseStudies";
import { CaseStudyPage } from "./components/CaseStudyPage";
import { CurrentlySection } from "./components/CurrentlySection";
import { GithubActivity } from "./components/GithubActivity";
import { SkillIcon } from "./components/SkillIcons";
import { ThemeToggle } from "./components/ThemeToggle";

const GITHUB_URL = "https://github.com/Prathamesh913";

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

type ArchiveView = "gallery" | "blogs";

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

function GalleryLightbox({ items, index, onClose, onNavigate }: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = items[index];
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); onNavigate((index + 1) % items.length); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); onNavigate((index - 1 + items.length) % items.length); }
      else if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])")
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, items.length, onClose, onNavigate]);

  return (
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-labelledby="gallery-lightbox-title" onClick={onClose}>
      <div className="gallery-lightbox__panel" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <div className="gallery-lightbox__bar">
          <p className="gallery-lightbox__count">{index + 1} / {items.length}</p>
          <button type="button" className="gallery-lightbox__btn" onClick={onClose} aria-label="Close larger view">Close ✕</button>
        </div>
        <img
          className="gallery-lightbox__img"
          src={item.image.src}
          alt=""
          width={item.image.w}
          height={item.image.h}
          decoding="async"
        />
        <h3 className="gallery-lightbox__title" id="gallery-lightbox-title">{item.title}</h3>
        <p className="gallery-lightbox__meta">{galleryMeta(item)}</p>
        {item.description && <p className="gallery-lightbox__desc">{item.description}</p>}
        {item.points && item.points.length > 0 && (
          <dl className="gallery-lightbox__points">
            {item.points.map((point) => (
              <div key={point.label}>
                <dt>{point.label}</dt>
                <dd>{point.text}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="gallery-lightbox__nav">
          <button type="button" className="gallery-lightbox__btn" onClick={() => onNavigate((index - 1 + items.length) % items.length)} aria-label={`Previous: ${items[(index - 1 + items.length) % items.length].title}`}>← Prev</button>
          <button type="button" className="gallery-lightbox__btn" onClick={() => onNavigate((index + 1) % items.length)} aria-label={`Next: ${items[(index + 1) % items.length].title}`}>Next →</button>
        </div>
      </div>
    </div>
  );
}

function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openAt = (index: number) => setLightboxIndex(index);
  const close = () => {
    if (lightboxIndex === null) return;
    const id = galleryItems[lightboxIndex].id;
    setLightboxIndex(null);
    requestAnimationFrame(() => {
      document.getElementById(`gallery-thumb-${id}`)?.focus();
    });
  };

  return (
    <div>
      <p className="gallery-note">UI screenshots from the earlier portfolio, preserved with their original titles. Scroll sideways; select any image for a larger view.</p>
      <div className="gallery-strip" role="list" tabIndex={0} aria-label={`Gallery: scrollable list, ${galleryItems.length} UI screenshots`}>
        {galleryItems.map((item, i) => (
          <figure className="gallery-card" role="listitem" key={item.id}>
            <button
              type="button"
              id={`gallery-thumb-${item.id}`}
              className="gallery-thumb"
              aria-haspopup="dialog"
              aria-label={`Open larger view: ${item.title}`}
              onClick={() => openAt(i)}
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
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={galleryItems}
          index={lightboxIndex}
          onClose={close}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

function App() {
  const caseProjects = CASE_ORDER.map((slug) => caseStudies[slug]).filter((c): c is CaseStudy => !!c);
  const toolProjects = buildProjects;
  const [activeSection, setActiveSection] = useState<string>("top");
  const [caseSlug, setCaseSlug] = useState<string | null>(getCaseSlug());
  const [archiveView, setArchiveView] = useState<ArchiveView>(getArchiveView);

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
    const ids = ["work", "archive", "about", "contact"];
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
    return <CaseStudyPage data={caseStudies[caseSlug]} />;
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#work">Skip to work</a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Prathamesh home">prathamesh</a>
        <div className="site-header__group">
          <nav className="site-nav" aria-label="Primary navigation">
            <a href="#work" className={activeSection === "work" ? "is-active" : ""}>work</a>
            <a href="#archive" className={activeSection === "archive" ? "is-active" : ""}>archive</a>
            <a href="#about" className={activeSection === "about" ? "is-active" : ""}>about</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">github</a>
            <a href="#contact" className={activeSection === "contact" ? "is-active" : ""}>contact</a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content">
        <section className="intro section-frame" id="top">
          <h1>Prathamesh</h1>
          <p>I design interfaces for operational software and build small tools.</p>
          <p className="intro-meta">{now.location} — {now.statusBadge?.toLowerCase()}.</p>
        </section>

        <section className="now section-frame" aria-label="Now">
          <div className="now-ticker">
            <p className="now-ticker__label"><span className="now-dot" aria-hidden="true">●</span> Now · {now.updatedAt}</p>
            <div className="now-ticker__viewport">
              <div className="now-ticker__track">
                {[
                  `Building: ${now.building}`,
                  `Designing: ${now.designing}`,
                  "Improving: current craft focus",
                  now.reading ? `Learning: ${now.reading.charAt(0).toLowerCase() + now.reading.slice(1)}` : "",
                ].filter(Boolean).map((text) => (
                  <span className="now-ticker__item" key={text}>
                    <span aria-hidden="true" className="now-ticker__sep">◆</span> {text}
                  </span>
                ))}
                {[
                  `Building: ${now.building}`,
                  `Designing: ${now.designing}`,
                  "Improving: current craft focus",
                  now.reading ? `Learning: ${now.reading.charAt(0).toLowerCase() + now.reading.slice(1)}` : "",
                ].filter(Boolean).map((text) => (
                  <span className="now-ticker__item" key={`dup-${text}`} aria-hidden="true">
                    <span aria-hidden="true" className="now-ticker__sep">◆</span> {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <CurrentlySection />

        <GithubActivity />

        <section className="work section-frame" id="work" aria-label="Work">
          <h2>Work</h2>

          <div className="collections-strip" role="list" tabIndex={0} aria-label={`Case studies: scrollable list, ${caseProjects.length} projects`}>
            {caseProjects.map((cs) => {
              const preview = cs.galleries[0]?.screens[0];
              const kindLabel = cs.kind === "exploration" ? "Exploration" : "Case study";
              return (
                <article className="coll-card coll-card--project" role="listitem" key={cs.slug} id={cs.slug}>
                  {preview && <img className="coll-cover coll-project-cover" src={preview.src} alt="" loading="lazy" decoding="async" width={preview.w} height={preview.h} />}
                  <h3 className="coll-title"><a className="work-title-link" href={`#/work/${cs.slug}`}>{cs.title}</a></h3>
                  <p className="coll-meta">{kindLabel} · {cs.year}</p>
                  <p className="coll-desc">{cs.summary}</p>
                </article>
              );
            })}
          </div>

          <h3 className="work-group-label">Maker tools</h3>
          <div className="collections-strip" role="list" tabIndex={0} aria-label={`Maker tools: scrollable list, ${toolProjects.length} tools`}>
            {toolProjects.map((project) => (
              <article className="coll-card" role="listitem" key={project.slug} id={project.slug}>
                <h3 className="coll-title">{project.title}</h3>
                <p className="coll-meta">
                  tool · {project.status === "live"
                    ? (<><span className="live-dot">●</span> live</>)
                    : project.status}
                  {isNonEmpty(project.year) ? ` · ${project.year}` : ""}
                </p>
                <p className="coll-desc">{project.tagline} {project.description}</p>
                {project.liveUrl && (
                  <p className="coll-links">
                    <a className="btn-primary" href={project.liveUrl} target="_blank" rel="noreferrer">Visit ↗</a>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="collections section-frame" id="archive" aria-label="Archive">
          <div className="collections-head">
            <h2>Archive</h2>
            <div className="collections-toggle" role="group" aria-label="Switch between gallery and blogs">
              <button type="button" aria-pressed={archiveView === "gallery"} onClick={() => toggleArchiveView("gallery")}>Gallery</button>
              <button type="button" aria-pressed={archiveView === "blogs"} onClick={() => toggleArchiveView("blogs")}>Blogs</button>
            </div>
          </div>

          {archiveView === "gallery" ? (
            <GallerySection />
          ) : (
            <div>
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

        <div id="about" className="about-anchor" aria-hidden="true" />

        <section className="experience section-frame" aria-label="Experience">
          <h2>Experience</h2>
          <div className="exp-list">
            {experience.map((job, i) => (
              <article className="exp-row" key={`${job.org}-${job.period}`}>
                <span className="exp-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className="exp-row__main">
                  <div className="exp-row__head">
                    <h3>{job.role} <span className="exp-org">— {job.org}</span></h3>
                    <span className="exp-period">{job.period}</span>
                  </div>
                  <p>{job.description}</p>
                </div>
              </article>
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
                <div className="skill-chips">
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
          <div className="toolkit-chips">
            {toolkit.split(" · ").map((tool) => (
              <span className="tool-chip" key={tool}>
                <span className="tool-chip__icon" aria-hidden="true"><SkillIcon name={tool} /></span>
                {tool}
              </span>
            ))}
          </div>
        </section>

        <section className="outside section-frame" aria-label={outside.heading}>
          <h2>{outside.heading}</h2>
          <p>{outside.body}</p>
        </section>

        <footer className="site-footer section-frame" id="contact">
          <p>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">github</a>
            {" · "}
            <span className="email-note">Email available on request</span>
          </p>
          <p className="footer-meta">© 2026 Prathamesh · Updated {now.updatedAt} · <a href="#top">top ↑</a></p>
        </footer>
      </main>
    </div>
  );
}

export default App;
