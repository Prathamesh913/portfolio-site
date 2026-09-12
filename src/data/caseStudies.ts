// Case-study content model + records.
// Sources of truth: live Framer pages (URLs per record) + user-confirmed metadata.
// Text is preserved verbatim from the source pages. Missing content is omitted, never invented.

export type CaseStudyScreen = {
  src: string;
  alt: string;
  caption?: string;
  w?: number;
  h?: number;
};

export type CaseStudyGallery = {
  id: string;
  title: string;
  intro?: string;
  screens: CaseStudyScreen[];
};

export type CaseStudySection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type CaseStudyOmittedNote = {
  intro: string;
  items: string[];
};

export type CaseStudyKind = "case-study" | "exploration";

export type CaseStudy = {
  slug: string;
  title: string;
  company: string;
  year: string;
  kind: CaseStudyKind;
  summary: string;
  role: string;
  scope: string[];
  platform?: string;
  status?: string;
  overview: string[];
  sections: CaseStudySection[];
  galleries: CaseStudyGallery[];
  galleriesIntro?: string;
  omittedNote?: CaseStudyOmittedNote;
  reflection: string[];
  sourceUrl: string;
  marketplaceUrl?: string;
};

// Display + prev/next order (user-confirmed)
export const CASE_ORDER = [
  "service-checklists",
  "recognition-platform",
  "policy-agent-app",
  "mutual-funds-app",
  "ashwini-foods",
  "iceland-tourism-catalogue",
];

const cs = (file: string, alt: string, caption: string): CaseStudyScreen => ({
  src: `/media/case-studies/service-checklists/${file}`,
  alt,
  caption,
  w: 1500,
  h: 3248,
});

// ---------------------------------------------------------------------------
// Service Checklists — full case study with real assets
// Source: https://prathameshdesigns.framer.website/servicechecklists
// ---------------------------------------------------------------------------
export const serviceChecklists: CaseStudy = {
  slug: "service-checklists",
  title: "Service Checklists",
  company: "Jio Platforms",
  year: "2026",
  kind: "case-study",
  summary:
    "A Web-on-Mobile checklist ecosystem for health, safety, and operational compliance audits across enterprise facility hierarchies.",
  role: "UI/UX Designer",
  scope: ["Interface design", "Workflow design", "Information architecture", "Prototyping"],
  platform: "Enterprise Web-on-Mobile product",
  overview: [
    "This Web-on-Mobile application is an enterprise-grade, configurable checklist management ecosystem designed to streamline health, safety, and operational compliance audits across complex organizational hierarchies.",
  ],
  sections: [
    {
      id: "problem",
      heading: "Problem",
      paragraphs: [
        "We had a major bottleneck in how our field teams managed health, safety, and compliance audits. The organization was relying on an old, native work-order app that had been forced into a role it wasn't built for. It created huge friction on the ground.",
      ],
      bullets: [
        "If a field worker was in the middle of a massive checklist and received a phone call, the native app would crash instantly, wiping out all their unsaved work.",
        "If a bug broke the app on-site, our hands were tied by 1-to-2 week App Store and Play Store review cycles before we could ship a fix.",
        "The app forced workers down a strict, linear path (Question 1, Question 2, Question 3...). But kitchens don't work in a straight line. If a worker was standing by the stove, they couldn't easily skip a \"food storage freezer\" question without getting blocked.",
      ],
    },
    {
      id: "pivot",
      heading: "Architectural pivot",
      paragraphs: [
        "We realized that to fix the user experience, we had to fix the architecture. We moved away from a native app entirely and built a specialized Web-on-Mobile ecosystem.",
      ],
      bullets: [
        "By bypassing the app stores, we could ship critical bug fixes instantly. We cut deployment timelines down to under 24 hours.",
        "The \"call-crashing\" issue disappeared, giving field workers a reliable tool that didn't erase their progress mid-shift.",
      ],
    },
    {
      id: "role",
      heading: "My role",
      paragraphs: [
        "I designed the Service Checklists module as UI/UX Designer at Jio Platforms: the executor workflow, the admin configuration model, and the form logic, all on the Jio Design System. The decisions below — zone-based execution, the cascade setup tree, the geo-fence compromise, and the Criticality × Response matrix — came from working directly with service executives, admins, and engineering.",
      ],
    },
    {
      id: "insights",
      heading: "User insights & strategy",
      paragraphs: [
        "I spent time on the ground shadowing our Service Executives inside busy commercial kitchens. I watched them struggle with the old app's rigid order because every food court layout is completely different.",
      ],
      bullets: [
        "The fix: I designed Facility Area Cards (like Food Prep, Cold Storage, and Dining Hall).",
        "How it works: Instead of a never-ending list, the worker is greeted by a dashboard of physical \"Zones\". They can walk into a room, tap that specific zone, and answer the questions that match what they are physically looking at. Clear progress bars (e.g., \"5/5 answered\") and urgency badges keep them on track without forcing their hand.",
      ],
    },
    {
      id: "hierarchy",
      heading: "Administrative hierarchy",
      paragraphs: [
        "Setting up and updating checklists for hundreds of individual food courts is usually an administrative mess. To fix this, I designed a 4-layer setup tree: Organization → Location → Building → Food Court.",
        "We built a \"cascade\" feature. If an admin maps a standard checklist to \"Location A,\" the system automatically rolls it out to every building and kitchen sitting under that location. This saved the admin team hours of tedious manual data entry.",
      ],
    },
    {
      id: "geofencing",
      heading: "Geo-fencing trade-off",
      paragraphs: [
        "Stakeholders initially wanted the app to verify the user's location on every single question to prevent cheating. However, enterprise kitchens are often in basements or steel structures with terrible cell service. Checking location constantly would introduce lag and break the app.",
      ],
      bullets: [
        "The compromise: We built an 800-meter geo-fence check that triggers strictly at two points — when you Start the audit and when you Submit it. This protected data integrity without making the app painful to use in a dead zone.",
      ],
    },
    {
      id: "form-logic",
      heading: "Input & form logic",
      paragraphs: [
        "Instead of making workers fill out endless comments and attach photos for things that are perfectly fine, we created a dynamic \"Criticality × Response\" matrix. The app adapts based on how severe a failure is.",
      ],
      bullets: [
        "If a worker checks a Vital item (like an active health hazard) and marks it Poor or Not Working, the form instantly expands.",
        "The app locks the \"Next\" action until they take a mandatory photo and type out specific remarks.",
        "If the item is marked \"Good,\" the extra fields vanish to save them time.",
      ],
    },
    {
      id: "design-system",
      heading: "Design system",
      paragraphs: [
        "Kitchens are fast-paced and chaotic, so the app had to be highly tactile and instantly readable. By building everything strictly with the Jio Design System (JDS), we gained a massive advantage: our users already used internal JDS apps (like the HR platform), which completely erased the learning curve.",
      ],
      bullets: [
        "We used the primary blue (#3535F3) for high accessibility contrast. As seen in Question Assessment (Mandatory Fields Triggered), when an item is marked \"Poor,\" bold warning colours instantly grab attention under harsh kitchen lights.",
        "Layouts utilized standard spacing tokens and interactive components. To ensure easy interaction on the move, buttons and cards applied a generous 16px border radius to provide comfortable, finger-friendly touch targets.",
        "We fully adopted the JioType font family. As shown in Checklist Execution (Expanded Schedule View), bold values and sharp text hierarchy eliminate eye strain on small mobile screens.",
        "To save valuable screen space, we used accordion components. Comparing Checklist Execution (Closed Schedule View) to Checklist Execution (Expanded Schedule View) shows how bulky site metadata neatly tucks away so users can focus entirely on the audit questions.",
        "To give executives quick validation, each zone card features a circular progress tracker. As seen in Checklist Execution (All Areas Completed State), it clicks into a solid green ring the exact moment a section is done.",
      ],
    },
    {
      id: "impact",
      heading: "Impact & future scaling",
      bullets: [
        "The underlying architecture was built so flexibly that we didn't have to redesign a thing to scale out. The platform now seamlessly runs Facility Health Management and Construction Site Tracking checklists with few code changes.",
        "By forcing photo proof for high-criticality failures, we removed all guesswork and arguments from the admin review process.",
        "The second an audit wraps up, it automatically compiles everything — from GPS stamps and timestamps to photos and remarks — into a clean, shareable compliance report for leadership.",
      ],
    },
  ],
  galleriesIntro:
    "A selection of screens that show how service executives set up a checklist schedule and perform checklist execution.",
  galleries: [
    {
      id: "schedule-creation",
      title: "Schedule creation",
      intro:
        "How a service executive plans a new audit: cascading dropdowns filter by role and building, mandatory frequency rules are visible before committing, and a JDS modal confirms the assignment.",
      screens: [
        cs("02-create-schedule-initial.png", "Create Schedule (Initial Configuration State)", "A configuration form used to plan a new audit via a date picker and cascading dropdowns. The building options automatically filter to show only locations mapped to that user's role to prevent errors. Sub-selections for the food court and checklist dynamically adjust based on the selected building."),
        cs("03-create-schedule-checklist-frequency.png", "Create Schedule (Checklist Selection & Frequency State)", "The active dropdown state where the user selects the target audit questionnaire. To guide compliance, each option dynamically displays its mandatory execution rules right inside the menu (e.g., \"minimum 3 times weekly\"). This ensures executives have immediate visibility into operational requirements before officially finalizing their shift schedule."),
        cs("04-create-schedule-completed.png", "Create Schedule (Form Completed State)", "The fully populated form with valid date, building, food court, and checklist selections finalized, the bottom action button turns into a solid blue primary state."),
        cs("05-create-schedule-success-modal.png", "Create Schedule (Success Confirmation Modal)", "The success state overlay triggered immediately after finalizing a schedule. Built with a clear JDS modal structure, it confirms the creation of the checklist assignment and explicitly lists the planned date. Tapping the primary \"Close\" button redirects the executive to their home dashboard."),
      ],
    },
    {
      id: "starting-an-audit",
      title: "Starting an audit",
      intro:
        "From the home dashboard to a validated start: the geo-fence checks device permissions and perimeter distance before the executive commits to the audit.",
      screens: [
        cs("01-executive-home-empty.png", "Service Executive Home (Empty State)", "The default dashboard when an executor opens the app, using a clean illustration to show no pending tasks are left for the day. A metric panel breaks down weekly and monthly statuses, anchored by a clear pill-shaped button to start a new assignment."),
        cs("06-executive-home-active-schedule.png", "Executive Home (Active Schedule State)", "The home dashboard showing a newly created schedule card under the \"Pending Execution\" list. The card displays full structural details like the building, checklist name, and specific food court location. Action buttons are positioned right at the bottom, letting the service executive easily choose to reschedule or immediately tap \"Start\" to execute the checklist."),
        cs("07-location-disabled-error.png", "Service Executive Home (Location Disabled Error)", "An error modal that triggers if a service executive tries to start a schedule with system location turned off. To prevent compliance bypasses, it blocks the audit flow and provides clear, step-by-step instructions for enabling device and browser permissions before they can proceed."),
        cs("08-location-mismatch-error.png", "Service Executive Home (Location Mismatch Error)", "A geofencing validation modal that appears when location services are active, but the service executive is physically outside the designated perimeter. It protects data integrity by blocking the schedule entry and explicitly tells the executive exactly how many meters closer they need to move to unlock the checklist."),
        cs("09-start-confirmation-modal.png", "Service Executive Home (Start Confirmation Modal)", "The final confirmation overlay displayed once all location and geofencing validation checks pass successfully. It serves as a reminder to the service executive to finish and submit the form once the process begins. Tapping \"Continue\" officially launches the schedule into the active execution screen."),
      ],
    },
    {
      id: "executing-an-audit",
      title: "Executing an audit",
      intro:
        "The core execution loop: zone cards with progress trackers, collapsible schedule context, and a Criticality × Response form that expands only when a failure demands evidence.",
      screens: [
        cs("10-execution-expanded-schedule.png", "Checklist Execution (Expanded Schedule View)", "The screen configuration after expanding the \"Schedule Details\" accordion header. It displays the full read-only location parameters like the specific organization, building, and food court allowing the service executive to verify their workspace context on the go."),
        cs("11-execution-closed-schedule.png", "Checklist Execution (Closed Schedule View)", "The default landing screen when beginning an audit, featuring a draft auto-save reminder banner. Schedule details are hidden within a collapsed accordion block to keep the screen clean, letting the service executive immediately focus on the facility zone cards below."),
        cs("12-question-assessment-empty.png", "Question Assessment (Empty State)", "The initial default state of a vital checklist question before an executive selects any response. It clearly displays the operational requirement text along with selection choices ranging from \"Not Applicable\" to \"Good.\" The bottom action arrow remains muted to prevent advancing without data."),
        cs("13-question-assessment-mandatory-fields.png", "Question Assessment (Mandatory Fields Triggered)", "The dynamic form response triggered when a service executive marks a question's condition as \"Poor.\" The system instantly marks the remarks text field and the camera capture button as mandatory fields. This operational safeguard prevents compliance bypasses during audit failure points."),
        cs("14-preview-media-caption.png", "Preview Media (Caption Input State)", "A structured preview modal that overlay blocks the main form immediately after the service executive captures a photo. It provides a visual review window of the shot along with an \"Add a Caption\" input field to log real-time context before finalizing the upload."),
        cs("15-question-assessment-media-attached.png", "Question Assessment (Media Attached State)", "The captured photo is logged as an active attachment item alongside metadata details such as file name, date stamp, and time stamp. Built-in edit and delete icons let the service executive quickly alter entries on the move."),
        cs("16-question-assessment-section-completion.png", "Question Assessment (Section Completion State)", "The inner question screen showing the final item within a specific facility area zone. The expanded \"Navigate to Question\" layout lists all items sequentially for quick navigation, while a prominent circular progress tracker hits the maximum count (4/4) as the last response is chosen."),
      ],
    },
    {
      id: "completing-an-audit",
      title: "Completing an audit",
      intro:
        "Closing the loop: completed zone wheels unlock the sticky submit action, the submission routes to the SRA Admin for review, and a real-time score summary closes the flow.",
      screens: [
        cs("17-execution-all-areas-completed.png", "Checklist Execution (All Areas Completed State)", "The updated flow execution dashboard once the service executive completes all questions across all facility zones. The target cards change to an \"Edit Details\" status and display filled-in green completion wheels, activating the sticky primary bottom action button to finalize the submission."),
        cs("18-execution-submission-confirmation.png", "Checklist Execution (Submission Confirmation Modal)", "The confirmation overlay layout triggered by tapping the main submit button. The card highlights that the finished schedule will route directly to the SRA Admin for audit review, warning the service executive that any rejected entries will require corrections and resubmission."),
        cs("19-execution-assessment-score.png", "Checklist Execution (Assessment Score State)", "The final score summary pop-up shown immediately after confirming the schedule submission. It displays the real-time calculated audit score percentage and notes the pending approval status, offering a simple primary \"Close\" button to cleanly exit the flow."),
      ],
    },
  ],
  omittedNote: {
    intro:
      "To keep this case study short and easy to read, I have left out the heavy workflows, such as:",
    items: [
      "For Platform Admins: The setup dashboards where admins create checklists, build food court masters, map locations, and configure geo-fencing settings.",
      "For Service Admins and Executives: The manager approval steps, rescheduling, tracking old submissions, and viewing final compliance reports.",
    ],
  },
  reflection: [
    "Shadowing service executives in working kitchens is what shaped the zone-based interaction model — the interface had to follow the room, not a question number.",
    "The pivot taught me that the fastest way to fix an experience is sometimes to fix the architecture underneath it.",
  ],
  sourceUrl: "https://prathameshdesigns.framer.website/servicechecklists",
};

// ---------------------------------------------------------------------------
// Employee Recognition Platform — text-led case study
// Source: https://prathameshdesigns.framer.website/recognitionplatform
// ---------------------------------------------------------------------------
export const recognitionPlatform: CaseStudy = {
  slug: "recognition-platform",
  title: "Employee Recognition Platform",
  company: "Jio Platforms",
  year: "2025",
  kind: "case-study",
  summary:
    "An enterprise-grade platform for corporate recognition and a vendor-driven marketplace with pricing and budget management workflows.",
  role: "UI/UX Designer",
  scope: ["Interface design", "Workflow design", "Enterprise product design"],
  platform: "Enterprise web platform",
  overview: [
    "An enterprise-grade platform for corporate recognition and a vendor-driven marketplace with pricing and budget management workflows.",
  ],
  sections: [
    {
      id: "problem",
      heading: "Problem",
      paragraphs: [
        "Large organizations struggle to manage employee recognition and reward budgets across fragmented internal systems and multiple third-party vendors.",
      ],
    },
    {
      id: "insight",
      heading: "Insight",
      paragraphs: [
        "Recognition is most effective when it is instant. We designed the peer-to-peer reward flow to be completed in under three clicks to ensure the appreciation felt immediate.",
      ],
    },
    {
      id: "solution",
      heading: "Solution",
      paragraphs: [
        "I designed a unified enterprise marketplace that brought recognition and rewards into one cohesive ecosystem, making it as easy as a consumer shopping experience.",
      ],
    },
    {
      id: "learning",
      heading: "Learning",
      paragraphs: [
        "In an enterprise environment, the \"Internal Admin\" is just as important as the end-user. Simplifying the backend workflow for HR was the secret to making the frontend successful.",
      ],
    },
  ],
  galleries: [
    {
      id: "screens",
      title: "Screens",
      screens: [
        { src: `/media/case-studies/recognition-platform/01-timeline.png`, alt: `Timeline`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/02-employee-management.png`, alt: `Employee Management`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/03-survey-statistics.png`, alt: `Survey Statistics`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/04-redeem-rewards.png`, alt: `Redeem Rewards`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/05-appreciation-requests.png`, alt: `Appreciation Requests`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/06-employee-orders.png`, alt: `Employee Orders`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/07-training-resources.png`, alt: `Training & Resources`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/08-appreciation-request-preview.png`, alt: `Appreciation Request Preview`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/09-vendor-sign-up.png`, alt: `Vendor Sign Up`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/10-create-product-listing.png`, alt: `Create Product Listing`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/11-create-product-listing-with-details.png`, alt: `Create Product Listing with details`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/12-vendor-store-listing.png`, alt: `Vendor Store Listing`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/13-order-details.png`, alt: `Order Details`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/14-vendor-orders.png`, alt: `Vendor Orders`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/15-product-or-service-cards.png`, alt: `Product or Service Cards`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/16-create-job-posting.png`, alt: `Create Job Posting`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/17-active-job-postings.png`, alt: `Active Job Postings`, w: 2048, h: 1456 },
        { src: `/media/case-studies/recognition-platform/18-active-posting-role-details.png`, alt: `Active Posting Role Details`, w: 2048, h: 1456 },
      ],
    },
  ],
  reflection: [],
  sourceUrl: "https://prathameshdesigns.framer.website/recognitionplatform",
};

// ---------------------------------------------------------------------------
// Policy Agent App — text-led case study
// Source: https://prathameshdesigns.framer.website/policyagentapp
// ---------------------------------------------------------------------------
export const policyAgentApp: CaseStudy = {
  slug: "policy-agent-app",
  title: "Policy Agent App",
  company: "Secoraa",
  year: "2024",
  kind: "case-study",
  summary:
    "A sales-enablement ecosystem for insurance agents featuring a real-time Automated Vehicle Verification engine via seamless API integration.",
  role: "UI/UX Designer",
  scope: ["Mobile product design", "Workflow design", "Interaction design"],
  platform: "Mobile insurance sales-enablement product",
  overview: [
    "A sales-enablement ecosystem for insurance agents featuring a real-time Automated Vehicle Verification engine via seamless API integration.",
  ],
  sections: [
    {
      id: "problem",
      heading: "Problem",
      paragraphs: [
        "Sales agents lacked real-time tools to close deals on the go and struggled with the friction of mandatory certification requirements.",
      ],
    },
    {
      id: "insight",
      heading: "Insight",
      paragraphs: [
        "Real-time feedback bridges the \"trust gap.\" Showing clear \"Success/Error\" states during verification empowered agents to handle customer objections on the spot.",
      ],
    },
    {
      id: "solution",
      heading: "Solution",
      paragraphs: [
        "I designed a high-velocity sales ecosystem that integrated immediate vehicle verification tools and a streamlined, mobile-first certification module.",
      ],
    },
    {
      id: "learning",
      heading: "Learning",
      paragraphs: [
        "When designing for professional tools, utility is the highest form of UX. If a feature saves an agent five minutes of manual work, it's more valuable than any visual flourish.",
      ],
    },
  ],
  galleries: [
    {
      id: "screens",
      title: "Screens",
      screens: [
        { src: `/media/case-studies/policy-agent-app/01-home-screen-variants.png`, alt: `Home Screen Variants`, w: 2048, h: 1536 },
        { src: `/media/case-studies/policy-agent-app/02-check-vehicle-details.png`, alt: `Check Vehicle Details`, w: 2048, h: 1536 },
        { src: `/media/case-studies/policy-agent-app/03-client-profile-policies-purchased.png`, alt: `Client Profile - Policies Purchased`, w: 2048, h: 1536 },
        { src: `/media/case-studies/policy-agent-app/04-health-insurance.png`, alt: `Health Insurance`, w: 2048, h: 1536 },
        { src: `/media/case-studies/policy-agent-app/05-insurance-search-results.png`, alt: `Insurance Search Results`, w: 2048, h: 1536 },
        { src: `/media/case-studies/policy-agent-app/06-posp-li-examination.png`, alt: `PoSP Li Examination`, w: 2048, h: 1536 },
        { src: `/media/case-studies/policy-agent-app/07-policy-details.png`, alt: `Policy Details`, w: 2048, h: 1536 },
      ],
    },
  ],
  reflection: [],
  sourceUrl: "https://prathameshdesigns.framer.website/policyagentapp",
};

// ---------------------------------------------------------------------------
// Mutual Funds App — text-led case study
// Source: https://prathameshdesigns.framer.website/mutualfundsapp
// ---------------------------------------------------------------------------
export const mutualFundsApp: CaseStudy = {
  slug: "mutual-funds-app",
  title: "Mutual Funds App",
  company: "Secoraa",
  year: "2023",
  kind: "case-study",
  summary:
    "A comprehensive FinTech platform designed to simplify complex investment data through intuitive Portfolio Analytics and risk-based fund discovery.",
  role: "UI/UX Designer",
  scope: ["FinTech interface design", "Information architecture", "Analytics UX"],
  platform: "FinTech web/mobile product",
  overview: [
    "A comprehensive FinTech platform designed to simplify complex investment data through intuitive Portfolio Analytics and risk-based fund discovery.",
  ],
  sections: [
    {
      id: "problem",
      heading: "Problem",
      paragraphs: [
        "Financial data is often intimidating for retail investors, leading to a \"paralysis by analysis\" where they feel overwhelmed by complex metrics.",
      ],
    },
    {
      id: "insight",
      heading: "Insight",
      paragraphs: [
        "Users aren't just looking for high returns; they are looking for confidence. Prioritizing risk-ratios over profit numbers helped users feel more secure in their choices.",
      ],
    },
    {
      id: "solution",
      heading: "Solution",
      paragraphs: [
        "I redesigned the experience to simplify high-density data through clear Portfolio Analytics and interactive calculators, transforming abstract financial concepts into intuitive visuals.",
      ],
    },
    {
      id: "learning",
      heading: "Learning",
      paragraphs: [
        "Good design in FinTech isn't about removing data; it's about layering it. Giving users the \"big picture\" first, with the option to dive into details, builds trust without causing fatigue.",
      ],
    },
  ],
  galleries: [
    {
      id: "screens",
      title: "Screens",
      screens: [
        { src: `/media/case-studies/mutual-funds-app/01-home.png`, alt: `Home`, w: 2048, h: 1536 },
        { src: `/media/case-studies/mutual-funds-app/02-types-of-investment.png`, alt: `Types of Investment`, w: 2048, h: 1536 },
        { src: `/media/case-studies/mutual-funds-app/03-my-portfolio.png`, alt: `My Portfolio`, w: 2048, h: 1536 },
        { src: `/media/case-studies/mutual-funds-app/04-funds-watchlist.png`, alt: `Funds Watchlist`, w: 2048, h: 1536 },
        { src: `/media/case-studies/mutual-funds-app/05-fund-details.png`, alt: `Fund Details`, w: 2048, h: 1536 },
        { src: `/media/case-studies/mutual-funds-app/06-learning.png`, alt: `Learning`, w: 2048, h: 1536 },
        { src: `/media/case-studies/mutual-funds-app/07-returns-calculator.png`, alt: `Returns Calculator`, w: 2048, h: 1536 },
        { src: `/media/case-studies/mutual-funds-app/08-app-onboarding.png`, alt: `App Onboarding`, w: 2048, h: 1536 },
      ],
    },
  ],
  reflection: [],
  sourceUrl: "https://prathameshdesigns.framer.website/mutualfundsapp",
};

// ---------------------------------------------------------------------------
// Ashwini Foods — short visual exploration page
// Source: https://prathameshdesigns.framer.website/ashwinifoods
// ---------------------------------------------------------------------------
export const ashwiniFoods: CaseStudy = {
  slug: "ashwini-foods",
  title: "Ashwini Foods",
  company: "Independent design exploration",
  year: "2022",
  kind: "exploration",
  summary: "An experiment for a readymade food mixes homemade brand.",
  role: "Designer",
  scope: ["Brand and packaging exploration"],
  platform: "Visual design exploration",
  overview: [
    "An experiment for a readymade food mixes homemade brand.",
  ],
  sections: [],
  galleries: [
    {
      id: "screens",
      title: "Selected work",
      screens: [
        { src: `/media/case-studies/ashwini-foods/01-package-front.png`, alt: `Package - Front`, w: 2048, h: 1536 },
        { src: `/media/case-studies/ashwini-foods/02-package-angle.png`, alt: `Package - Angle`, w: 2048, h: 1536 },
        { src: `/media/case-studies/ashwini-foods/03-package-back.png`, alt: `Package - Back`, w: 2048, h: 1536 },
      ],
    },
  ],
  reflection: [],
  sourceUrl: "https://prathameshdesigns.framer.website/ashwinifoods",
};

// ---------------------------------------------------------------------------
// Iceland Tourism Catalogue — short visual exploration page
// Source: https://prathameshdesigns.framer.website/icelandcatalogue
// ---------------------------------------------------------------------------
export const icelandTourism: CaseStudy = {
  slug: "iceland-tourism-catalogue",
  title: "Iceland Tourism Catalogue",
  company: "Independent design exploration",
  year: "2022",
  kind: "exploration",
  summary: "A travel catalogue design exploration for iceland tourism.",
  role: "Designer",
  scope: ["Editorial layout", "Typography", "Visual storytelling"],
  platform: "Catalogue design exploration",
  overview: [
    "A travel catalogue design exploration for iceland tourism.",
  ],
  sections: [],
  galleries: [
    {
      id: "screens",
      title: "Selected work",
      screens: [
        { src: `/media/case-studies/iceland-tourism-catalogue/01-catalogue-front.png`, alt: `Catalogue Front`, w: 2048, h: 1536 },
        { src: `/media/case-studies/iceland-tourism-catalogue/02-catalogue-page-1.png`, alt: `Catalogue Page 1`, w: 2048, h: 1536 },
        { src: `/media/case-studies/iceland-tourism-catalogue/03-catalogue-page-2.png`, alt: `Catalogue Page 2`, w: 2048, h: 1536 },
        { src: `/media/case-studies/iceland-tourism-catalogue/04-catalogue-page-3.png`, alt: `Catalogue Page 3`, w: 2048, h: 1536 },
        { src: `/media/case-studies/iceland-tourism-catalogue/05-catalogue-back.png`, alt: `Catalogue Back`, w: 2048, h: 1536 },
      ],
    },
  ],
  reflection: [],
  sourceUrl: "https://prathameshdesigns.framer.website/icelandcatalogue",
};

export const allCaseStudies: CaseStudy[] = [
  serviceChecklists,
  recognitionPlatform,
  policyAgentApp,
  mutualFundsApp,
  ashwiniFoods,
  icelandTourism,
];
