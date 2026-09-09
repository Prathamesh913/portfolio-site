// Gallery — UI screenshots recovered from the original Framer portfolio.
// Sources:
// - Homepage Gallery section: https://prathameshdesigns.framer.website/
// - Collections page cards: https://prathameshdesigns.framer.website/collections
// Titles, types, years, device badges, descriptions, and point texts are
// preserved verbatim from the source page data. Original display order is
// kept via imageOrder. No project associations: neither source section
// carries card-to-case-study links, so no relatedProject values are set.
// Do not mix into caseStudies / CASE_ORDER.

export type GalleryImage = {
  src: string;
  alt: string;
  w: number;
  h: number;
};

export type GalleryPoint = {
  label: string;
  text: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  image: GalleryImage;
  type: string;
  year: string;
  /** Device badge from the homepage Gallery. Absent on collections cards. */
  device?: string;
  /** Card description from the collections page. Absent on homepage gallery items. */
  description?: string;
  imageOrder: number;
  sourceUrl: string;
  /** Info points from the homepage Gallery. Absent on collections cards. */
  points?: GalleryPoint[];
};

export const galleryItems: GalleryItem[] = [
  {
    id: "timeline",
    title: "Timeline",
    image: { src: "/media/gallery/01-timeline.png", alt: "Timeline", w: 2048, h: 1456 },
    type: "Social",
    year: "2025",
    device: "Web",
    imageOrder: 1,
    sourceUrl: "https://framerusercontent.com/images/w3ByKH3BFKH40RyXclRbdeiIWg.png",
    points: [
      { label: "The Objective", text: "To design a centralized \"Social Hub\" that fosters a culture of peer appreciation and streamlines access to organizational updates like training and surveys." },
      { label: "Design Logic", text: "Utilized a Card-Based Architecture and a persistent sidebar navigation to manage high information density (feed, events, and training) without overwhelming the user." },
      { label: "The Impact", text: "Adhered to a Standardized Component Library to ensure that widgets like \"Upcoming Events\" and \"Timeline Cards\" share a unified visual language and behavior." },
    ],
  },
  {
    id: "analytix-landing-page",
    title: "Analytix Landing Page",
    image: { src: "/media/gallery/02-analytix-landing-page.png", alt: "Analytix Landing Page", w: 2048, h: 1536 },
    type: "Landing Page",
    year: "2024",
    device: "Web",
    imageOrder: 2,
    sourceUrl: "https://framerusercontent.com/images/q0g1wtxpJ61HgbuZecseNl1Y.png",
    points: [
      { label: "The Objective", text: "To design a high-conversion entry point for a SaaS analytics platform, effectively communicating a \"Data-Driven Decisions, Simplified\" value proposition to drive free trial acquisitions." },
      { label: "Design Logic", text: "Implemented a \"Problem-Solution-Proof\" Sales Funnel layout. The page utilizes a Z-pattern in the hero section to lead the eye toward the CTA, followed by a modular grid that breaks down complex features into digestible visual cards. The design strategically places Visual Social Proof (client counts and testimonials) next to technical claims to build immediate user trust." },
      { label: "The Impact", text: "Optimized for Top-of-Funnel (ToF) conversion by offering a low-friction \"Free Trial\" entry point and clear, value-based pricing tiers (Basic, Pro, and Enterprise) that cater to diverse business scales." },
    ],
  },
  {
    id: "check-vehicle-details",
    title: "Check Vehicle Details",
    image: { src: "/media/gallery/03-check-vehicle-details.png", alt: "Check Vehicle Details", w: 2048, h: 1536 },
    type: "Cards",
    year: "2024",
    device: "Mobile",
    imageOrder: 3,
    sourceUrl: "https://framerusercontent.com/images/zWWWGAp6ciFGOPhiwwTzvoq2Sw.png",
    points: [
      { label: "The Objective", text: "To eliminate manual data entry friction for insurance agents by designing an automated vehicle verification flow that fetches complex technical specifications using only a registration number." },
      { label: "Design Logic", text: "Implemented a Validation Feedback Pattern featuring a \"Vehicle Found\" success state and a visual car thumbnail to provide immediate psychological reassurance that the correct asset is being insured. I included a clear \"Edit Details\" fallback to handle potential data discrepancies, maintaining user control throughout the automated process." },
      { label: "The Impact", text: "Successfully reduced the onboarding journey from a multi-field manual form to a single-input interaction, aimed at decreasing the \"Time-to-Quote\" and minimizing human error in technical policy documentation." },
    ],
  },
  {
    id: "survey-statistics",
    title: "Survey Statistics",
    image: { src: "/media/gallery/04-survey-statistics.png", alt: "Survey Statistics", w: 2048, h: 1456 },
    type: "Dashboard",
    year: "2025",
    device: "Web",
    imageOrder: 4,
    sourceUrl: "https://framerusercontent.com/images/8xcHzTrOpFO1YFofUXr0OIfjt4.png",
    points: [
      { label: "The Objective", text: "To transform raw employee survey data into an actionable \"Diversity and Inclusion\" dashboard, allowing HR leaders to monitor organizational health (E-Score) and identify specific sentiment trends over time." },
      { label: "Design Logic", text: "Employed Information Chunking and high-contrast gauge visualizations for immediate \"at-a-glance\" status checks, paired with detailed breakdown cards that use trend indicators (Up/Down arrows) to highlight specific areas of cultural friction." },
      { label: "The Impact", text: "Designed to facilitate targeted organizational interventions; for instance, identifying a drop in \"Psychological Safety\" (Comfort expressing opinions) allows management to initiate specific training rather than general, less effective policies." },
    ],
  },
  {
    id: "redeem-rewards",
    title: "Redeem Rewards",
    image: { src: "/media/gallery/05-redeem-rewards.png", alt: "Redeem Rewards", w: 2048, h: 1456 },
    type: "Store",
    year: "2025",
    device: "Web",
    imageOrder: 5,
    sourceUrl: "https://framerusercontent.com/images/MWiUlG7KIUvX9WmUqBHbFbHCrg.png",
    points: [
      { label: "The Objective", text: "To provide a high-utility service marketplace where employees can seamlessly convert earned engagement points into tangible professional and personal benefits like insurance, tax planning, and legal services." },
      { label: "Design Logic", text: "Leveraged a Marketplace Pattern featuring high-density service cards with clear price-to-action mapping, while using \"Spotlight\" filters (Policyplanner, Docsplanner) to help users navigate complex offerings quickly." },
      { label: "The Impact", text: "Engineered to drive long-term platform stickiness by offering meaningful, \"real-world\" rewards that solve administrative and financial pain points for the workforce." },
    ],
  },
  {
    id: "analytix-pricing-page",
    title: "Analytix Pricing Page",
    image: { src: "/media/gallery/06-analytix-pricing-page.png", alt: "Analytix Pricing Page", w: 2048, h: 1422 },
    type: "Pricing",
    year: "2024",
    device: "Web",
    imageOrder: 6,
    sourceUrl: "https://framerusercontent.com/images/7eo7pAOOtJX07vYNU9nRs0zjDU.png",
    points: [
      { label: "The Objective", text: "To design a clear, multi-tiered pricing model that caters to diverse user segments from individual analysts to large-scale enterprises facilitating a frictionless transition from free trials to paid subscriptions." },
      { label: "Design Logic", text: "Leveraged a Comparison-Based Grid Layout to enhance scannability, utilizing distinct typography and icons to differentiate service tiers. The \"Pro Plan\" is strategically highlighted to guide users toward the most popular, high-value option." },
      { label: "The Impact", text: "Optimizes the Conversion Funnel by providing clear, value-based justifications for each price point, aimed at increasing Monthly Recurring Revenue (MRR) and reducing sales-cycle friction for enterprise customers." },
    ],
  },
  {
    id: "employee-management",
    title: "Employee Management",
    image: { src: "/media/gallery/07-employee-management.png", alt: "Employee Management", w: 2048, h: 1456 },
    type: "Masters",
    year: "2025",
    device: "Web",
    imageOrder: 7,
    sourceUrl: "https://framerusercontent.com/images/6683S0bbLGNPNq917cEasLffCak.png",
    points: [
      { label: "The Objective", text: "To design a robust administrative command center that enables HR managers to oversee the entire workforce lifecycle on the platform—from initial invitation to active status monitoring." },
      { label: "Design Logic", text: "Implemented Advanced Filtering & Search (by name, department, or status) to minimize administrative overhead, paired with a clear Status-Based Color System (Accepted/Invited) to provide immediate visual feedback on platform adoption rates." },
      { label: "The Impact", text: "Streamlines the management of large-scale organizational hierarchies by consolidating account status, department mapping, and invitation workflows into a single, scalable source of truth." },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    image: { src: "/media/gallery/08-settings.png", alt: "Settings", w: 2048, h: 1536 },
    type: "Menu",
    year: "2024",
    device: "Mobile",
    imageOrder: 8,
    sourceUrl: "https://framerusercontent.com/images/P18YfUbRVC9EcLpI13f6YSuXA.png",
    points: [
      { label: "The Objective", text: "To design a high-utility \"Me\" or \"Profile\" workspace that centralizes account management, payment security, and banking integrations, providing users with a seamless transition between core financial services and administrative controls." },
      { label: "Design Logic", text: "Implemented a Linear Navigation Pattern with clear, icon-assisted list items that reduce cognitive load while navigating complex settings like \"Payment Settings\" (UPI & Bank Transfers) and \"App Settings\" (Permissions & Notifications). A high-contrast \"Switch to salary account\" call-to-action is strategically placed at the top to drive adoption of primary banking services." },
      { label: "The Impact", text: "Optimizes the Self-Service Experience by giving users direct control over their \"My Card\" (Debit Card) settings and referral rewards, aimed at increasing platform loyalty and reducing the need for customer support interactions." },
    ],
  },
  {
    id: "client-profile-policies-purchased",
    title: "Client Profile - Policies Purchased",
    image: { src: "/media/gallery/09-client-profile-policies-purchased.png", alt: "Client Profile - Policies Purchased", w: 2048, h: 1536 },
    type: "Cards",
    year: "2024",
    device: "Mobile",
    imageOrder: 9,
    sourceUrl: "https://framerusercontent.com/images/xfO8QozQizeervZ8cuyRWmkoCFM.png",
    points: [
      { label: "The Objective", text: "To design a detailed administrative workspace that provides insurance agents with a 360-degree view of their clients, consolidating personal profiles, active policy lifecycles, and earned rewards into a unified mobile interface." },
      { label: "Design Logic", text: "Implemented a Layered Information Hierarchy using expandable profile sections and high-density policy cards. This allows agents to perform \"Quick Actions\" like sharing policy documents or viewing granular details (Policy Number, Period, and Tax breakdowns) without losing the broader context of the client's portfolio." },
      { label: "The Impact", text: "Optimizes the agent’s post-sale service capacity by providing instant access to critical renewal dates and coverage specifics, aimed at increasing client retention and simplifying the complex claims or renewal process on the go." },
    ],
  },
  {
    id: "appreciation-requests",
    title: "Appreciation Requests",
    image: { src: "/media/gallery/10-appreciation-requests.png", alt: "Appreciation Requests", w: 2048, h: 1456 },
    type: "Requests",
    year: "2025",
    device: "Web",
    imageOrder: 10,
    sourceUrl: "https://framerusercontent.com/images/pLAlxt3JhbUmtegTtbl1zs7xw4.png",
    points: [
      { label: "The Objective", text: "To design a centralized moderation queue for administrators to review, approve, or decline peer-to-peer appreciation posts, ensuring all platform content aligns with organizational values and professional standards." },
      { label: "Design Logic", text: "Implemented a Grid-Based Card Layout that prioritizes essential metadata—sender, recipient, award type, and message—allowing admins to make high-confidence decisions rapidly without leaving the primary view." },
      { label: "The Impact", text: "Ensures the integrity of the engagement ecosystem by providing a scalable \"human-in-the-loop\" verification layer, effectively preventing misuse while maintaining a fast-paced culture of recognition." },
    ],
  },
  {
    id: "analytix-blogs-page",
    title: "Analytix Blogs Page",
    image: { src: "/media/gallery/11-analytix-blogs-page.png", alt: "Analytix Blogs Page", w: 2048, h: 1422 },
    type: "Blogs",
    year: "2024",
    device: "Web",
    imageOrder: 11,
    sourceUrl: "https://framerusercontent.com/images/u5LLofGynkm9t4LYVQKsRX4k.png",
    points: [
      { label: "The Objective", text: "To design a centralized content ecosystem that establishes thought leadership, provides user education through tutorials, and showcases real-world success stories to build deep trust with current and prospective users." },
      { label: "Design Logic", text: "Implemented a Responsive Grid Layout featuring high-contrast \"Category Badges\" and a consistent \"Read more\" interaction pattern, ensuring that complex technical excerpts are presented in a highly scannable and digestible format." },
      { label: "The Impact", text: "Enhances platform stickiness and SEO authority by positioning the brand as a primary source for analytics expertise, while simultaneously reducing support overhead through accessible \"User Guides\" and \"Tutorials\"." },
    ],
  },
  {
    id: "sidebar-apps-calendar",
    title: "Sidebar Apps - Calendar",
    image: { src: "/media/gallery/12-sidebar-apps-calendar.png", alt: "Sidebar Apps - Calendar", w: 2048, h: 1728 },
    type: "Calendar",
    year: "2024",
    device: "Web",
    imageOrder: 12,
    sourceUrl: "https://framerusercontent.com/images/ZrioEdckyTtlqla2M9t2G62vQY.png",
    points: [
      { label: "The Objective", text: "To provide a persistent, high-utility scheduling companion that allows enterprise users to manage their professional agenda specifically Meetings and Tasks without disrupting their primary workflow in the main application workspace." },
      { label: "Design Logic", text: "Utilizes a Dual-Tabbed Information Architecture to cleanly separate time-bound meetings from checklist-style tasks. The \"Meetings\" view prioritizes urgency with bold time-stamps and platform-branded CTAs, while the \"Tasks\" view employs a dense, scannable list with interactive checkboxes for rapid status updates." },
      { label: "The Impact", text: "Significantly reduces \"context-switching fatigue\" by surfacing real-time scheduling data alongside the user's work, aimed at improving overall time management and ensuring high-priority meetings are never missed." },
    ],
  },
  {
    id: "product-or-service-cards",
    title: "Product or Service Cards",
    image: { src: "/media/gallery/13-product-or-service-cards.png", alt: "Product or Service Cards", w: 2048, h: 1456 },
    type: "Cards",
    year: "2025",
    device: "Web",
    imageOrder: 13,
    sourceUrl: "https://framerusercontent.com/images/O38LsB7jfsYODPazwszgCua9bFg.png",
    points: [
      { label: "The Objective", text: "To design a centralized \"Social Hub\" that fosters a culture of peer appreciation and streamlines access to organizational updates like training and surveys." },
      { label: "Design Logic", text: "Utilized a Card-Based Architecture and a persistent sidebar navigation to manage high information density (feed, events, and training) without overwhelming the user." },
      { label: "The Impact", text: "Adhered to a Standardized Component Library to ensure that widgets like \"Upcoming Events\" and \"Timeline Cards\" share a unified visual language and behavior." },
    ],
  },
  {
    id: "fruits-category-subcategory-details",
    title: "Fruits - Category, Sub-Category & Details",
    image: { src: "/media/gallery/14-fruits-category-subcategory-details.png", alt: "Fruits - Category, Sub-Category & Details", w: 2048, h: 1536 },
    type: "E-commerce",
    year: "2024",
    device: "Mobile",
    imageOrder: 14,
    sourceUrl: "https://framerusercontent.com/images/G7ReUTCiI6MTUVWWLz4t6j1xTf4.png",
    points: [
      { label: "The Objective", text: "To design a high-performance retail funnel that guides users from broad category discovery to granular product details, optimizing the path-to-purchase for perishable goods like fresh fruits." },
      { label: "Design Logic", text: "Design Logic: Implemented a Visual-First Information Hierarchy utilizing: Category Grid: Clean, iconography-based tiles (e.g., Citrus, Berries, Exotic) for rapid top-level sorting. Sub-Category List: A high-density card layout featuring real-time \"Add\" triggers and dynamic promotional badges (e.g., \"10% OFF\") to drive impulse conversions. Product Detail Page: Focuses on transparency with a dedicated \"Storage Tip\" module and a clear quantity-adjustment interface, aimed at educating the user while simplifying the final checkout decision." },
      { label: "The Impact", text: "Optimizes the Grocery Shopping Journey by combining high-fidelity food photography with essential logistical data (weight, price, storage advice), aimed at reducing \"cart abandonment\" and improving user trust in product quality." },
    ],
  },
  {
    id: "confirm-itinerary-details",
    title: "Confirm Itinerary Details",
    image: { src: "/media/gallery/15-confirm-itinerary-details.png", alt: "Confirm Itinerary Details", w: 2048, h: 1536 },
    type: "Modal",
    year: "2024",
    device: "Web",
    imageOrder: 15,
    sourceUrl: "https://framerusercontent.com/images/WYBNoZBeEKNhlLZImBsMCOSacA.png",
    points: [
      { label: "The Objective", text: "To provide employees with a comprehensive, final review of complex, multi-modal business trips—including flights, hotels, trains, and car hires—ensuring all logistics align with corporate policy before final booking." },
      { label: "Design Logic", text: "Utilized a Modular Grid System for high-density information display. Each travel \"leg\" is visualized as a scannable card with specific iconography, clear time-stamping, and location identifiers to facilitate rapid error-checking for scheduling overlaps." },
      { label: "The Impact", text: "Designed to streamline the corporate approval process and reduce booking errors, aimed at improving employee adherence to \"Company Rules\" while providing a high-confidence user experience for business travellers." },
    ],
  },
  {
    id: "service-checklists-card",
    title: "Service Checklists (Jio)",
    image: { src: "/media/gallery/16-service-checklists-card.png", alt: "Service Checklists (Jio)", w: 6400, h: 4800 },
    type: "Web & Mobile",
    year: "2026",
    description: "This Web-on-Mobile application is an enterprise-grade, configurable checklist management ecosystem designed to streamline health, safety, and operational compliance audits across complex organizational hierarchies",
    imageOrder: 16,
    sourceUrl: "https://framerusercontent.com/images/w2kb2bHsAmBxRULjQo6FHiAjWyQ.png",
  },
  {
    id: "mutual-funds-app-card",
    title: "Mutual Funds App",
    image: { src: "/media/gallery/17-mutual-funds-app-card.png", alt: "Mutual Funds App", w: 2048, h: 1536 },
    type: "Mobile",
    year: "2023",
    description: "A comprehensive FinTech platform designed to simplify complex investment data through intuitive Portfolio Analytics and risk-based fund discovery.",
    imageOrder: 17,
    sourceUrl: "https://framerusercontent.com/images/zr8tX91EoKyU9Di8MtMKjtAEA.png",
  }
];
