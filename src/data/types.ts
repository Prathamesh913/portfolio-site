export type MediaKind = "image" | "video" | "gif";

export type MediaAsset = {
  src: string;
  alt: string;
  kind?: MediaKind;
  aspectRatio?: string;
  fit?: "cover" | "contain";
};

export type ContentBlock =
  | { kind: "text"; eyebrow?: string; heading?: string; body: string }
  | { kind: "image"; media: MediaAsset; caption?: string }
  | { kind: "gallery"; media: MediaAsset[]; caption?: string }
  | { kind: "quote"; body: string; attribution?: string }
  | { kind: "workflow"; heading: string; steps: string[] };

export type DesignProject = {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  description: string;
  role: string;
  scope: string[];
  tools: string[];
  timeline: string;
  cover: MediaAsset;
  gallery: MediaAsset[];
  content: ContentBlock[];
  featured?: boolean;
  isPlaceholder: boolean;
};

export type BuildStatus = "exploring" | "in progress" | "shipped" | "paused" | "active beta" | "live";

export type BuildProject = {
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  status: BuildStatus;
  version?: string;
  year?: string;
  cover: MediaAsset;
  gallery: MediaAsset[];
  story: ContentBlock[];
  technologies: string[];
  liveUrl?: string;
  repositoryUrl?: string;
  isPlaceholder: boolean;
};

export type ExploreType = "interface" | "system" | "experiment" | "concept" | "prototype";

export type ExploreItem = {
  slug: string;
  title: string;
  type: ExploreType;
  media: MediaAsset;
  description: string;
  date: string;
  tags: string[];
  url?: string;
  specimenId?: string;
  isPlaceholder: boolean;
};

// External blog post (Medium). Content is mirrored from the source pages —
// missing fields are omitted, never invented.
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) from article:published_time on the source page. */
  date: string;
  /** Verified reading time in minutes, as shown on the Medium article page. */
  readingTime?: number;
  /** Medium topic tags, as published. */
  tags: string[];
  /** Canonical Medium URL. */
  url: string;
  /** Actual article cover image recovered from the source page. Alt is empty because the visible title sits directly beside it. */
  image?: { src: string; alt: string };
  /** Series id, resolved through blogSeries. */
  series?: string;
  /** 1-based position within its series (publication order). */
  seriesOrder?: number;
};

export type NowSnapshot = {
  updatedAt: string;
  designing: string;
  building: string;
  exploring: string;
  reading?: string;
  location?: string;
  statusBadge?: string;
  note: string;
};

