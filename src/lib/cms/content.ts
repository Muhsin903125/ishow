export interface LandingClientTestimonial {
  id: string;
  name: string;
  location: string | null;
  result_label: string | null;
  quote: string;
  rating: number;
  role?: string | null;
}

export interface LandingMethodStep {
  title: string;
  description: string;
}

export type LandingCapabilityIcon =
  | "Target"
  | "TrendingUp"
  | "Calendar"
  | "Utensils";

export interface LandingCapability {
  title: string;
  description: string;
  icon?: LandingCapabilityIcon;
  image?: string;
}

export interface LandingService {
  title: string;
  description: string;
  image?: string;
}

export interface LandingPackage {
  title: string;
  price: string;
  cadence: string;
  description: string;
  highlights: string[];
}

export interface LandingProofModule {
  eyebrow: string;
  title: string;
  description: string;
  metric: string;
  detail: string;
  media?: string;
}

export interface LandingClientConfig {
  hero?: {
    title?: string;
    subtitle?: string;
    cta_primary?: string;
    cta_secondary?: string;
  };
  methodology?: {
    title?: string;
    steps?: LandingMethodStep[];
  };
  coach?: {
    name?: string;
    quote?: string;
    experience?: string;
    specialty?: string;
  };
  capabilities?: {
    title?: string;
    items?: LandingCapability[];
  };
  services?: {
    items?: LandingService[];
  };
  packages?: {
    title?: string;
    items?: LandingPackage[];
  };
  proof?: {
    title?: string;
    intro?: string;
    items?: LandingProofModule[];
  };
  testimonials_title?: string;
  testimonials?: LandingClientTestimonial[];
}

export interface SitePageSection {
  title: string;
  body: string;
}

export interface SitePageStat {
  label: string;
  value: string;
}

export interface SitePageHighlight {
  eyebrow?: string;
  title: string;
  body: string;
  media?: string;
}

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContentArticle {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  meta_title?: string;
  meta_description?: string;
  read_time?: string;
  published_at?: string;
  body: string;
}

export interface BasicMarketingPage {
  meta_title?: string;
  meta_description?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  hero_media?: string;
  feature_media?: string;
  spotlight_quote?: string;
  sections?: SitePageSection[];
  stats?: SitePageStat[];
  highlights?: SitePageHighlight[];
  cta_title?: string;
  cta_body?: string;
  cta_label?: string;
  cta_href?: string;
}

export interface ContactPageContent extends BasicMarketingPage {
  channels?: ContactChannel[];
  service_areas?: string[];
  form_title?: string;
  form_intro?: string;
  form_button_label?: string;
  form_success_message?: string;
}

export interface FaqPageContent extends BasicMarketingPage {
  items?: FaqItem[];
}

export interface ContentHubPageContent extends BasicMarketingPage {
  articles?: ContentArticle[];
}

export interface SiteContentConfig {
  about?: BasicMarketingPage;
  contact?: ContactPageContent;
  faq?: FaqPageContent;
  services?: BasicMarketingPage;
  content_hub?: ContentHubPageContent;
}

export interface CMSContent extends LandingClientConfig {
  site_content?: SiteContentConfig;
}

export interface EditableCMSContent extends LandingClientConfig {
  hero: NonNullable<LandingClientConfig["hero"]>;
  methodology: {
    title?: string;
    steps: LandingMethodStep[];
  };
  coach: NonNullable<LandingClientConfig["coach"]>;
  testimonials: LandingClientTestimonial[];
  capabilities: {
    title?: string;
    items: LandingCapability[];
  };
  services: {
    items: LandingService[];
  };
  packages: {
    title?: string;
    items: LandingPackage[];
  };
  proof: {
    title?: string;
    intro?: string;
    items: LandingProofModule[];
  };
  site_content: {
    about: BasicMarketingPage;
    contact: ContactPageContent;
    faq: FaqPageContent;
    services: BasicMarketingPage;
    content_hub: ContentHubPageContent;
  };
}

function defaultBasicPage(overrides?: Partial<BasicMarketingPage>): BasicMarketingPage {
  return {
    meta_title: "",
    meta_description: "",
    eyebrow: "",
    title: "",
    intro: "",
    hero_media: "",
    feature_media: "",
    spotlight_quote: "",
    sections: [],
    stats: [],
    highlights: [],
    cta_title: "",
    cta_body: "",
    cta_label: "",
    cta_href: "/register",
    ...overrides,
  };
}

function defaultContactPage(overrides?: Partial<ContactPageContent>): ContactPageContent {
  return {
    ...defaultBasicPage(),
    channels: [],
    service_areas: [],
    form_title: "Send An Enquiry",
    form_intro:
      "Share your details and a quick note about what you need. We will add it to the admin lead queue and follow up.",
    form_button_label: "Send Enquiry",
    form_success_message:
      "Your enquiry has been sent. Our team will review it and follow up soon.",
    ...overrides,
  };
}

function defaultFaqPage(overrides?: Partial<FaqPageContent>): FaqPageContent {
  return {
    ...defaultBasicPage(),
    items: [],
    ...overrides,
  };
}

function defaultContentHubPage(
  overrides?: Partial<ContentHubPageContent>
): ContentHubPageContent {
  return {
    ...defaultBasicPage(),
    articles: [],
    ...overrides,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeCmsValue<T>(defaultValue: T, overrideValue: unknown): T {
  if (overrideValue === undefined || overrideValue === null) {
    return defaultValue;
  }

  if (typeof defaultValue === "string") {
    if (typeof overrideValue !== "string") {
      return defaultValue;
    }

    const trimmed = overrideValue.trim();
    return (trimmed.length ? overrideValue : defaultValue) as T;
  }

  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(overrideValue)) {
      return defaultValue;
    }

    return (overrideValue.length > 0 ? overrideValue : defaultValue) as T;
  }

  if (isPlainObject(defaultValue) && isPlainObject(overrideValue)) {
    const merged: Record<string, unknown> = { ...defaultValue };
    const keys = new Set([
      ...Object.keys(defaultValue as Record<string, unknown>),
      ...Object.keys(overrideValue),
    ]);

    for (const key of keys) {
      merged[key] = mergeCmsValue(
        (defaultValue as Record<string, unknown>)[key],
        overrideValue[key]
      );
    }

    return merged as T;
  }

  return overrideValue as T;
}

export function normalizeCMSContent(content?: CMSContent | null): EditableCMSContent {
  const merged = mergeCmsValue(createDefaultCMSContentSource(), content ?? {}) as CMSContent;

  return {
    ...merged,
    hero: merged.hero ?? {},
    methodology: {
      title: merged.methodology?.title,
      steps: merged.methodology?.steps ?? [],
    },
    coach: merged.coach ?? {},
    testimonials_title: merged.testimonials_title,
    testimonials: merged.testimonials ?? [],
    capabilities: {
      title: merged.capabilities?.title,
      items: merged.capabilities?.items ?? [],
    },
    services: {
      items: merged.services?.items ?? [],
    },
    packages: {
      title: merged.packages?.title,
      items: merged.packages?.items ?? [],
    },
    proof: {
      title: merged.proof?.title,
      intro: merged.proof?.intro,
      items: merged.proof?.items ?? [],
    },
    site_content: {
      about: defaultBasicPage(merged.site_content?.about),
      contact: defaultContactPage(merged.site_content?.contact),
      faq: defaultFaqPage(merged.site_content?.faq),
      services: defaultBasicPage(merged.site_content?.services),
      content_hub: defaultContentHubPage(merged.site_content?.content_hub),
    },
  };
}

function createDefaultCMSContentSource(): CMSContent {
  return {
    services: {
      items: [
        {
          title: "Complete Transformation",
          image:
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
          description:
            "Full protocol with training, nutrition direction, and high-accountability coaching.",
        },
        {
          title: "Elite Athleticism",
          image:
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
          description:
            "Explosive power, reactive agility, and raw strength for performance-minded clients.",
        },
        {
          title: "Nutrition Only Hub",
          image:
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
          description:
            "A nutrition-first track for people who already have their training base dialed in.",
        },
      ],
    },
    site_content: {
      about: {
        meta_title: "About iShow Transformation",
        meta_description:
          "Learn about iShow Transformation, the coaching philosophy, and personal training support across Dubai and the UAE.",
        eyebrow: "About iShow",
        title: "Built For Sustainable Transformation.",
        intro:
          "iShow Transformation combines direct coaching, behavior change, and clear execution for clients who want progress that lasts beyond short-term motivation.",
        sections: [
          {
            title: "Our Philosophy",
            body:
              "We focus on repeatable systems, honest coaching, and plans that fit real schedules instead of fantasy routines.",
          },
          {
            title: "Who We Serve",
            body:
              "We work with busy professionals, beginners rebuilding confidence, and clients who want accountability in Dubai, across the UAE, and online.",
          },
        ],
        hero_media:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80",
        feature_media:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80",
        spotlight_quote:
          "Good coaching should fit real life, not punish people for having one.",
        stats: [
          { label: "Coaching style", value: "Direct + respectful" },
          { label: "Client reach", value: "Dubai, UAE + online" },
          { label: "Focus", value: "Adherence over hype" },
        ],
        highlights: [
          {
            eyebrow: "Story",
            title: "Built for people who are done restarting",
            body:
              "The coaching system is designed for people who want momentum that survives work stress, travel, family life, and normal routines.",
            media:
              "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1200&q=80",
          },
          {
            eyebrow: "Approach",
            title: "Clarity before intensity",
            body:
              "We establish the baseline, build the right level of accountability, and remove the noise that usually kills consistency.",
          },
          {
            eyebrow: "Result",
            title: "Confidence that shows up outside the gym",
            body:
              "The aim is not only a visual change. It is better posture, better routines, and more ease in public life.",
          },
        ],
        cta_title: "Ready To Talk Through Your Goals?",
        cta_body:
          "Use the consultation flow to share your baseline, schedule, and transformation target.",
        cta_label: "Start Your Assessment",
        cta_href: "/register",
      },
      contact: {
        meta_title: "Contact iShow Transformation",
        meta_description:
          "Get in touch with iShow Transformation for coaching consultations in Dubai, UAE, and online.",
        eyebrow: "Contact",
        title: "Start The Conversation.",
        intro:
          "Reach out for consultations, coaching questions, or help choosing the right starting point for your goals.",
        sections: [
          {
            title: "Consultation First",
            body:
              "The fastest way to get started is the assessment flow. It gives us the context needed to recommend the right coaching path.",
          },
        ],
        hero_media:
          "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1600&q=80",
        feature_media:
          "https://images.unsplash.com/photo-1518611012118-f8478f61a9c7?auto=format&fit=crop&w=1600&q=80",
        spotlight_quote:
          "Tell us where you are starting, what feels hard right now, and what support would actually help.",
        stats: [
          { label: "Response style", value: "Human follow-up" },
          { label: "Enquiry route", value: "Open contact form" },
          { label: "Formats", value: "Dubai + online" },
        ],
        highlights: [
          {
            eyebrow: "Guidance",
            title: "Not sure where to start? That is normal.",
            body:
              "You do not need to know the exact package or training path before you contact us. The enquiry form is there to start the conversation clearly.",
          },
          {
            eyebrow: "Support",
            title: "Share the real version of your schedule",
            body:
              "The best first conversation is honest about work, family, travel, consistency, and what has not worked before.",
          },
        ],
        channels: [
          {
            label: "Instagram",
            value: "@sufiyan_mohd26",
            href: "https://www.instagram.com/sufiyan_mohd26/",
          },
          {
            label: "Website",
            value: "iShow Transformation",
            href: "/register",
          },
        ],
        service_areas: ["Dubai", "UAE", "Online Coaching"],
        form_title: "Start With A Simple Enquiry",
        form_intro:
          "No login required. Tell us a little about yourself and we will create a lead in the admin portal for follow-up.",
        form_button_label: "Send Enquiry",
        form_success_message:
          "Thanks for reaching out. Your enquiry has been received and added to our lead desk.",
        cta_title: "Prefer A Guided Start?",
        cta_body: "Share your current baseline and we will guide the next step.",
        cta_label: "Take The Assessment",
        cta_href: "/register",
      },
      faq: {
        meta_title: "Frequently Asked Questions | iShow Transformation",
        meta_description:
          "Answers to common questions about coaching, assessments, scheduling, and online personal training with iShow Transformation.",
        eyebrow: "FAQ",
        title: "Questions Before You Commit.",
        intro:
          "These are the most common questions clients ask before starting coaching.",
        items: [
          {
            question: "Do you coach clients online?",
            answer:
              "Yes. iShow supports online coaching for clients who need remote accountability, programming, and progress tracking.",
          },
          {
            question: "Is the assessment required?",
            answer:
              "Yes. The assessment helps establish your baseline, schedule, and goal priorities before programming begins.",
          },
          {
            question: "Do I need gym experience first?",
            answer:
              "No. The coaching system is designed to support beginners as well as experienced clients.",
          },
        ],
        cta_title: "Still Need Clarification?",
        cta_body: "Reach out or start the assessment and we can guide you from there.",
        cta_label: "Contact iShow",
        cta_href: "/contact",
      },
      services: {
        meta_title: "Fitness Services | iShow Transformation",
        meta_description:
          "Explore iShow Transformation fitness services, training packages, and coaching formats available in Dubai, across the UAE, and online.",
        eyebrow: "Services",
        title: "Fitness Services Built Around Real Adherence.",
        intro:
          "Choose from focused coaching formats built for fat loss, strength, confidence, and sustainable execution.",
        sections: [
          {
            title: "Coaching First",
            body:
              "Every service is grounded in real coaching, not generic PDFs. We adapt the plan around your schedule, baseline, and lifestyle constraints.",
          },
          {
            title: "Who These Services Fit",
            body:
              "These offers are designed for beginners, returning clients, and busy professionals who want structure, accountability, and measurable progress.",
          },
        ],
        hero_media:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80",
        feature_media:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80",
        spotlight_quote:
          "Services are matched to your life, not the other way around.",
        stats: [
          { label: "Delivery", value: "1-on-1 coaching" },
          { label: "Coverage", value: "Training + nutrition" },
          { label: "Availability", value: "In person + online" },
        ],
        highlights: [
          {
            eyebrow: "Fat loss",
            title: "For people chasing visible body change",
            body:
              "Structured coaching for clients who want fat loss, more confidence, and a system that is sustainable outside of short challenges.",
            media:
              "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
          },
          {
            eyebrow: "Strength",
            title: "For people rebuilding power and consistency",
            body:
              "A stronger weekly rhythm, cleaner training decisions, and sessions that respect your current level instead of ego lifting.",
          },
          {
            eyebrow: "Lifestyle",
            title: "For busy schedules that still need progress",
            body:
              "Services are designed around execution, not idealized routines that collapse the moment life gets heavy.",
          },
        ],
        cta_title: "Need Help Choosing The Right Fit?",
        cta_body:
          "Start with the assessment and we will point you toward the service level that matches your goals and starting point.",
        cta_label: "Start Your Assessment",
        cta_href: "/register",
      },
      content_hub: {
        meta_title: "Training Insights | iShow Transformation",
        meta_description:
          "Read fitness and coaching insights from iShow Transformation for fat loss, strength, confidence, and sustainable progress.",
        eyebrow: "Content",
        title: "Practical Coaching Insights.",
        intro:
          "A growing library of articles for clients who want better decisions, not more noise.",
        articles: [
          {
            slug: "fat-loss-coaching-dubai",
            title: "What Fat Loss Coaching In Dubai Should Actually Look Like",
            category: "Fat Loss",
            excerpt:
              "A practical look at what clients should expect from real coaching instead of generic challenges and short-lived motivation.",
            meta_title: "Fat Loss Coaching In Dubai | iShow Transformation",
            meta_description:
              "Understand what effective fat loss coaching in Dubai should include: accountability, personalization, and sustainable habits.",
            read_time: "5 min read",
            published_at: "2026-04-23",
            body:
              "Fat loss coaching works best when it is built around adherence, realistic scheduling, and honest feedback. The biggest mistake most people make is chasing intensity without a system. A good coach helps define the baseline, removes unnecessary complexity, and creates routines that can survive work stress, social events, and normal life.\n\nIn practice, that means the plan should include a clear training structure, simple nutrition targets, and frequent check-ins that make progress visible. The goal is not to feel perfect for one week. The goal is to create enough consistency that results keep compounding.",
          },
        ],
        cta_title: "Want Personalized Guidance?",
        cta_body:
          "Content can help you think clearly. Coaching helps you execute consistently.",
        cta_label: "Work With iShow",
        cta_href: "/register",
      },
    },
    packages: {
      title: "Packages For Different Starting Points.",
      items: [
        {
          title: "Starter Reset",
          price: "AED 899",
          cadence: "per month",
          description:
            "A guided reset for clients who need accountability, session structure, and a realistic way to regain momentum.",
          highlights: [
            "Weekly coaching structure",
            "Session scheduling support",
            "Habit and adherence check-ins",
          ],
        },
        {
          title: "Transformation Coaching",
          price: "AED 1499",
          cadence: "per month",
          description:
            "For clients chasing visible body composition change with closer oversight across training, nutrition, and progress reviews.",
          highlights: [
            "Training and nutrition direction",
            "Progress review rhythm",
            "Higher-touch accountability",
          ],
        },
        {
          title: "Performance Build",
          price: "Custom",
          cadence: "pricing on consult",
          description:
            "For clients who want a more tailored performance or lifestyle package built around unique scheduling or athletic targets.",
          highlights: [
            "Custom scope and targets",
            "Priority programming support",
            "Built around your constraints",
          ],
        },
      ],
    },
    proof: {
      title: "Better bodies. Better habits. No public shame.",
      intro:
        "We are not selling humiliation content or fake perfection. We coach people through real-life progress they can actually keep.",
      items: [
        {
          eyebrow: "Wabi-Sabi Progress",
          title: "Visible change without fake perfection",
          description:
            "We coach for honest momentum: stronger habits, cleaner sessions, steadier energy, and a body that looks like someone living well.",
          metric: "Week by week",
          detail:
            "Measured through check-ins, adherence, and realistic progression.",
        },
        {
          eyebrow: "Public Confidence",
          title: "Feel better showing up outside the gym",
          description:
            "The goal is not staged comparison content. The goal is walking into work, brunch, or the beach with more confidence and less self-consciousness.",
          metric: "Daily life",
          detail: "Better fit, better posture, better presence in public.",
        },
        {
          eyebrow: "Respectful Coaching",
          title: "Direct support with zero public shaming",
          description:
            "No humiliation tactics. No pressure theater. Just clear standards, better accountability, and a coach who adjusts to real life.",
          metric: "1 coach",
          detail: "One relationship built on trust, not embarrassment.",
        },
      ],
    },
  };
}

export function getDefaultCMSContent(): EditableCMSContent {
  return normalizeCMSContent(createDefaultCMSContentSource());
}
