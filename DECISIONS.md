# D001 — Portfolio Architecture

Date: 2026-08-19

Decision: Organise the portfolio around four practice worlds: DESIGN, BUILD, EXPLORE, and NOW. NOW is primarily a homepage snapshot rather than a mandatory standalone page.

Reason: The portfolio should represent how the work is practiced, not flatten every piece into the same case-study archive.

Alternatives Considered: A conventional projects/about/contact hierarchy; separate top-level pages for every section.

Status: Accepted

# D002 — Frontend Stack

Date: 2026-08-19

Decision: Use React 19, TypeScript, and Vite with plain CSS.

Reason: This is a clean, maintainable, static-host friendly foundation with enough flexibility for progressive disclosure, media viewing, and subtle interactions. Avoiding a UI library keeps the visual identity specific to the portfolio.

Alternatives Considered: Astro with React islands; Next.js; a CSS framework.

Status: Accepted

# D003 — Content Architecture

Date: 2026-08-19

Decision: Keep portfolio content in typed modules under `src/data/`, with separate collections for DESIGN, BUILD, EXPLORE, and NOW.

Reason: Placeholder content can be replaced without redesigning the site or editing presentation components. TypeScript makes the replacement contract visible while the content is still local and easy to edit.

Alternatives Considered: Hardcoded JSX; a headless CMS; Markdown-only content.

Status: Accepted

# D004 — Flexible Project Stories

Date: 2026-08-19

Decision: Model project storytelling as discriminated content blocks instead of a fixed sequence of UX case-study sections.

Reason: Different work deserves different visual stories. Blocks support text, raw media, galleries, quotes, and workflows while preserving a coherent rendering system.

Alternatives Considered: One rigid `Problem / Process / Solution / Outcome` schema; page-specific JSX for every project.

Status: Accepted

# D005 — Homepage Visual Language

Date: 2026-08-19

Decision: Use a warm paper ground, near-black ink, one acid-lime signal color, occasional project-specific solid colors, Newsreader for display typography, and DM Sans/DM Mono for interface and metadata text.

Reason: This creates an editorial, personal, typography-led environment with enough contrast for product visuals while avoiding the visual language of generic SaaS or template portfolios.

Alternatives Considered: A white/black-only system; a broad accent palette; a single sans-serif family.

Status: Accepted

# D006 — Homepage Sequence

Date: 2026-08-19

Decision: Structure the homepage as distinct moments: opening, NOW, DESIGN, an editorial transition, BUILD, EXPLORE, and a concise closing.

Reason: The portfolio is an evolving creative practice, not a set of equal project categories. The sequence gives professional product work the most weight while allowing independent work and experiments to change pace.

Alternatives Considered: Four equal stacked sections; a conventional hero / project grid / contact layout.

Status: Accepted

# D007 — Media Presentation

Date: 2026-08-19

Decision: Present media as raw responsive surfaces with preserved aspect ratios, not as a collection of device or browser mockups. Until real assets exist, each data record gets a restrained project-specific placeholder canvas with an image layer ready to replace it.

Reason: The work should feel like product design itself, and the brief explicitly discourages fake frames. The fallback keeps the homepage art-directed without inventing real project screenshots or metrics.

Alternatives Considered: Generic stock imagery; a browser/device frame for every project; empty image boxes.

Status: Accepted

# D008 — Motion And Responsive Behavior

Date: 2026-08-19

Decision: Use a small opening reveal, smooth anchor continuity, and restrained link feedback. Desktop uses asymmetrical editorial compositions; mobile changes order and density rather than only stacking desktop columns. All motion has a reduced-motion override.

Reason: Motion should create continuity without becoming spectacle, and the homepage’s personality should remain intact at touch sizes.

Alternatives Considered: Scroll-triggered animation on every section; parallax; an experimental mobile navigation pattern.

Status: Accepted

# D009 — Signal-Only Accent Discipline

Date: 2026-08-21

Decision: Acid-lime is strictly reserved for meaningful functional signals: the NOW live pulse beacon, active navigation and status pills (e.g. `active beta`, `in progress`), focus states, and interactive live nodes. It is prohibited as a general decorative text or border color.

Reason: Accent colors lose communicative value when used decoratively. Reserving the acid-lime color for live state and intentional signals gives it authority and clarity.

Alternatives Considered: Using acid-lime on display headlines, blockquote highlights, and decorative dividing rules.

Status: Accepted

# D010 — Differentiated Practice Worlds (Design, Build, Explore)

Date: 2026-08-21

Decision: Differentiate the three main practice areas by compositional character, density, and energy while keeping typography and grounding palette unified. DESIGN emphasizes precision, architectural flows, and structured scope; BUILD presents independent maker products (CinePrint & Project Dock) with monograms, version badges, tech stacks, and maker notes; EXPLORE acts as an archival specimen cabinet with specimen IDs, catalog tags, and open-ended lab studies.

Reason: A portfolio of a multifaceted practitioner should not flatten independent tools and experimental fragments into standard client case-study templates.

Alternatives Considered: Three separate disjointed visual themes; identical repeating card grids across all sections.

Status: Accepted

# D011 — Animated ASCII Backdrop

Date: 2026-10-20

Decision: Replace the tiled प्र watermark with ASCII Magic's Sine Plasma piece (MIT), drawn cover-fit on one full-viewport canvas and re-tinted at runtime toward the brand orange. The 88×30 frame plays at 15fps and 0.6× speed, paused when hidden; the field fades to a still frame under reduced motion and drops to a whisper in the light theme. A soft scrim over the reading column keeps long-form copy off the busiest part of the field; on the light theme the block glyphs become a halftone dot ramp in a brighter peach palette, so the field reads as print rather than a woven grid.

Reason: The plasma gives the page a living technical texture without requiring a custom simulation, and re-tinting its rainbow palette around --primary keeps the stock piece inside this portfolio's colour system. Loading the piece as an ES module rather than their CDN element keeps the asset self-hosted, typed, and controllable.

Alternatives Considered: A bespoke ASCII contour field; the rainbow original; matrix rain or flow field; keeping the प्र dot grid.

Status: Accepted

