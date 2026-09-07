import hills from "@/assets/resort-hills.jpg";
import valley from "@/assets/resort-valley.jpg";
import beach from "@/assets/resort-beach.jpg";
import mountain from "@/assets/resort-mountain.jpg";

export const resortImages = { hills, valley, beach, mountain };

export type ImageKey = keyof typeof resortImages;

export interface Resort {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  region: string;
  url: string;
  image: ImageKey;
  seo: number;
  aeo: number;
  geo: number;
  overall: number;
  rankingKeywords: number;
  targetKeywords: number;
  aiQueries: number;
  aiMentions: number;
  aiCitations: number;
  questions: number;
  seoIssues: number;
  aeoGaps: number;
  geoGaps: number;
  opportunities: number;
  entityAuthority: number;
  contentAuthority: number;
  faqCoverage: number;
  status: "Optimized" | "Improving" | "Needs Attention" | "At Risk";
  lastCrawl: string;
}

export const overallScore = (seo: number, aeo: number, geo: number) =>
  Math.round(seo * 0.4 + aeo * 0.3 + geo * 0.3);

type Seed = [string, string, string, string, ImageKey, number, number, number];

const seeds: Seed[] = [
  ["Sterling Ooty Elk Hill", "Ooty", "Tamil Nadu", "South", "hills", 89, 82, 76],
  ["Sterling Ooty Fern Hill", "Ooty", "Tamil Nadu", "South", "hills", 81, 70, 62],
  ["Sterling Munnar", "Munnar", "Kerala", "South", "valley", 84, 73, 68],
  ["Sterling Wayanad", "Wayanad", "Kerala", "South", "valley", 79, 70, 61],
  ["Sterling Kodai Lake", "Kodaikanal", "Tamil Nadu", "South", "hills", 76, 65, 57],
  ["Sterling Yercaud", "Yercaud", "Tamil Nadu", "South", "hills", 72, 61, 49],
  ["Sterling Darjeeling", "Darjeeling", "West Bengal", "East", "hills", 70, 58, 47],
  ["Sterling Goa Varca", "Varca", "Goa", "West", "beach", 83, 74, 70],
  ["Sterling Manali", "Manali", "Himachal Pradesh", "North", "mountain", 78, 66, 58],
  ["Sterling Kufri", "Kufri", "Himachal Pradesh", "North", "mountain", 69, 57, 44],
  ["Sterling Mussoorie", "Mussoorie", "Uttarakhand", "North", "mountain", 75, 63, 55],
  ["Sterling Mount Abu", "Mount Abu", "Rajasthan", "West", "hills", 71, 60, 51],
  ["Sterling Corbett", "Ramnagar", "Uttarakhand", "North", "valley", 74, 68, 59],
  ["Sterling Pachmarhi", "Pachmarhi", "Madhya Pradesh", "Central", "valley", 66, 54, 42],
  ["Sterling Khandala", "Khandala", "Maharashtra", "West", "valley", 73, 62, 53],
  ["Sterling Lonavala", "Lonavala", "Maharashtra", "West", "valley", 80, 69, 64],
  ["Sterling Nainital", "Nainital", "Uttarakhand", "North", "mountain", 77, 64, 56],
  ["Sterling Gangtok", "Gangtok", "Sikkim", "East", "mountain", 68, 55, 45],
  ["Sterling Anaikatti", "Anaikatti", "Tamil Nadu", "South", "valley", 64, 52, 41],
  ["Sterling Dindi", "Dindi", "Andhra Pradesh", "South", "beach", 62, 50, 39],
  ["Sterling Puri", "Puri", "Odisha", "East", "beach", 67, 56, 46],
  ["Sterling Thekkady", "Thekkady", "Kerala", "South", "valley", 72, 63, 54],
  ["Sterling Alleppey", "Alleppey", "Kerala", "South", "valley", 76, 67, 60],
  ["Sterling Karwar", "Karwar", "Karnataka", "South", "beach", 63, 51, 43],
];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const statusFor = (o: number): Resort["status"] =>
  o >= 80 ? "Optimized" : o >= 70 ? "Improving" : o >= 58 ? "Needs Attention" : "At Risk";

export const resorts: Resort[] = seeds.map(([name, city, state, region, image, seo, aeo, geo], i) => {
  const overall = overallScore(seo, aeo, geo);
  const spread = 100 - overall;
  return {
    id: slugify(name),
    name,
    shortName: name.replace("Sterling ", ""),
    city,
    state,
    region,
    url: `https://www.sterlingholidays.com/resorts/${slugify(name.replace("Sterling ", ""))}`,
    image,
    seo,
    aeo,
    geo,
    overall,
    rankingKeywords: 240 + spread * 12 + i * 7,
    targetKeywords: 320 + spread * 14 + i * 5,
    aiQueries: 40 + Math.round(spread * 1.6),
    aiMentions: 30 + Math.round(geo * 1.4),
    aiCitations: 6 + Math.round(geo / 5),
    questions: 180 + spread * 5 + i * 3,
    seoIssues: 4 + Math.round(spread / 3),
    aeoGaps: 12 + Math.round(spread * 1.4),
    geoGaps: 8 + Math.round(spread * 1.1),
    opportunities: 6 + Math.round(spread * 0.62),
    entityAuthority: Math.min(95, geo + 6 + (i % 5)),
    contentAuthority: Math.min(95, Math.round((aeo + geo) / 2) + 2 + (i % 4)),
    faqCoverage: Math.min(96, aeo + 4 + (i % 6)),
    status: statusFor(overall),
    lastCrawl: `${(i % 12) + 1} hours ago`,
  };
});

export const getResort = (id: string) => resorts.find((r) => r.id === id);

export const regions = [...new Set(resorts.map((r) => r.region))];
export const states = [...new Set(resorts.map((r) => r.state))].sort();
export const cities = [...new Set(resorts.map((r) => r.city))].sort();
