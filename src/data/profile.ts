export type ExperienceItem = {
  role: string;
  org: string;
  period: string;
  /** Primary outcome-oriented highlights. Wrap a metric in `**…**` to emphasize it. */
  highlights: string[];
  /** Compact supporting line, rendered quieter than the highlights. */
  supporting?: string;
};

export type SkillsGroup = {
  label: string;
  items: string[];
};

export const experience: ExperienceItem[] = [
  {
    role: "User Interface Designer",
    org: "Jio Platforms Limited",
    period: "Dec 2023 – Present",
    highlights: [
      "Designed and optimized Corporate Travel for an HR platform serving **400,000+ employees**, enabling live flight and hotel bookings.",
      "Designed and delivered a Checklist Management module from scratch, scaling execution across **180 food courts** and **7,483 facilities** while driving compliance adherence from **50% to over 80%**.",
      "Led the end-to-end UX process for a Project Management module for construction projects, establishing a fully digitized workflow for templatized execution and real-time operational tracking.",
      "Designed a Feedback Management System for post-trip employee feedback, providing leadership with real-time operational visibility into travel service quality.",
    ],
    supporting:
      "Additional contributions: Authored PRDs and application data models, collaborated with engineering through Azure DevOps, and mentored designers on Figma, design systems, and UI/UX practices.",
  },
  {
    role: "UI/UX Designer",
    org: "Secoraa",
    period: "Mar 2023 – Nov 2023",
    highlights: [
      "Architected a scalable sales-enablement mobile application for insurance agents, integrating real-time policy verification into the purchasing workflow.",
      "Designed a client-facing service request management portal with tracking, automated notifications, and role-based access control.",
      "Led a website redesign and contributed to a mutual fund investment and portfolio management app, improving information architecture and simplifying complex financial workflows.",
    ],
  },
  {
    role: "Technical Head & Web Developer",
    org: "AmbiTech Healthcare",
    period: "Sep 2021 – Mar 2022",
    highlights: [
      "Designed a glucometer companion app and developed an inventory management web portal for healthcare operations.",
    ],
  },
];

export const skills: SkillsGroup[] = [
  {
    label: "Design",
    items: [
      "Interface design",
      "Information architecture",
      "Interaction design",
      "Workflow and state design",
      "Data-heavy and tabular interface design",
      "Design systems",
      "Prototyping and interaction studies",
    ],
  },
  {
    label: "Build",
    items: ["Web interfaces", "Small desktop tools", "Interactive prototypes", "Linux desktop integration"],
  },
  {
    label: "Product",
    items: ["Complex workflows", "Enterprise software", "Design-to-development collaboration"],
  },
  {
    label: "Workflow",
    items: ["Figma", "Product requirement documents", "Data modelling", "Agile delivery"],
  },
];

export const toolkit = "Figma · Zed · Git · GitHub · Linux · Hyprland";

export const outside = {
  heading: "Outside the screen",
  body: "I spend time exploring interface design and typography, experimenting with Linux desktop workflows, and collecting ideas from film and visual culture.",
};
