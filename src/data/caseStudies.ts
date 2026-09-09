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
};

// Display + prev/next order (user-confirmed)
export const CASE_ORDER = [
  "gamedock",
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

// ---------------------------------------------------------------------------
// GameDock — Omarchy-native game library launcher plugin
// Sources: https://github.com/Prathamesh913/gamedock (README, docs/GAMEDOCK_PROGRESS.md)
// and the Omarchy marketplace listing https://plugins.omarchy.org/plugin.html?id=io.github.prathamesh913.gamedock
// Facts are grounded in those sources only; no metrics or outcomes are invented.
// ---------------------------------------------------------------------------
export const gamedock: CaseStudy = {
  slug: "gamedock",
  title: "GameDock",
  company: "Independent · open source",
  year: "2026",
  kind: "case-study",
  summary:
    "An Omarchy-native bar plugin that unifies games from Steam, Heroic, RetroArch, and RPCS3 into one compact dashboard for browsing, searching, and launching.",
  role: "Independent product design & development",
  scope: ["Product design", "Interaction design", "Linux desktop integration", "Plugin development"],
  platform: "Omarchy bar widget (Linux · Quickshell)",
  status: "Live · v0.1.0",
  overview: [
    "GameDock is an Omarchy bar plugin that brings games from Steam, Heroic, RetroArch, and RPCS3 into one compact dashboard. From a single panel you can search, filter, sort, favorite, and launch games directly — without opening a launcher UI first.",
    "It is designed as an Omarchy-native plugin and follows the existing Omarchy visual and theming system, so the same compact panel adapts naturally to the built-in Omarchy themes.",
  ],
  sections: [
    {
      id: "problem",
      heading: "The problem",
      paragraphs: [
        "Modern gaming libraries are fragmented across multiple launchers, stores, and emulator folders. Finding and launching a game means remembering which launcher owns it, opening that launcher's UI, and navigating to the right title — context switching with no single point of control.",
      ],
      bullets: [
        "A library can live across Steam, Heroic (Epic, GOG, and Amazon), RetroArch, and RPCS3 at once, each with its own metadata and launch path.",
        "There is no unified place to browse everything installed, see recently played games, or jump straight into a title.",
      ],
    },
    {
      id: "direction",
      heading: "Product direction",
      paragraphs: [
        "GameDock's direction is a single, always-available desktop control center for games, living directly in the Omarchy bar. The core interaction is short and deliberate: Omarchy bar → GameDock icon → GameDock panel → click a game → the game launches.",
      ],
    },
    {
      id: "core-experience",
      heading: "Core experience",
      paragraphs: [
        "GameDock scans supported launchers into a local cache, presents the results in an Omarchy-native panel, and applies search, launcher filtering, and sorting in memory. Selecting a game launches it through its native launcher or command.",
      ],
      bullets: [
        "Unified launcher — one panel for Steam, Heroic, RetroArch, and RPCS3.",
        "Fast in-memory search — case-insensitive matching on title and launcher, instant over the loaded model.",
        "Launcher filtering — an All chip plus only the installed/detected launchers.",
        "Sorting — Natural, Recent, A–Z, and Launcher orders.",
        "Persistent favorites — stored by stable game IDs so they survive cache refreshes and renames.",
        "Recently played — merged across launchers, newest first.",
        "Artwork — local artwork preferred, optional remote artwork with a launcher-glyph fallback.",
        "Keyboard navigation — arrow keys, h/j/k/l, Enter/Space, with a shared mouse+keyboard cursor.",
        "Direct launching — through each launcher's native URI or command.",
        "Native Omarchy popout integration and large-library scrolling.",
      ],
    },
    {
      id: "ux-interface",
      heading: "UX & interface decisions",
      paragraphs: [
        "The panel is a native list-based design — no grid or card layout — so it stays visually consistent with Omarchy. It is capped at about 700 logical pixels as a screen-safety clamp, and grows responsively with content; larger libraries scroll inside the panel.",
      ],
      bullets: [
        "Clear section hierarchy: header, search field, launcher filter chips, sort chips, Favorites, Recently Played, Installed Games (grouped per launcher), and Launchers.",
        "A shared cursor model gives one highlight at a time for both mouse and keyboard, matching Omarchy's first-party panel pattern.",
        "Each game row shows an artwork tile (with glyph fallback), title, launcher/platform and relative time, a favorite star, and a launch affordance.",
        "Context-aware empty states — for example a launcher-specific note when a launcher has no games, or \"No games found\" for an empty search.",
        "Search is keyboard-first but not auto-focused on open, preserving the normal browse-at-a-glance layout until it is needed.",
      ],
    },
    {
      id: "architecture",
      heading: "Technical & product architecture",
      paragraphs: [
        "GameDock is self-contained and Omarchy-native. The stack is Quickshell/QML for the UI, JavaScript for UI-facing logic, Python 3 (standard library only) for launcher scanning, and JSON for cache and state — deliberately no Electron, no Tauri, no GTK app, and no Rust helper.",
      ],
      bullets: [
        "manifest.json declares a bar-widget plugin (id io.github.prathamesh913.gamedock).",
        "BarWidget.qml renders the bar pill and forwards the panel lifecycle so GameDock participates in Omarchy popout coordination.",
        "Panel.qml is the KeyboardPanel that owns presentation, navigation, search, filtering, sorting, and artwork.",
        "Model.js provides scan-data views, favorites state, and launch command builders.",
        "scan.py parses each launcher's metadata with per-launcher error isolation and atomically writes a canonical cache.json.",
        "Runtime data (cache, cached artwork, favorites) lives outside the repository in the Omarchy state directory.",
        "Remote artwork is fetched lazily, validated (HTTPS only, image-signature checked), and cached; any failure falls back to the launcher glyph.",
      ],
    },
    {
      id: "omarchy-plugin",
      heading: "Omarchy plugin",
      paragraphs: [
        "GameDock is distributed as a self-published community plugin through the Omarchy plugin marketplace, where it is listed as GameDock (kind: Bar widget) and is installable directly through the Omarchy plugin manager. It is not maintained by Omarchy itself.",
      ],
      bullets: [
        "Install: omarchy plugin add https://github.com/prathamesh913/gamedock.git --enable --yes",
        "Marketplace listing: plugins.omarchy.org/plugin.html?id=io.github.prathamesh913.gamedock",
        "The plugin is fully self-contained and follows Omarchy's plugin and theming conventions.",
      ],
    },
    {
      id: "outcome",
      heading: "Outcome",
      paragraphs: [
        "GameDock is shipped and publicly available as open source.",
      ],
      bullets: [
        "Public MIT-licensed repository on GitHub.",
        "A v0.1.0 release and a stable v1 feature set for the four supported launchers.",
        "A live Omarchy plugin-marketplace listing (status: Available).",
        "Controlled scale testing through 1000 synthetic games, with no meaningful need for virtualized list rendering observed at that scale.",
      ],
    },
  ],
  galleriesIntro: "Official product screenshots recovered from the repository.",
  galleries: [
    {
      id: "product-overview",
      title: "Product preview",
      intro: "The GameDock panel: Steam, Heroic, RetroArch, and RPCS3 in one compact dashboard.",
      screens: [
        { src: "/media/case-studies/gamedock/01-product-preview.png", alt: "GameDock panel preview", caption: "A compact Omarchy panel that unifies games from Steam, Heroic, RetroArch, and RPCS3 into one dashboard.", w: 1280, h: 720 },
      ],
    },
    {
      id: "omarchy-themes",
      title: "At home in Omarchy",
      intro: "Because it follows the Omarchy visual and theming system, the same panel adapts to the built-in Omarchy themes.",
      screens: [
        { src: "/media/case-studies/gamedock/02-theme-01.png", alt: "GameDock in an Omarchy theme", caption: "GameDock adapting to a built-in Omarchy theme.", w: 1920, h: 1080 },
        { src: "/media/case-studies/gamedock/03-theme-02.png", alt: "GameDock in a second Omarchy theme", caption: "The same panel under another Omarchy theme.", w: 1920, h: 1080 },
        { src: "/media/case-studies/gamedock/04-theme-03.png", alt: "GameDock in a third Omarchy theme", caption: "GameDock under a third Omarchy theme.", w: 1920, h: 1080 },
      ],
    },
  ],
  reflection: [
    "GameDock is a complete desktop product that I designed and built as an independent open-source project — from product direction and interface structure down to the launcher scanner, artwork pipeline, and keyboard interaction model.",
    "Most of the craft is in restraint: staying Omarchy-native, keeping the panel compact and self-contained, respecting the theming system, and handling missing metadata or artwork gracefully with clear fallbacks.",
    "It also demonstrates handling multiple heterogeneous data sources — four launchers with different metadata and launch paths — behind one consistent, fast in-memory browsing model.",
  ],
  sourceUrl: "https://github.com/Prathamesh913/gamedock",
};

export const allCaseStudies: CaseStudy[] = [
  gamedock,
  serviceChecklists,
  recognitionPlatform,
  policyAgentApp,
  mutualFundsApp,
  ashwiniFoods,
  icelandTourism,
];
