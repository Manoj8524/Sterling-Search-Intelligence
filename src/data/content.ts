import { resorts, slugify } from "./resorts";

export type Priority = "P1" | "P2" | "P3";
export type Level = "Very High" | "High" | "Medium" | "Low";
export type Coverage = "Strong" | "Partial" | "Missing";
export type Severity = "Critical" | "High" | "Medium" | "Low";

/* ------------------------------------------------------------------ Keywords */

export interface Keyword {
  id: string;
  keyword: string;
  resortId: string;
  resort: string;
  position: number;
  previousPosition: number;
  volume: number;
  difficulty: number;
  intent: "Commercial" | "Informational" | "Local" | "Navigational" | "Transactional";
  opportunity: Level;
  url: string;
}

const intents: Keyword["intent"][] = [
  "Commercial",
  "Informational",
  "Local",
  "Navigational",
  "Transactional",
];

const templates = [
  { t: (c: string) => `resorts in ${c}`, intent: 0, vol: 12100, diff: 62 },
  { t: (c: string) => `best resorts in ${c}`, intent: 0, vol: 8400, diff: 57 },
  { t: (c: string) => `family resorts in ${c}`, intent: 0, vol: 3200, diff: 44 },
  { t: (c: string) => `luxury resorts in ${c}`, intent: 0, vol: 2600, diff: 55 },
  { t: (c: string) => `resorts near ${c} lake`, intent: 2, vol: 2100, diff: 39 },
  { t: (c: string) => `${c} hotels with pool`, intent: 2, vol: 1900, diff: 36 },
  { t: (c: string) => `things to do in ${c}`, intent: 1, vol: 14800, diff: 48 },
  { t: (c: string) => `best time to visit ${c}`, intent: 1, vol: 9600, diff: 41 },
  { t: (c: string) => `couple friendly resorts ${c}`, intent: 0, vol: 1700, diff: 38 },
  { t: (c: string) => `${c} resort booking`, intent: 4, vol: 1400, diff: 33 },
  { t: (c: string) => `sterling ${c}`, intent: 3, vol: 5400, diff: 21 },
  { t: (c: string) => `weekend getaway near ${c}`, intent: 1, vol: 2900, diff: 45 },
];

const oppFor = (position: number, volume: number): Level => {
  if (position > 10 && volume > 3000) return "Very High";
  if (position > 10) return "High";
  if (position > 3) return "Medium";
  return "Low";
};

export const keywords: Keyword[] = resorts.flatMap((r, ri) =>
  templates.map((tpl, ti) => {
    const base = tpl.t(r.city);
    const position = Math.max(
      1,
      Math.round(((100 - r.seo) / 8) * (1 + (ti % 5) * 0.55) + ((ri + ti) % 4)),
    );
    const volume = Math.round(tpl.vol * (0.55 + ((ri % 7) + 2) / 12));
    return {
      id: slugify(`${r.id}-${base}`),
      keyword: base,
      resortId: r.id,
      resort: r.shortName,
      position,
      previousPosition: position + ((ri + ti) % 7) - 3,
      volume,
      difficulty: tpl.diff + ((ri % 5) - 2),
      intent: intents[tpl.intent]!,
      opportunity: oppFor(position, volume),
      url: `${r.url}${ti % 3 === 0 ? "" : ti % 3 === 1 ? "/rooms" : "/things-to-do"}`,
    };
  }),
);

// Pin the demo-journey keyword values exactly.
const pin = (kw: string, resortId: string, patch: Partial<Keyword>) => {
  const k = keywords.find((x) => x.keyword === kw && x.resortId === resortId);
  if (k) Object.assign(k, patch);
};
pin("resorts in Ooty", "sterling-ooty-elk-hill", { position: 8, volume: 12100, difficulty: 62, opportunity: "High" });
pin("best resorts in Ooty", "sterling-ooty-elk-hill", { position: 11, volume: 8400, difficulty: 57, opportunity: "High" });
pin("family resorts in Ooty", "sterling-ooty-elk-hill", { position: 18, volume: 3200, difficulty: 44, opportunity: "Very High" });
pin("resorts near Ooty lake", "sterling-ooty-fern-hill", { position: 14, volume: 2100, difficulty: 39, opportunity: "High" });

export const getKeyword = (id: string) => keywords.find((k) => k.id === id);

/* ----------------------------------------------------------------- Questions */

export interface Question {
  id: string;
  question: string;
  resortId: string;
  resort: string;
  cluster: string;
  intent: "Discovery" | "Commercial" | "Informational" | "Navigational";
  coverage: Coverage;
  answerScore: number;
  opportunity: Level;
  volume: number;
  missing: string[];
  currentAnswer: string;
  structure: string[];
}

export const faqClusters = [
  "Rooms",
  "Dining",
  "Family Travel",
  "Couples",
  "Activities",
  "Location",
  "Accessibility",
  "Check-in / Check-out",
  "Nearby Attractions",
  "Resort Facilities",
  "Pet Policy",
  "Travel Information",
];

const qTemplates: {
  t: (c: string, n: string) => string;
  cluster: string;
  intent: Question["intent"];
  base: number;
}[] = [
  { t: (c) => `What are the best resorts in ${c}?`, cluster: "Location", intent: "Discovery", base: 54 },
  { t: (_, n) => `Is ${n} good for families?`, cluster: "Family Travel", intent: "Commercial", base: 22 },
  { t: (_, n) => `Does ${n} have a swimming pool?`, cluster: "Resort Facilities", intent: "Informational", base: 91 },
  { t: (_, n) => `What activities are available at ${n}?`, cluster: "Activities", intent: "Informational", base: 68 },
  { t: (c, n) => `How far is ${n} from ${c} town?`, cluster: "Location", intent: "Informational", base: 74 },
  { t: (_, n) => `Is ${n} pet friendly?`, cluster: "Pet Policy", intent: "Informational", base: 38 },
  { t: (c) => `What is the best time to visit ${c}?`, cluster: "Travel Information", intent: "Discovery", base: 61 },
  { t: (c) => `Which resort is best for couples in ${c}?`, cluster: "Couples", intent: "Commercial", base: 44 },
  { t: (_, n) => `What are the check-in and check-out times at ${n}?`, cluster: "Check-in / Check-out", intent: "Informational", base: 86 },
  { t: (_, n) => `What dining options are available at ${n}?`, cluster: "Dining", intent: "Informational", base: 57 },
  { t: (_, n) => `What are the nearby attractions around ${n}?`, cluster: "Nearby Attractions", intent: "Discovery", base: 49 },
  { t: (_, n) => `Does ${n} have wheelchair accessible rooms?`, cluster: "Accessibility", intent: "Informational", base: 31 },
  { t: (_, n) => `What room types are available at ${n}?`, cluster: "Rooms", intent: "Commercial", base: 72 },
];

const missingPool = [
  "Family room details",
  "Child-friendly facilities",
  "Activity schedule",
  "Dining options",
  "Nearby attractions",
  "Distance from major attractions",
  "Pricing guidance",
  "Accessibility details",
  "Seasonal information",
  "Pet policy specifics",
];

const clusterStructure: Record<string, string[]> = {
  Location: ["Direct answer with distance and drive time", "Nearest airport and railway station", "Route options and road conditions", "Landmarks used for orientation", "Map embed", "Booking CTA"],
  "Family Travel": ["Direct answer naming the resort", "Family room and connecting-room options", "Facilities for children", "Kids activity schedule", "Family dining and meal plans", "Booking CTA"],
  "Resort Facilities": ["Direct yes or no answer", "Facility specifications and timings", "Access rules and supervision", "Seasonal availability", "Photographs", "Booking CTA"],
  Activities: ["Direct answer with activity count", "On-property activities by age group", "Guided experiences and excursions", "Timings and charges", "Booking CTA"],
  "Pet Policy": ["Direct yes or no answer", "Size and breed conditions", "Applicable charges and deposits", "Pet-friendly room categories", "House rules", "Booking CTA"],
  "Travel Information": ["Direct answer naming the best months", "Month-by-month weather", "Peak and off-peak pricing", "What to pack", "Festivals and local events", "Booking CTA"],
  Couples: ["Direct answer naming the resort", "Private and premium room categories", "Romantic dining and spa options", "Curated couple experiences", "Honeymoon packages", "Booking CTA"],
  "Check-in / Check-out": ["Direct answer with exact times", "Early check-in and late check-out policy", "Identification requirements", "Baggage storage", "Contact for exceptions"],
  Dining: ["Direct answer with restaurant count", "Restaurants, cuisines and timings", "Meal plans included", "Dietary and child menus", "In-room dining", "Booking CTA"],
  "Nearby Attractions": ["Direct answer listing top attractions", "Distance and travel time for each", "Entry fees and timings", "Suggested day itineraries", "Transport options"],
  Accessibility: ["Direct yes or no answer", "Accessible room details", "Step-free routes and facilities", "Assistance available on request", "Contact for specific needs"],
  Rooms: ["Direct answer with room-type count", "Room categories with occupancy and size", "Views and layouts", "Inclusions per category", "Indicative pricing", "Booking CTA"],
};

const clusterMissing: Record<string, string[]> = {
  Location: ["Drive time from town centre", "Nearest airport distance", "Route guidance", "Landmark references"],
  "Family Travel": ["Family room details", "Child-friendly facilities", "Kids activity schedule", "Family dining options"],
  "Resort Facilities": ["Facility timings", "Pool depth and supervision", "Seasonal availability", "Facility photographs"],
  Activities: ["Activity schedule", "Age suitability", "Charges per activity", "Booking process"],
  "Pet Policy": ["Pet size limits", "Applicable pet charges", "Pet-friendly room list", "House rules"],
  "Travel Information": ["Month-by-month weather", "Peak season guidance", "Packing advice", "Local event calendar"],
  Couples: ["Private dining options", "Spa and wellness detail", "Honeymoon inclusions", "Premium room comparison"],
  "Check-in / Check-out": ["Exact check-in time", "Late check-out policy", "ID requirements", "Baggage storage"],
  Dining: ["Restaurant timings", "Cuisine detail", "Meal plan inclusions", "Dietary options"],
  "Nearby Attractions": ["Distance from major attractions", "Entry fees and timings", "Suggested itineraries", "Local transport options"],
  Accessibility: ["Accessible room details", "Step-free route information", "Assistance available", "Bathroom specifications"],
  Rooms: ["Room size and occupancy", "View descriptions", "Category inclusions", "Pricing guidance"],
};

const coverageFor = (score: number): Coverage =>
  score >= 75 ? "Strong" : score >= 40 ? "Partial" : "Missing";

export const questions: Question[] = resorts.flatMap((r, ri) =>
  qTemplates.map((q, qi) => {
    const score = Math.max(
      8,
      Math.min(97, q.base + Math.round((r.aeo - 65) * 0.7) + (((ri + qi) % 5) - 2) * 3),
    );
    const coverage = coverageFor(score);
    return {
      id: slugify(`${r.id}-q-${qi}`),
      question: q.t(r.city, r.name),
      resortId: r.id,
      resort: r.shortName,
      cluster: q.cluster,
      intent: q.intent,
      coverage,
      answerScore: score,
      opportunity: score < 35 ? "Very High" : score < 60 ? "High" : score < 80 ? "Medium" : "Low",
      volume: 320 + ((ri * 37 + qi * 91) % 2400),
      missing: (clusterMissing[q.cluster] ?? missingPool).slice(0, score < 40 ? 4 : score < 75 ? 3 : 2),
      currentAnswer:
        coverage === "Missing"
          ? `No dedicated answer found on ${r.name} pages. Answer engines currently source this from third-party travel sites.`
          : coverage === "Partial"
            ? `${r.name} pages partially answer this, but the answer is buried in descriptive copy and lacks a direct, extractable summary.`
            : `${r.name} provides a clear, structured answer with supporting detail and FAQ schema.`,
      structure: clusterStructure[q.cluster] ?? [
        "Direct answer",
        "Supporting detail",
        "Practical information",
        "Booking CTA",
      ],
    };
  }),
);

// Demo journey question
questions.unshift({
  id: "ooty-best-family-resort",
  question: "Which is the best family resort in Ooty?",
  resortId: "sterling-ooty-elk-hill",
  resort: "Ooty Elk Hill",
  cluster: "Family Travel",
  intent: "Commercial",
  coverage: "Partial",
  answerScore: 54,
  opportunity: "Very High",
  volume: 2840,
  missing: [
    "Family room details",
    "Child-friendly facilities",
    "Activities",
    "Dining options",
    "Nearby attractions",
    "Distance from major attractions",
  ],
  currentAnswer:
    "Sterling Ooty Elk Hill pages describe the property and its hillside setting, but do not directly answer which Sterling resort is best for families in Ooty, and do not summarise family facilities in an extractable format.",
  structure: [
    "Direct answer",
    "Resort recommendation",
    "Facilities",
    "Family activities",
    "Nearby attractions",
    "Booking CTA",
  ],
});

export const getQuestion = (id: string) => questions.find((q) => q.id === id);

/* ---------------------------------------------------------------- AI queries */

export interface AiQuery {
  id: string;
  query: string;
  platform: "ChatGPT" | "Google AI" | "Gemini" | "Perplexity" | "Copilot";
  resortId: string;
  resort: string;
  sterlingMentioned: boolean;
  mentionedResorts: string[];
  notMentionedResorts: string[];
  recommendationPosition: number | null;
  competitors: string[];
  citations: { source: string; sterling: boolean }[];
  sterlingCitationPosition: number | null;
  opportunity: Level;
  visibility: "Strong" | "Moderate" | "Weak" | "None";
  response: string;
}

const platforms: AiQuery["platform"][] = ["ChatGPT", "Google AI", "Gemini", "Perplexity", "Copilot"];
const compPool = ["Club Mahindra", "Taj Holidays", "Radisson", "Airbnb", "MakeMyTrip", "Independent boutique stays"];
const sourcePool = ["Tripadvisor", "MakeMyTrip", "Travel blogs", "Booking.com", "Holidify", "Sterling Holidays"];

const aiTemplates = [
  (c: string) => `Best resorts in ${c} for families`,
  (c: string) => `Best luxury resorts in ${c}`,
  (c: string) => `Where should I stay in ${c} with kids?`,
  (c: string) => `Best resort in ${c} with views`,
  (c: string) => `Is ${c} worth visiting in December?`,
  (c: string) => `Weekend getaway resorts near ${c}`,
];

const aiResponseCopy: { hit: (c: string, n: string, k: string) => string; miss: (c: string, k: string, k2: string) => string }[] = [
  {
    hit: (c, n, k) => `For families visiting ${c}, ${n} is usually suggested alongside ${k}. The answer highlights connecting family rooms, a supervised kids activity programme and safe outdoor space, and notes that the property is an easy drive from the main sights in ${c}.`,
    miss: (c, k, k2) => `Family recommendations for ${c} centre on ${k} and ${k2}, with homestays mentioned for larger groups. The answer cites kids clubs and family suites as the deciding factors — no Sterling property appears in the list.`,
  },
  {
    hit: (c, n, k) => `Among premium stays in ${c}, ${n} is described as a comfortable upper-mid option with the strongest views, positioned just below ${k} on service and spa facilities.`,
    miss: (c, k, k2) => `The luxury shortlist for ${c} is dominated by ${k} and ${k2}, both cited for spa, fine dining and heritage character. Sterling is absent because no page presents premium room categories or suite detail in a comparable way.`,
  },
  {
    hit: (c, n, k) => `Asked where to stay in ${c} with children, the answer names ${n} for its enclosed grounds, indoor play area and early dinner service, and compares it directly with ${k}.`,
    miss: (c, k, k2) => `For travelling with children in ${c}, the answer recommends ${k}, ${k2} and two independent properties, citing childcare, play areas and child menus — none of which Sterling content currently states explicitly.`,
  },
  {
    hit: (c, n, k) => `${n} is called out for its outlook over the ${c} valley, with the answer contrasting the view-facing rooms against ${k} and noting the best months for clear visibility.`,
    miss: (c, k, k2) => `View-led recommendations for ${c} list ${k} and ${k2} plus boutique stays, all citing room-level view descriptions. Sterling pages describe the setting but never label which rooms have the view.`,
  },
  {
    hit: (c, n, k) => `On December travel to ${c}, the answer says the season is popular and cold, recommends booking early, and mentions ${n} together with ${k} as reliable options for the peak weeks.`,
    miss: (c, k, k2) => `The answer covers December weather, crowds and festival timing in ${c}, then suggests ${k} and ${k2} for the season. Sterling is not mentioned because there is no seasonal travel guidance on the resort pages.`,
  },
  {
    hit: (c, n, k) => `For a weekend break near ${c}, ${n} is presented as a short-drive option with two-night packages, compared against ${k} on price and activities.`,
    miss: (c, k, k2) => `Weekend getaway answers for ${c} favour ${k} and ${k2}, citing drive-time guides and two-night package pages that Sterling has not published for this destination.`,
  },
];

export const aiQueries: AiQuery[] = resorts.slice(0, 14).flatMap((r, ri) =>
  aiTemplates.map((tpl, ti) => {
    const mentioned = (r.geo + ti * 7 + ri * 3) % 100 > 52;
    const cited = mentioned && (ri + ti) % 2 === 0;
    return {
      id: slugify(`${r.id}-ai-${ti}`),
      query: tpl(r.city),
      platform: platforms[(ri + ti) % platforms.length]!,
      resortId: r.id,
      resort: r.shortName,
      sterlingMentioned: mentioned,
      mentionedResorts: mentioned ? [r.name] : [],
      notMentionedResorts: mentioned ? [] : [r.name],
      recommendationPosition: mentioned ? ((ri + ti) % 4) + 1 : null,
      competitors: compPool.slice((ri + ti) % 3, ((ri + ti) % 3) + 3),
      citations: sourcePool
        .slice((ti % 3), (ti % 3) + 3)
        .map((s) => ({ source: s, sterling: s === "Sterling Holidays" }))
        .concat(cited ? [{ source: "Sterling Holidays", sterling: true }] : []),
      sterlingCitationPosition: cited ? ((ri + ti) % 3) + 2 : null,
      opportunity: mentioned ? (cited ? "Low" : "Medium") : "Very High",
      visibility: mentioned ? (cited ? "Strong" : "Moderate") : "None",
      response: mentioned
        ? aiResponseCopy[ti]!.hit(r.city, r.name, compPool[(ri + ti) % 3]!)
        : aiResponseCopy[ti]!.miss(r.city, compPool[(ri + ti) % 3]!, compPool[((ri + ti) % 3) + 1]!),
    };
  }),
);

aiQueries.unshift(
  {
    id: "ooty-family-ai",
    query: "Best family resorts in Ooty",
    platform: "ChatGPT",
    resortId: "sterling-ooty-elk-hill",
    resort: "Ooty Elk Hill",
    sterlingMentioned: false,
    mentionedResorts: [],
    notMentionedResorts: ["Sterling Ooty Elk Hill", "Sterling Ooty Fern Hill"],
    recommendationPosition: null,
    competitors: ["Club Mahindra", "Taj Holidays", "Airbnb"],
    citations: [
      { source: "Tripadvisor", sterling: false },
      { source: "MakeMyTrip", sterling: false },
      { source: "Travel blogs", sterling: false },
    ],
    sterlingCitationPosition: null,
    opportunity: "Very High",
    visibility: "None",
    response:
      "For a family vacation in Ooty, frequently suggested options include Club Mahindra Ooty, a few Taj properties in the Nilgiris and several independent hillside resorts. Families often highlight properties with large lawns, indoor activity rooms and easy access to Ooty Lake and the Botanical Garden.",
  },
  {
    id: "ooty-luxury-ai",
    query: "Best luxury resorts in Ooty",
    platform: "Perplexity",
    resortId: "sterling-ooty-elk-hill",
    resort: "Ooty Elk Hill",
    sterlingMentioned: true,
    mentionedResorts: ["Sterling Ooty Elk Hill"],
    notMentionedResorts: ["Sterling Ooty Fern Hill"],
    recommendationPosition: 2,
    competitors: ["Taj Holidays", "Club Mahindra"],
    citations: [
      { source: "Tripadvisor", sterling: false },
      { source: "MakeMyTrip", sterling: false },
      { source: "Sterling Holidays", sterling: true },
      { source: "Travel blogs", sterling: false },
    ],
    sterlingCitationPosition: 3,
    opportunity: "Medium",
    visibility: "Strong",
    response:
      "For a premium stay in Ooty, popular recommendations include Taj properties in the Nilgiris, Sterling Ooty Elk Hill and Club Mahindra Ooty. Sterling Ooty Elk Hill is known for its hillside location, colonial-style architecture and views across the Nilgiri slopes, and is often mentioned for couples and families who want a quieter setting away from the town centre.",
  },
  {
    id: "ooty-views-ai",
    query: "Best resort in Ooty with views",
    platform: "Gemini",
    resortId: "sterling-ooty-elk-hill",
    resort: "Ooty Elk Hill",
    sterlingMentioned: true,
    mentionedResorts: ["Sterling Ooty Elk Hill"],
    notMentionedResorts: [],
    recommendationPosition: 2,
    competitors: ["Club Mahindra"],
    citations: [
      { source: "Sterling Holidays", sterling: true },
      { source: "Tripadvisor", sterling: false },
    ],
    sterlingCitationPosition: 1,
    opportunity: "Low",
    visibility: "Strong",
    response:
      "Sterling Ooty Elk Hill is commonly recommended for views, with rooms overlooking the Elk Hill slopes. Club Mahindra Ooty and a few boutique properties near Fern Hill are also mentioned.",
  },
);

export const getAiQuery = (id: string) => aiQueries.find((q) => q.id === id);

/* -------------------------------------------------------------- Citation gap */

export interface CitationGap {
  id: string;
  topic: string;
  competitor: string;
  source: string;
  sterlingCited: boolean;
  opportunity: Level;
  query: string;
  aiResponse: string;
  whyCompetitorCited: string;
  sterlingGap: string;
  action: string;
  resortId: string;
}

export const citationGaps: CitationGap[] = resorts.slice(0, 16).flatMap((r, ri) =>
  [
    { topic: `Best resorts in ${r.city}`, comp: "Club Mahindra", src: "Tripadvisor" },
    { topic: `Luxury resorts ${r.city}`, comp: "Taj Holidays", src: "Travel Blog" },
    { topic: `Family resorts ${r.city}`, comp: "Club Mahindra", src: "Travel Website" },
    { topic: `Resorts near ${r.city} lake`, comp: "Sterling", src: "Sterling Website" },
  ].map((row, i) => {
    const cited = row.comp === "Sterling";
    return {
      id: slugify(`${r.id}-cg-${i}`),
      topic: row.topic,
      competitor: row.comp,
      source: row.src,
      sterlingCited: cited,
      opportunity: cited ? "Low" : i === 2 ? "Very High" : "High",
      query: `${row.topic}?`,
      resortId: r.id,
      aiResponse: `When asked about ${row.topic.toLowerCase()}, AI systems typically list ${row.comp} first, citing ${row.src} as the supporting source.`,
      whyCompetitorCited: `${row.comp} has structured, frequently updated content on ${row.src} covering facilities, pricing bands and traveller reviews, which is easy for AI systems to extract and attribute.`,
      sterlingGap: cited
        ? "Sterling content is already cited for this topic."
        : `${r.name} pages cover the property but lack comparative destination content, structured facility data and third-party corroboration for this topic.`,
      action: cited
        ? "Maintain content freshness and monitor citation share."
        : `Publish a structured ${row.topic.toLowerCase()} guide on the ${r.name} destination hub, add FAQ and comparison tables, and strengthen third-party listing consistency.`,
    } as CitationGap;
  }),
);

export const getCitationGap = (id: string) => citationGaps.find((c) => c.id === id);

/* -------------------------------------------------------------- SEO issues */

export interface SeoIssue {
  id: string;
  issue: string;
  category: string;
  pages: number;
  severity: Severity;
  impact: Level;
  explanation: string;
  fix: string;
  implementation: string;
  affected: string[];
}

const issueSeeds: [string, string, number, Severity, Level][] = [
  ["Missing meta description", "Metadata", 42, "High", "High"],
  ["Missing FAQ schema", "Schema", 31, "Medium", "Medium"],
  ["Duplicate title", "Metadata", 18, "High", "High"],
  ["Missing title", "Metadata", 6, "Critical", "High"],
  ["Duplicate meta description", "Metadata", 27, "Medium", "Medium"],
  ["Broken links", "Technical", 14, "Critical", "High"],
  ["Missing canonical", "Technical", 22, "High", "Medium"],
  ["Slow page (LCP > 4s)", "Performance", 35, "High", "High"],
  ["Missing resort schema", "Schema", 19, "High", "High"],
  ["Image alt text missing", "On-page", 86, "Low", "Medium"],
  ["Page not indexable", "Indexability", 5, "Critical", "Very High"],
  ["Multiple H1 tags", "Headings", 24, "Medium", "Low"],
  ["Missing H1", "Headings", 9, "High", "Medium"],
  ["Thin content (<300 words)", "Content", 33, "Medium", "High"],
  ["Orphan page (no internal links)", "Internal Links", 17, "Medium", "Medium"],
  ["Redirect chain", "Technical", 11, "Medium", "Low"],
  ["Missing breadcrumb schema", "Schema", 28, "Low", "Low"],
  ["Missing hreflang", "Technical", 8, "Low", "Low"],
  ["Mixed content warning", "Technical", 4, "Medium", "Low"],
  ["Missing OG tags", "Metadata", 40, "Low", "Medium"],
  ["Large image payload", "Performance", 52, "Medium", "Medium"],
  ["Duplicate content across resorts", "Content", 21, "High", "High"],
  ["Missing structured answer block", "Content", 46, "Medium", "High"],
  ["Low internal link depth", "Internal Links", 30, "Medium", "Medium"],
  ["Missing local business schema", "Local SEO", 16, "High", "High"],
  ["Inconsistent NAP data", "Local SEO", 12, "High", "High"],
  ["Missing sitemap entry", "Indexability", 7, "Medium", "Medium"],
  ["Noindex on live page", "Indexability", 3, "Critical", "Very High"],
  ["Missing review schema", "Schema", 25, "Medium", "Medium"],
  ["Unoptimised URL structure", "Technical", 13, "Low", "Low"],
];

const issueCopy: Record<string, [string, string, string]> = {
  "Missing meta description": [
    "Search engines are writing their own snippet for these pages because no meta description exists, so the resort’s key selling points never appear in the result.",
    "Write a unique 150-character description for each affected resort page, leading with the destination, the type of stay and one standout facility.",
    "Generate descriptions from resort master data (city, room types, headline facility) and let marketing override the top 30 revenue pages by hand.",
  ],
  "Missing FAQ schema": [
    "These pages answer traveller questions in prose, but without FAQ markup answer engines cannot lift the answers into results or AI summaries.",
    "Mark up the existing question-and-answer content with FAQPage schema, keeping each answer under 60 words so it stays extractable.",
    "Add an FAQ block component to the resort template that renders both the visible accordion and the matching JSON-LD from the same source.",
  ],
  "Duplicate title": [
    "Several resort pages share the same title, so search engines cannot tell them apart and often pick the weaker page to rank.",
    "Rewrite titles to a single pattern — resort name, destination, then intent — so no two pages compete on the same phrase.",
    "Enforce uniqueness in the title builder and fail the publish check when a duplicate title is detected.",
  ],
  "Missing title": [
    "Pages with no title tag are shown with a URL or a stray heading, which sharply reduces clicks even when the ranking is good.",
    "Add a descriptive title to every affected page before anything else — this is the fastest ranking and click recovery available.",
    "Make the title field mandatory in the CMS and backfill the six live pages manually today.",
  ],
  "Duplicate meta description": [
    "Repeated descriptions make different resorts look identical in results and dilute the distinctiveness of each destination.",
    "Differentiate each description around the resort’s location, signature experience and audience (family, couples, workation).",
    "Extend the description generator with resort-specific tokens and de-duplicate at build time.",
  ],
  "Broken links": [
    "Travellers and crawlers are hitting dead pages, which wastes crawl budget and breaks the path to booking pages.",
    "Repair or redirect each broken destination, prioritising links that sit inside booking and room-detail journeys.",
    "Run the crawl export against the link table, fix source links at the component level, and add a weekly automated link check.",
  ],
  "Missing canonical": [
    "Without a canonical tag, parameter and duplicate URLs compete with the real resort page for the same rankings.",
    "Point every variant at the clean resort URL with a self-referencing canonical on the primary page.",
    "Emit the canonical from the route’s resolved slug in the shared page head, ignoring query parameters.",
  ],
  "Slow page (LCP > 4s)": [
    "The main resort imagery takes over four seconds to appear on these pages, so mobile visitors abandon before the gallery loads.",
    "Compress and correctly size hero imagery, preload the hero asset and defer everything below the fold.",
    "Serve responsive AVIF/WebP variants from the image pipeline and lazy-load galleries and map embeds.",
  ],
  "Missing resort schema": [
    "Search and AI systems have no machine-readable description of these properties, so amenities, ratings and location are not understood.",
    "Add Hotel/Resort schema with address, geo coordinates, amenity list, star rating and price range.",
    "Render the schema from resort master data so it stays correct whenever facilities are updated.",
  ],
  "Image alt text missing": [
    "Resort photography carries no text alternative, which hurts accessibility and removes a strong relevance signal for image search.",
    "Describe what each image shows — property, room type, view or activity — rather than repeating the resort name.",
    "Require alt text on upload in the media library and backfill the highest-traffic galleries first.",
  ],
  "Page not indexable": [
    "These live pages are blocked from indexing, so they cannot rank or be cited at all despite carrying real content.",
    "Remove the blocking rule, request re-indexing, and confirm the pages return a clean 200 response.",
    "Audit robots rules and the meta robots tag on the affected templates, then verify in Search Console.",
  ],
  "Multiple H1 tags": [
    "More than one top-level heading per page confuses the content hierarchy and weakens the main topic signal.",
    "Keep a single H1 naming the resort and destination, and demote the remaining headings to H2.",
    "Fix the heading levels in the hero and section components rather than page by page.",
  ],
  "Missing H1": [
    "With no main heading, neither travellers nor engines get a clear statement of what the page is about.",
    "Add one H1 per page combining the resort name with its destination.",
    "Make the H1 a required prop of the page hero component so it cannot be omitted.",
  ],
  "Thin content (<300 words)": [
    "These pages are too shallow to answer traveller questions, so engines prefer richer third-party pages instead.",
    "Expand each page with facilities, activities, getting-there detail and a short FAQ written for the specific property.",
    "Prioritise the pages with existing impressions, brief writers per resort, and publish in weekly batches.",
  ],
  "Orphan page (no internal links)": [
    "Nothing on the site links to these pages, so they receive almost no crawl attention or internal authority.",
    "Link each orphan page from its destination hub, the resort overview and a relevant experience page.",
    "Add automatic related-resort and destination links to the resort template.",
  ],
  "Redirect chain": [
    "Requests are passing through several hops before reaching the final page, which slows loading and leaks link value.",
    "Collapse each chain so the original URL redirects once, directly to the final destination.",
    "Rewrite the redirect map to resolve targets transitively before deployment.",
  ],
  "Missing breadcrumb schema": [
    "Results for these pages show a bare URL instead of a readable path, reducing clarity and click-through.",
    "Add BreadcrumbList schema mirroring the destination-to-resort hierarchy already shown on the page.",
    "Generate the breadcrumb markup from the route hierarchy in the shared layout.",
  ],
  "Missing hreflang": [
    "International visitors can be served the wrong regional version of these pages.",
    "Declare reciprocal hreflang pairs for every localised variant, plus an x-default.",
    "Build the hreflang set from the locale registry and validate reciprocity in the sitemap job.",
  ],
  "Mixed content warning": [
    "Some assets on these secure pages load over plain HTTP, which can trigger browser warnings and block resources.",
    "Switch every asset reference to HTTPS and remove any hard-coded insecure host.",
    "Search the templates for http:// asset URLs and enforce protocol-relative or secure CDN paths.",
  ],
  "Missing OG tags": [
    "Shared links for these resorts render without a title, description or image, so social and chat previews look broken.",
    "Add Open Graph and Twitter card tags using the page’s own headline and hero photograph.",
    "Emit social tags from the same page metadata source used for the title and description.",
  ],
  "Large image payload": [
    "Page weight is dominated by oversized photography, which is expensive on mobile data and slows every other element.",
    "Resize to the largest rendered dimension, convert to modern formats and cap gallery payloads.",
    "Route all resort imagery through the transformation pipeline with per-breakpoint variants.",
  ],
  "Duplicate content across resorts": [
    "Near-identical descriptive copy is reused across properties, so engines treat the pages as interchangeable.",
    "Rewrite the introduction, facilities and experience sections around what is genuinely specific to each resort.",
    "Flag pages above a similarity threshold in the content report and assign rewrites destination by destination.",
  ],
  "Missing structured answer block": [
    "These pages contain the answer travellers want but bury it in paragraphs, so answer engines cannot extract it.",
    "Open each key section with a direct two-sentence answer followed by supporting detail and a short list.",
    "Add an answer-block component to the resort template with a required summary field.",
  ],
  "Low internal link depth": [
    "Important resort pages sit too many clicks from the homepage to accumulate authority.",
    "Bring priority resorts within three clicks through destination hubs and curated collections.",
    "Add regional hub links to the main navigation and cross-link resorts within the same destination.",
  ],
  "Missing local business schema": [
    "Local results and map surfaces have no structured record of these properties’ address, hours or contact details.",
    "Add LocalBusiness schema with a consistent name, address, phone number, hours and geo coordinates.",
    "Source the markup from the same master record used for the business listings feed.",
  ],
  "Inconsistent NAP data": [
    "Name, address and phone details differ between the site and external listings, which undermines local trust signals.",
    "Standardise one canonical record per property and align every listing and page to it.",
    "Publish contact details from master data only, and reconcile third-party listings from the same source.",
  ],
  "Missing sitemap entry": [
    "These pages are absent from the sitemap, so discovery relies entirely on internal links.",
    "Include every indexable resort page in the sitemap with an accurate last-modified date.",
    "Generate the sitemap from published routes at build time instead of maintaining it by hand.",
  ],
  "Noindex on live page": [
    "A noindex directive is live on real, revenue-carrying pages, keeping them out of search entirely.",
    "Remove the directive immediately, then request re-indexing and monitor recovery.",
    "Restrict noindex to staging environments through configuration, not per-page flags.",
  ],
  "Missing review schema": [
    "Guest ratings exist but are not marked up, so results appear without star ratings while competitors show them.",
    "Add AggregateRating and Review schema reflecting genuine, verifiable guest reviews only.",
    "Feed the markup from the review platform integration and refresh it nightly.",
  ],
  "Unoptimised URL structure": [
    "URLs contain identifiers and inconsistent patterns, making them hard to read and share.",
    "Move to a readable destination-then-resort pattern and redirect the old URLs permanently.",
    "Introduce the new slug scheme behind a redirect map and update internal links in the same release.",
  ],
};

export const seoIssues: SeoIssue[] = issueSeeds.map(([issue, category, pages, severity, impact], i) => {
  const [explanation, fix, implementation] = issueCopy[issue] ?? [
    `${pages} Sterling resort pages are affected by “${issue}”.`,
    `Resolve “${issue}” across the affected templates, then re-crawl to confirm.`,
    "Update the shared resort page template, then backfill exceptions manually.",
  ];
  return {
    id: slugify(issue),
    issue,
    category,
    pages,
    severity,
    impact,
    explanation: `${explanation} ${pages} Sterling pages are affected.`,
    fix,
    implementation,
    affected: resorts.slice(i % 6, (i % 6) + 5).map((r) => `${r.url}${i % 2 ? "/rooms" : ""}`),
  };
});

export const getSeoIssue = (id: string) => seoIssues.find((s) => s.id === id);

/* ---------------------------------------------------------- Recommendations */

export interface Recommendation {
  id: string;
  title: string;
  resortId: string;
  resort: string;
  seoImpact: Level;
  aeoImpact: Level;
  geoImpact: Level;
  priority: Priority;
  estimatedImpact: string;
  reason: string;
  actions: string[];
  current: { seo: number; aeo: number; geo: number };
  expected: { seo: number; aeo: number; geo: number };
  evidence: { label: string; value: string }[];
  status: "Open" | "In Progress" | "Completed";
  category: "Content" | "Technical" | "Local SEO" | "Schema" | "Internal Linking" | "Authority";
}

const recTitles = [
  (c: string) => `Improve ${c} family resort content`,
  (c: string) => `Strengthen ${c} destination authority`,
  (c: string) => `Add structured answers to ${c} resort pages`,
  (c: string) => `Close ${c} citation gap with travel publishers`,
  (c: string) => `Fix metadata and schema on ${c} pages`,
];
const cats: Recommendation["category"][] = [
  "Content",
  "Authority",
  "Content",
  "Authority",
  "Schema",
];

export const recommendations: Recommendation[] = resorts.slice(0, 8).flatMap((r, ri) =>
  recTitles.map((t, ti) => {
    const priority: Priority = ti === 0 ? "P1" : ti < 3 ? "P2" : "P3";
    const cur = {
      seo: Math.max(30, r.seo - 20 + ti * 3),
      aeo: Math.max(25, r.aeo - 20 + ti * 2),
      geo: Math.max(20, r.geo - 20 + ti * 2),
    };
    return {
      id: slugify(`${r.id}-rec-${ti}`),
      title: t(r.city),
      resortId: r.id,
      resort: r.shortName,
      seoImpact: (ti % 3 === 0 ? "High" : ti % 3 === 1 ? "Medium" : "Very High") as Level,
      aeoImpact: (ti === 0 ? "Very High" : ti % 2 ? "Medium" : "High") as Level,
      geoImpact: (ti === 3 ? "Very High" : ti % 2 ? "High" : "Medium") as Level,
      priority,
      estimatedImpact: `+${8 + ti * 2}–${14 + ti * 3} visibility points over 2 quarters`,
      reason: `Competitors are ranking for ${r.city} searches in this area and are also being cited by AI systems for the related traveller questions.`,
      actions: [
        "Improve resort page",
        "Add a focused content section",
        "Add FAQs",
        "Add structured answers",
        "Add internal links",
        "Add relevant schema",
        "Strengthen destination content",
      ],
      current: cur,
      expected: { seo: 12 - ti, aeo: 20 - ti * 2, geo: 15 - ti },
      evidence: [
        { label: "Ranking opportunities", value: `${6 + ri + ti}` },
        { label: "Unanswered questions", value: `${10 + ti * 2}` },
        { label: "Competitor AI mentions", value: `${4 + ti}` },
        { label: "Citation gaps", value: `${2 + (ti % 3)}` },
      ],
      status: (ti === 0 ? "Open" : ti === 1 ? "In Progress" : "Open") as Recommendation["status"],
      category: cats[ti]!,
    };
  }),
);

recommendations.unshift({
  id: "ooty-family-visibility",
  title: "Improve Sterling Ooty family search visibility",
  resortId: "sterling-ooty-elk-hill",
  resort: "Ooty Elk Hill",
  seoImpact: "High",
  aeoImpact: "Very High",
  geoImpact: "High",
  priority: "P1",
  estimatedImpact: "+15 overall visibility points for Sterling Ooty Elk Hill",
  reason:
    "Competitors are ranking for family resort searches in Ooty and are also being cited by AI systems for family travel questions.",
  actions: [
    "Improve resort page",
    "Add family FAQ section",
    "Add structured answers",
    "Add internal links",
    "Improve local destination content",
    "Strengthen entity references",
  ],
  current: { seo: 68, aeo: 51, geo: 43 },
  expected: { seo: 12, aeo: 20, geo: 15 },
  evidence: [
    { label: "Ranking opportunities", value: "8" },
    { label: "Unanswered questions", value: "14" },
    { label: "Competitor AI mentions", value: "6" },
    { label: "Citation gaps", value: "3" },
  ],
  status: "Open",
  category: "Content",
});

export const getRecommendation = (id: string) => recommendations.find((r) => r.id === id);

/* ------------------------------------------------------------------- Pages */

export interface ResortPage {
  id: string;
  resortId: string;
  name: string;
  path: string;
  seo: number;
  aeo: number;
  geo: number;
  overall: number;
  issues: number;
  structuredAnswerScore: number;
}

const pageSeeds: [string, number, number, number, number][] = [
  ["Resort Overview", 92, 82, 74, 3],
  ["Rooms", 88, 75, 66, 5],
  ["Dining", 81, 64, 58, 7],
  ["Things to Do", 74, 58, 52, 11],
  ["FAQs", 69, 91, 63, 4],
  ["Offers", 71, 55, 44, 8],
  ["Location & Directions", 84, 72, 61, 6],
  ["Gallery", 66, 41, 38, 9],
];

export const resortPages: ResortPage[] = resorts.flatMap((r) =>
  pageSeeds.map(([name, seo, aeo, geo, issues]) => {
    const adj = Math.round((r.seo - 80) / 3);
    const s = Math.max(35, Math.min(98, seo + adj));
    const a = Math.max(30, Math.min(98, aeo + adj));
    const g = Math.max(28, Math.min(98, geo + adj));
    return {
      id: slugify(`${r.id}-${name}`),
      resortId: r.id,
      name,
      path: `${r.url}${name === "Resort Overview" ? "" : "/" + slugify(name)}`,
      seo: s,
      aeo: a,
      geo: g,
      overall: Math.round(s * 0.4 + a * 0.3 + g * 0.3),
      issues,
      structuredAnswerScore: Math.round((a + g) / 2) + 4,
    };
  }),
);

export const getPage = (id: string) => resortPages.find((p) => p.id === id);

/* ----------------------------------------------------------------- Reports */

export interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  resortsCovered: number;
  score: number;
  findings: string[];
  summary: string;
}

export const reports: Report[] = [
  {
    id: "monthly-search-visibility",
    title: "Monthly Search Visibility Report",
    type: "Executive",
    date: "1 September 2026",
    resortsCovered: 75,
    score: 74,
    findings: [
      "Overall search visibility improved from 58 to 74 over 12 weeks",
      "GEO remains the weakest layer at 59/100",
      "South region resorts lead on answer coverage",
    ],
    summary:
      "Sterling's overall search and AI visibility continued its upward trend this month, driven mainly by technical SEO remediation and expanded FAQ coverage. Generative visibility remains the largest gap, with competitors holding a materially higher citation share.",
  },
  {
    id: "seo-health",
    title: "SEO Health Report",
    type: "SEO",
    date: "1 September 2026",
    resortsCovered: 75,
    score: 81,
    findings: [
      "1,284 pages crawled, 184 open technical issues",
      "Top 3 rankings up to 1,248 keywords",
      "Schema coverage is the weakest health area at 63/100",
    ],
    summary:
      "Technical health is strong overall. Metadata and schema remain the two areas holding back further gains, particularly on Rooms and Things to Do templates.",
  },
  {
    id: "aeo-readiness",
    title: "AEO Readiness Report",
    type: "AEO",
    date: "1 September 2026",
    resortsCovered: 75,
    score: 68,
    findings: [
      "4,920 of 6,840 tracked questions have some coverage",
      "1,920 answer gaps identified",
      "Family travel and accessibility are the weakest clusters",
    ],
    summary:
      "Answer readiness improved by 14 points this quarter. The largest remaining opportunity is converting descriptive resort copy into direct, extractable answers with supporting FAQ markup.",
  },
  {
    id: "geo-visibility",
    title: "GEO Visibility Report",
    type: "GEO",
    date: "1 September 2026",
    resortsCovered: 75,
    score: 59,
    findings: [
      "Sterling mentioned in 1,842 of 3,200 monitored AI queries",
      "Citation share at 18% versus 29% for the leading competitor",
      "Third-party travel sites dominate citations for family queries",
    ],
    summary:
      "AI systems increasingly recognise Sterling for branded and view-led queries, but rarely cite Sterling for comparative destination questions. Closing this gap requires citation-worthy destination content and stronger third-party consistency.",
  },
  {
    id: "resort-performance",
    title: "Resort Performance Report",
    type: "Portfolio",
    date: "1 September 2026",
    resortsCovered: 24,
    score: 71,
    findings: [
      "Sterling Ooty Elk Hill leads the portfolio at 83 overall",
      "Six resorts are classified At Risk",
      "Hill-station resorts outperform coastal resorts on answer coverage",
    ],
    summary:
      "Portfolio performance is uneven. A focused programme on the ten lowest-scoring resorts would lift the portfolio average by an estimated 6 points.",
  },
  {
    id: "competitive-intelligence",
    title: "Competitive Intelligence Report",
    type: "Competitive",
    date: "1 September 2026",
    resortsCovered: 75,
    score: 64,
    findings: [
      "Club Mahindra leads AI visibility at 72",
      "Taj leads entity and content authority",
      "Sterling leads branded search visibility",
    ],
    summary:
      "Sterling's brand strength is not translating into comparative or generative visibility. Competitors win primarily through content depth and third-party corroboration, not through better technical SEO.",
  },
  {
    id: "executive-search-ai",
    title: "Executive Search & AI Report",
    type: "Executive",
    date: "1 September 2026",
    resortsCovered: 75,
    score: 74,
    findings: [
      "Search visibility up 16 points over the quarter",
      "642 SEO opportunities and 418 GEO opportunities open",
      "30 unified recommendations prioritised across the portfolio",
    ],
    summary:
      "The unified search intelligence programme is delivering measurable gains. The next quarter should concentrate investment on generative visibility, where the gap to competitors is widest and the compounding benefit is highest.",
  },
];

export const getReport = (id: string) => reports.find((r) => r.id === id);

/* ------------------------------------------------------- SEO opportunities */

export interface SeoOpportunity {
  id: string;
  category: string;
  resortId: string;
  resort: string;
  keyword: string;
  currentPosition: number;
  potentialPosition: number;
  estimatedOpportunity: string;
  action: string;
  priority: Priority;
}

export const seoOpportunityCategories = [
  "Quick Wins",
  "Content Opportunities",
  "Technical Fixes",
  "Local SEO",
  "Internal Linking",
  "Schema",
  "Competitor Gaps",
];

export const seoOpportunities: SeoOpportunity[] = keywords
  .filter((k) => k.position > 4 && k.position < 30)
  .slice(0, 84)
  .map((k, i) => ({
    id: `opp-${k.id}`,
    category: seoOpportunityCategories[i % seoOpportunityCategories.length]!,
    resortId: k.resortId,
    resort: k.resort,
    keyword: k.keyword,
    currentPosition: k.position,
    potentialPosition: Math.max(1, Math.round(k.position / 3)),
    estimatedOpportunity: `+${Math.round(k.volume * 0.06).toLocaleString()} monthly visits`,
    action:
      i % 4 === 0
        ? "Expand page content and add a comparison section"
        : i % 4 === 1
          ? "Add FAQ schema and structured answers"
          : i % 4 === 2
            ? "Improve internal linking from destination hub"
            : "Refresh metadata and heading structure",
    priority: (k.opportunity === "Very High" ? "P1" : k.opportunity === "High" ? "P2" : "P3") as Priority,
  }));

/* ------------------------------------------------------------- Competitors */

export interface CompetitorRow {
  keyword: string;
  resortId: string;
  sterling: number;
  competitors: { name: string; position: number }[];
  serpVisibility: number;
  featuredSnippet: string;
  localPack: boolean;
  paa: number;
  contentDepth: number;
  domainAuthority: number;
}

const compNames = ["Club Mahindra", "Taj Holidays", "MakeMyTrip", "Tripadvisor"];

export const competitorRows: CompetitorRow[] = keywords
  .filter((k) => k.intent === "Commercial")
  .slice(0, 60)
  .map((k, i) => ({
    keyword: k.keyword,
    resortId: k.resortId,
    sterling: k.position,
    competitors: compNames.map((name, ci) => ({
      name,
      position: Math.max(1, ((i + ci * 3) % 9) + 1),
    })),
    serpVisibility: Math.max(4, 100 - k.position * 4),
    featuredSnippet: i % 5 === 0 ? "Sterling" : i % 3 === 0 ? "Club Mahindra" : "Tripadvisor",
    localPack: i % 2 === 0,
    paa: 3 + (i % 5),
    contentDepth: 40 + ((i * 7) % 50),
    domainAuthority: 58 + (i % 20),
  }));

export const whyCompetitorsWin = [
  "More comprehensive destination content",
  "Better FAQ coverage",
  "More local information",
  "Stronger backlink profile",
  "Better structured data",
  "More frequent content refresh",
];
