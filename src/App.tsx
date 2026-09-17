import { useEffect, useState, type ReactNode } from "react";
import { blogPosts, blogSeries, buildProjects, experience, galleryItems, now, skills, toolkit } from "./data";
import type { BlogPost, GalleryItem } from "./data";
import { allCaseStudies, CASE_ORDER } from "./data/caseStudies";
import type { CaseStudy } from "./data/caseStudies";
import { CaseStudyPage } from "./components/CaseStudyPage";
import { CurrentlySection } from "./components/CurrentlySection";
import { GithubActivity } from "./components/GithubActivity";
import { ImageLightbox, useImageLightbox } from "./components/ImageLightbox";
import { OutsideOfWork } from "./components/OutsideOfWork";
import { SkillIcon } from "./components/SkillIcons";
import { SiteHeader } from "./components/SiteHeader";

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

/** Render `**metric**` spans as emphasized, non-color-only text. */
function renderEmphasis(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong className="exp-metric" key={i}>{part.slice(2, -2)}</strong>
      : part
  );
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
      <p className="gallery-note">Scroll sideways; select any image for a larger view.</p>
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

      <SiteHeader
        wordmarkHref="#top"
        wordmarkLabel="Prathamesh home"
        wordmarkText="prathamesh"
        navLabel="Primary navigation"
      >
        <a href="#work" className={activeSection === "work" ? "is-active" : ""}>work</a>
        <a href="#archive" className={activeSection === "archive" ? "is-active" : ""}>archive</a>
        <a href="#about" className={activeSection === "about" ? "is-active" : ""}>about</a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">github</a>
        <a href="#contact" className={activeSection === "contact" ? "is-active" : ""}>contact</a>
      </SiteHeader>

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
                    {cs.sourceUrl.includes("github.com") && (
                      <a href={cs.sourceUrl} target="_blank" rel="noreferrer">
                        GitHub ↗<span className="sr-only">: {cs.title} repository (opens in a new tab)</span>
                      </a>
                    )}
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

          <h3 className="work-group-label">Maker tools</h3>
          <div className="collections-strip" role="list" tabIndex={0} aria-label={`Maker tools: scrollable list, ${toolProjects.length} tools`}>
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
                  <ul className="exp-highlights">
                    {job.highlights.map((highlight) => (
                      <li key={highlight}>{renderEmphasis(highlight)}</li>
                    ))}
                  </ul>
                  {job.supporting && <p className="exp-supporting">{renderEmphasis(job.supporting)}</p>}
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

        <OutsideOfWork />

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
