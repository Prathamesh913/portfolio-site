import { useEffect, useRef } from "react";
import type { CaseStudy } from "../data/caseStudies";
import { CASE_ORDER, allCaseStudies } from "../data/caseStudies";
import { ThemeToggle } from "./ThemeToggle";

function getRelated(slug: string): { prev?: CaseStudy; next?: CaseStudy } {
  const i = CASE_ORDER.indexOf(slug);
  if (i === -1) return {};
  const bySlug = Object.fromEntries(allCaseStudies.map((c) => [c.slug, c]));
  return {
    prev: i > 0 ? bySlug[CASE_ORDER[i - 1]] : undefined,
    next: i < CASE_ORDER.length - 1 ? bySlug[CASE_ORDER[i + 1]] : undefined,
  };
}

function isLandscapeGallery(gallery: CaseStudy["galleries"][number]): boolean {
  const first = gallery.screens[0];
  return !!first && !!first.w && !!first.h && first.w >= first.h;
}

export function CaseStudyPage({ data }: { data: CaseStudy }) {
  const { prev, next } = getRelated(data.slug);
  const hasFacts = data.role || data.scope.length > 0 || data.platform || data.status;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const galleriesHeading = data.kind === "exploration" ? "Gallery" : "Workflow galleries";

  // Hash-router navigation renders a new page without a document load, so
  // update the title and move focus to the heading on every project change.
  useEffect(() => {
    document.title = `${data.title} — Prathamesh`;
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [data.slug, data.title]);

  return (
    <div className="site-shell cs-page">
      <a className="skip-link" href="#cs-overview">Skip to overview</a>

      <header className="site-header">
        <a className="wordmark" href="#/" aria-label="Back to Prathamesh home">← prathamesh</a>
        <div className="site-header__group">
          <nav className="site-nav" aria-label="Secondary navigation">
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" aria-label={`View original ${data.title} project (opens in new tab)`}>original ↗</a>
            {data.marketplaceUrl && (
              <a href={data.marketplaceUrl} target="_blank" rel="noreferrer" aria-label={`View ${data.title} on the Omarchy marketplace (opens in new tab)`}>marketplace ↗</a>
            )}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className="cs">
        <header className="cs-header section-frame">
          <p className="cs-kicker">{data.kind === "exploration" ? "Design exploration" : "Case study"}</p>
          <h1 ref={headingRef} tabIndex={-1}>{data.title}</h1>
          <p className="cs-meta">{data.company} · {data.year}</p>
          <p className="cs-summary">{data.summary}</p>
          {hasFacts && (
            <dl className="cs-facts">
              {data.role && <div><dt>Role</dt><dd>{data.role}</dd></div>}
              {data.scope.length > 0 && <div><dt>Scope</dt><dd>{data.scope.join(" · ")}</dd></div>}
              {data.platform && <div><dt>Platform</dt><dd>{data.platform}</dd></div>}
              {data.status && <div><dt>Status</dt><dd>{data.status}</dd></div>}
            </dl>
          )}
        </header>

        <section className="cs-section section-frame" id="cs-overview" tabIndex={-1}>
          <h2>Overview</h2>
          {data.overview.map((p, i) => <p key={i}>{p}</p>)}
        </section>

        {data.sections.map((section) => (
          <section className="cs-section section-frame" key={section.id} id={`cs-${section.id}`}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}

        {data.galleries.length > 0 && (
          <section className="cs-galleries section-frame" aria-labelledby="cs-galleries-heading">
            <h2 id="cs-galleries-heading">{galleriesHeading}</h2>
            {data.galleriesIntro && <p className="cs-galleries-intro">{data.galleriesIntro}</p>}
            {data.galleries.map((gallery) => (
              <div className="cs-gallery" key={gallery.id} id={`cs-gallery-${gallery.id}`}>
                <h3>{gallery.title}</h3>
                {gallery.intro && <p className="cs-gallery-intro">{gallery.intro}</p>}
                <div
                  className={`cs-screens${isLandscapeGallery(gallery) ? " cs-screens--landscape" : " cs-screens--portrait"}`}
                  role="list"
                  tabIndex={0}
                  aria-label={`${gallery.title}: scrollable image gallery, ${gallery.screens.length} images`}
                >
                  {gallery.screens.map((s) => (
                    <figure className="cs-screen" role="listitem" key={s.src}>
                      <img src={s.src} alt={s.alt} loading="lazy" decoding="async" width={s.w} height={s.h} />
                      <figcaption>
                        <span className="cs-screen-name">{s.alt}</span>
                        {s.caption && s.caption !== s.alt && s.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ))}
            {data.omittedNote && (
              <div className="cs-omitted">
                <p>{data.omittedNote.intro}</p>
                <ul>
                  {data.omittedNote.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {data.reflection.length > 0 && (
          <section className="cs-section section-frame" aria-labelledby="cs-reflection-heading">
            <h2 id="cs-reflection-heading">Reflection</h2>
            {data.reflection.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        )}

        <nav className="cs-related section-frame" aria-label="More projects">
          {prev ? (
            <a href={`#/work/${prev.slug}`} aria-label={`Previous project: ${prev.title}`}>
              <span className="cs-related__dir" aria-hidden="true">Previous</span>
              <span className="cs-related__title" aria-hidden="true">{prev.title}</span>
            </a>
          ) : <span />}
          {next ? (
            <a href={`#/work/${next.slug}`} aria-label={`Next project: ${next.title}`}>
              <span className="cs-related__dir" aria-hidden="true">Next</span>
              <span className="cs-related__title" aria-hidden="true">{next.title}</span>
            </a>
          ) : <span />}
        </nav>

        <footer className="site-footer section-frame">
          <p>
            <a href="#/">← back to work</a>
            {" · "}
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" aria-label={`View original ${data.title} project (opens in new tab)`}>view original ↗</a>
            {data.marketplaceUrl && (
              <>
                {" · "}
                <a href={data.marketplaceUrl} target="_blank" rel="noreferrer" aria-label={`View ${data.title} on the Omarchy marketplace (opens in new tab)`}>marketplace ↗</a>
              </>
            )}
          </p>
        </footer>
      </main>
    </div>
  );
}
