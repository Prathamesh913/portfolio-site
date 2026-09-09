// Blog records — Medium articles.
// Sources of truth: the author's Medium RSS feed (medium.com/feed/@prathameshjadhav913)
// and each article's live page (og:title, og:description, og:image, article:published_time,
// and the reading-time label rendered on the page). Text is preserved verbatim from
// the source pages. Cover images were recovered from each article's og:image and
// are stored locally under public/media/blogs/. Missing content is omitted, never invented.
//
// Older technical/data-science articles (Understanding the Fundamentals of OOPS in
// Python, Decision Tree, Classification Vs Regression) are intentionally excluded to
// keep the portfolio focused on UI/UX, product design, and product thinking.

import type { BlogPost } from "./types";

// Series id -> display label. The label comes from the shared Medium topic tag
// ("enterprise-ux") carried by all six parts. No series description exists on
// Medium, so none is shown.
export const blogSeries: Record<string, string> = {
  "enterprise-ux": "Enterprise UX",
};

export const blogPosts: BlogPost[] = [
  // ---------------------------------------------------------------------------
  // Enterprise UX series — publication order 1..6
  // ---------------------------------------------------------------------------
  {
    slug: "part-1-why-your-work-software-feels-like-punishment",
    title: "Part 1: Why Your Work Software Feels Like Punishment",
    description: "You live in two digital universes.",
    date: "2025-11-15",
    readingTime: 6,
    tags: ["software-it", "ux", "enterprise-design", "product-design", "user-experience"],
    url: "https://medium.com/@prathameshjadhav913/part-1-why-your-work-software-feels-like-punishment-b4ed3809ae5c",
    image: { src: "/media/blogs/part-1-why-your-work-software-feels-like-punishment.png", alt: "" },
    series: "enterprise-ux",
    seriesOrder: 1,
  },
  {
    slug: "part-2-clicks-errors-and-burnout",
    title: "Part 2: Clicks, Errors, and Burnout",
    description:
      "In the first post, we established why your work software is so frustrating. It’s built to impress the buyers, not to help the users.",
    date: "2025-11-25",
    readingTime: 5,
    tags: ["productivity", "product-design", "employee-experience", "enterprise-software", "ux"],
    url: "https://medium.com/@prathameshjadhav913/part-2-clicks-errors-and-burnout-0a05cfb2c126",
    image: { src: "/media/blogs/part-2-clicks-errors-and-burnout.gif", alt: "" },
    series: "enterprise-ux",
    seriesOrder: 2,
  },
  {
    slug: "part-3-escaping-the-stone-age",
    title: "Part 3: A Modern Plan for Workplace Software",
    description: "So far, we’ve established two uncomfortable truths:",
    date: "2025-12-08",
    readingTime: 5,
    tags: ["employee-engagement", "enterprise-ux", "product-management", "product-design", "employee-experience"],
    url: "https://medium.com/@prathameshjadhav913/part-3-escaping-the-stone-age-3fbd327a56b1",
    image: { src: "/media/blogs/part-3-escaping-the-stone-age.png", alt: "" },
    series: "enterprise-ux",
    seriesOrder: 3,
  },
  {
    slug: "part-4-the-political-playbook",
    title: "Part 4: The Political Playbook",
    description:
      "So you’ve read the first three posts (If not I request you to read them). You’re convinced that your enterprise software is costing the company a fortune. You’ve calculated the ROI. You’ve documented the pain points. You’re ready to fix this.",
    date: "2026-02-11",
    readingTime: 9,
    tags: ["enterprise-ux", "product-design", "stakeholder-management", "employee-engagement", "product-management"],
    url: "https://medium.com/@prathameshjadhav913/part-4-the-political-playbook-b13e366fd0d8",
    image: { src: "/media/blogs/part-4-the-political-playbook.png", alt: "" },
    series: "enterprise-ux",
    seriesOrder: 4,
  },
  {
    slug: "part-5-the-vendor-trap",
    title: "Part 5: The Vendor Trap",
    description: "So you’ve read the first four posts (If not I request you to read them).",
    date: "2026-02-11",
    readingTime: 3,
    tags: ["product-design", "employee-software", "vendor-management", "enterprise-ux", "product-management"],
    url: "https://medium.com/@prathameshjadhav913/part-5-the-vendor-trap-85b5dfa4be5b",
    image: { src: "/media/blogs/part-5-the-vendor-trap.png", alt: "" },
    series: "enterprise-ux",
    seriesOrder: 5,
  },
  {
    slug: "part-6-proving-it-worked",
    title: "Part 6: Proving It Worked",
    description: "So you’ve read the first five posts (If not I request you to read them).",
    date: "2026-02-12",
    readingTime: 2,
    tags: ["product-design", "employee-software", "product-management", "metrics-and-analytics", "enterprise-ux"],
    url: "https://medium.com/@prathameshjadhav913/part-6-proving-it-worked-3382c13e5f38",
    image: { src: "/media/blogs/part-6-proving-it-worked.png", alt: "" },
    series: "enterprise-ux",
    seriesOrder: 6,
  },

  // ---------------------------------------------------------------------------
  // Standalone design / product articles — newest first
  // ---------------------------------------------------------------------------
  {
    slug: "closing-the-feedback-loop-for-better-corporate-travel-experiences",
    title: "Closing the Feedback Loop for Better Corporate Travel Experiences",
    description:
      "How do you ensure employee feedback about travel experiences doesn’t just disappear into a void? We set out to create a platform that not only captures post-trip feedback from employees but also gives the Travel Admin team tools to act on it — closing the feedback loop, improving services, and building trust.",
    date: "2025-07-05",
    readingTime: 4,
    tags: ["case-study", "design", "ui-ux", "design-process", "ux-design"],
    url: "https://medium.com/@prathameshjadhav913/closing-the-feedback-loop-for-better-corporate-travel-experiences-aeeb68e8b99f",
    image: { src: "/media/blogs/closing-the-feedback-loop-for-better-corporate-travel-experiences.jpeg", alt: "" },
  },
  {
    slug: "simplifying-travel-our-itinerary-booking-makeover",
    title: "Simplifying Travel: Our Itinerary Booking Makeover",
    description:
      "Imagine you’re trying to book a super complicated travel Itinerary with multiple modes of transport and a handful of guests. You want everything to go smoothly, but there’s a catch: you can’t see all the details before hitting that “Book Now” button. Talk about a buzzkill!",
    date: "2025-07-05",
    readingTime: 3,
    tags: ["travel", "case-study", "booking", "ui-ux", "ux-design"],
    url: "https://medium.com/@prathameshjadhav913/simplifying-travel-our-itinerary-booking-makeover-f56923351a17",
    image: { src: "/media/blogs/simplifying-travel-our-itinerary-booking-makeover.jpeg", alt: "" },
  },
  {
    slug: "workwise-the-ultimate-tool-for-small-business-owners-and-freelancers",
    title: "WorkWise — The ultimate tool for small business owners and freelancers.",
    description: "A UI/UX case study for productivity app.",
    date: "2023-04-05",
    readingTime: 3,
    tags: ["productivity", "app-design", "ui-design", "ui-ux-case-study", "case-study"],
    url: "https://medium.com/@prathameshjadhav913/workwise-the-ultimate-tool-for-small-business-owners-and-freelancers-5c9b45fa3b72",
    image: { src: "/media/blogs/workwise-the-ultimate-tool-for-small-business-owners-and-freelancers.jpeg", alt: "" },
  },
  {
    slug: "timefeed-feed-your-bored-time-the-fun-it-deserves",
    title: "TimeFeed- feed your bored time the fun it deserves",
    description:
      "Don’t know what to do on the weekends? Yes, this is the basic question that everyone asks themselves every weekend and anytime they have free time to spend but end up wasting every time since they don’t have a plan.",
    date: "2022-07-28",
    readingTime: 3,
    tags: ["ux-design", "apps", "ui", "ux", "case-study"],
    url: "https://medium.com/@prathameshjadhav913/timefeed-feed-your-bored-time-the-fun-it-deserves-95f7d59b7e2d",
    image: { src: "/media/blogs/timefeed-feed-your-bored-time-the-fun-it-deserves.jpeg", alt: "" },
  },
];
