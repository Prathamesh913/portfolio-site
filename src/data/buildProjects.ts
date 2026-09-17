import type { BuildProject } from "./types";

const story = (body: string) => [{ kind: "text" as const, eyebrow: "Notes", body }];

export const buildProjects: BuildProject[] = [
  {
    slug: "cineprint",
    title: "CinePrint",
    tagline: "Alternative movie posters, film art, and vintage ticket prints.",
    cardSummary:
      "A digital gallery for alternative movie posters and vintage film art, with dynamic discovery, cinematic browsing, and a canvas-based ticket generator.",
    description:
      "A premium digital gallery celebrating custom alternative movie posters and minimalist film art by independent designers. Dynamic search and filtering by title, artist, style, decade, and genre, a cinematic lightbox, and a canvas-based vintage ticket generator — with Notion as the CMS.",
    status: "live",
    year: "2026",
    cover: { src: "/media/build/cineprint-cover.png", alt: "CinePrint project cover", aspectRatio: "16 / 9" },
    gallery: [],
    story: story("The making notes and project story will be documented here once ready."),
    technologies: ["React", "TypeScript", "Tailwind CSS", "Notion API"],
    liveUrl: "https://cineprint.click/",
    repositoryUrl: "https://github.com/Prathamesh913/cine-print-gallery",
    isPlaceholder: false,
  },
  {
    slug: "gamedock",
    title: "GameDock",
    tagline: "An Omarchy-native bar plugin that unifies games from Steam, Heroic, RetroArch, and RPCS3 into one compact dashboard.",
    cardSummary:
      "An Omarchy-native game launcher that brings multiple game libraries into one compact desktop experience.",
    description:
      "Search, filter, sort, favorite, and launch games directly — without opening a launcher UI first. Self-contained Quickshell/QML plugin that follows the Omarchy visual and theming system.",
    status: "live",
    version: "v0.1.0",
    openSource: true,
    year: "2026",
    cover: { src: "/media/case-studies/gamedock/01-product-preview.png", alt: "GameDock panel preview", aspectRatio: "16 / 9" },
    gallery: [],
    story: story("The making notes and project story will be documented here once ready."),
    technologies: ["Quickshell / QML", "JavaScript", "Python 3 (stdlib)"],
    repositoryUrl: "https://github.com/Prathamesh913/gamedock",
    marketplaceUrl: "https://plugins.omarchy.org/plugin.html?id=io.github.prathamesh913.gamedock",
    isPlaceholder: false,
  },
  {
    slug: "projectdock",
    title: "ProjectDock",
    tagline: "A fast, keyboard-first project launcher for Omarchy and Hyprland.",
    cardSummary:
      "A fast, keyboard-first project launcher: jump into any project and run dev tasks without leaving the keyboard.",
    description:
      "Answers one question: what do I want to work on right now? Press SUPER+D, type a few characters, and projects filter instantly — open in your editor or run dev servers, tests, builds, and Git actions without leaving the keyboard. Auto-detects project types, with Hyprland workspace awareness.",
    status: "in progress",
    year: "2026",
    cover: { src: "/media/build/projectdock-cover.png", alt: "ProjectDock project cover", aspectRatio: "16 / 9" },
    gallery: [],
    story: story("The making notes and product details will be documented here."),
    technologies: ["Python (stdlib)", "GTK 4", "Hyprland"],
    repositoryUrl: "https://github.com/Prathamesh913/ProjectDock",
    isPlaceholder: true,
  },
  {
    slug: "codeatlas",
    title: "CodeAtlas",
    tagline: "Maps of software projects for developers and AI coding agents.",
    cardSummary:
      "Maps a codebase so developers and AI agents can find where behavior lives and how it connects.",
    description: "Looks at a software project and maps what it does, where that behavior lives, and how the important parts connect — so developers and AI agents find the right code faster. Reads read-only and writes one .codeatlas/ directory of machine-readable data plus readable docs, preserving uncertainty instead of guessing. Private beta, v0.5.0.",
    status: "active beta",
    year: "2026",
    cover: { src: "/media/build/codeatlas-cover.png", alt: "CodeAtlas project cover", aspectRatio: "16 / 9" },
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
    cardSummary:
      "Paper-like and e-ink-inspired display modes applied to the whole desktop as real-time GPU shaders.",
    description:
      "Real-time GPU shaders for the entire display — grayscale, warm paper tones, and high-contrast e-ink effects. Toggle with one click from the bar widget, a preset menu, keyboard shortcuts, or the command line.",
    status: "live",
    year: "2026",
    cover: { src: "/media/build/papermode-cover.png", alt: "Paper Mode project cover", aspectRatio: "16 / 9" },
    gallery: [],
    story: story("Applies Hyprland screen shaders as a GPU post-processing pass, with no extra runtime. Three presets — grayscale, paper, e-ink — controlled from the bar widget, a right-click preset menu, keyboard shortcuts, or omarchy-shell IPC."),
    technologies: ["Quickshell / QML", "Hyprland screen shaders", "omarchy-shell IPC"],
    repositoryUrl: "https://github.com/Prathamesh913/paper-mode",
    marketplaceUrl: "https://plugins.omarchy.org/plugin.html?id=io.github.prathamesh913.paper-mode",
    isPlaceholder: false,
  },
];
