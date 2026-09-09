export type ExperienceItem = {
  role: string;
  org: string;
  period: string;
  description: string;
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
    description:
      "Enterprise HR-platform modules: corporate travel, feedback management, checklist management, and project management. Complex workflows, operational dashboards, and data-heavy interfaces, built with engineering teams.",
  },
  {
    role: "UI/UX Designer",
    org: "Secoraa",
    period: "Mar 2023 – Nov 2023",
    description:
      "Mobile and web products for insurance, service requests, and mutual-fund investment workflows. Information architecture, role-based flows, verification logic, and client-facing interfaces.",
  },
  {
    role: "Technical Head and Web Developer",
    org: "AmbiTech Healthcare",
    period: "Sep 2021 – Mar 2022",
    description: "Designed a glucometer companion app and developed an inventory management web portal.",
  },
  {
    role: "Independent Builder",
    org: "Self-directed",
    period: "2024 – Present",
    description: "Personal software projects, desktop tools, web products, and developer utilities alongside design work.",
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
