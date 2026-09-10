import type { BuildProject } from "./types";

const placeholderMedia = (name: string, alt: string, aspectRatio = "4 / 3") => ({
  src: `/media/placeholder/${name}.webp`,
  alt,
  aspectRatio,
});

const story = (body: string) => [{ kind: "text" as const, eyebrow: "Notes", body }];

export const buildProjects: BuildProject[] = [
  {
    slug: "cineprint",
    title: "CinePrint",
    tagline: "Save cinema stills and order them into sequences.",
    description:
      "A small web app for studying framing. Save stills, arrange them into sequences, and compare shots side by side.",
    status: "live",
    year: "2026",
    cover: { src: "/media/build/cineprint-cover.png", alt: "CinePrint project cover", aspectRatio: "16 / 9" },
    gallery: [],
    story: story("The making notes and project story will be documented here once ready."),
    technologies: ["To be updated"],
    liveUrl: "https://cineprint.click/",
    repositoryUrl: "https://github.com/Prathamesh913/cine-print-gallery",
    isPlaceholder: false,
  },
  {
    slug: "projectdock",
    title: "ProjectDock",
    tagline: "Active files, references, and notes one keystroke away.",
    description:
      "A lightweight dock for creative work. Keeps the current project's files and scratch notes at hand without cluttering tabs. In active development.",
    status: "in progress",
    year: "2026",
    cover: placeholderMedia("projectdock-cover", "Placeholder ProjectDock visual", "4 / 3"),
    gallery: [],
    story: story("The making notes and product details will be documented here."),
    technologies: ["To be updated"],
    repositoryUrl: "https://github.com/Prathamesh913/ProjectDock",
    isPlaceholder: true,
  },
  {
    slug: "codeatlas",
    title: "CodeAtlas",
    tagline: "A navigation utility for software projects.",
    description: "Helps move through project files and structure. In active development; not publicly released.",
    status: "in progress",
    year: "2026",
    cover: placeholderMedia("codeatlas-cover", "Placeholder CodeAtlas visual", "4 / 3"),
    gallery: [],
    story: story("Details will be documented here."),
    technologies: ["To be updated"],
    repositoryUrl: "https://github.com/Prathamesh913/codeatlas",
    isPlaceholder: true,
  },
  {
    slug: "paper-mode",
    title: "Paper Mode",
    tagline: "Paper-like and e-ink-inspired display modes for Omarchy.",
    description:
      "Real-time GPU shaders for the entire display — grayscale, warm paper tones, and high-contrast e-ink effects. Toggle with one click from the bar widget, a preset menu, keyboard shortcuts, or the command line.",
    status: "live",
    year: "2026",
    cover: placeholderMedia("paper-mode-cover", "Placeholder Paper Mode visual", "4 / 3"),
    gallery: [],
    story: story("Applies Hyprland screen shaders as a GPU post-processing pass, with no extra runtime. Three presets — grayscale, paper, e-ink — controlled from the bar widget, a right-click preset menu, keyboard shortcuts, or omarchy-shell IPC."),
    technologies: ["Quickshell / QML", "Hyprland screen shaders", "omarchy-shell IPC"],
    repositoryUrl: "https://github.com/Prathamesh913/paper-mode",
    marketplaceUrl: "https://plugins.omarchy.org/plugin.html?id=io.github.prathamesh913.paper-mode",
    isPlaceholder: false,
  },
];
