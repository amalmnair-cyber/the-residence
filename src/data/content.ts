import { unsplash } from "@/lib/unsplash";

export const site = {
  brand: "AAAM Residency",
  propertyName: "The Elmstead",
  location: "Hampstead, London",
  tagline: "Designed for extraordinary living.",
};

export const images = {
  hero: unsplash("1748063578185-3d68121b11ff", 2400),
  introduction: unsplash("1679364297777-1db77b6199be", 1800),
  architectureMain: unsplash("1614595737476-42487331b8a1", 1800),
  architectureDetail1: unsplash("1691425700573-5e2e6e4f6157", 1400),
  architectureDetail2: unsplash("1542014584973-33ea4058aa00", 1400),
  architectureStair: unsplash("1601993957728-1e56ab70c5a8", 1400),
  lifestylePrimary: unsplash("1650823272653-94806305978b", 2000),
  lifestyleSecondary: unsplash("1600210492090-a159ffa3aeaf", 1400),
};

export const architectureFeatures = [
  {
    title: "Exterior Architecture",
    copy: "A composition of board-formed concrete, timber and glass, arranged around a single restrained volume that reads differently from every approach.",
  },
  {
    title: "Natural Materials",
    copy: "Travertine, oak and Portland stone were chosen to weather honestly, so the house continues to settle into its site long after completion.",
  },
  {
    title: "Light",
    copy: "Deep reveals and a north-south orientation draw daylight through the plan from morning until dusk, without ever facing it directly.",
  },
  {
    title: "Landscaping",
    copy: "Grounds by a landscape studio known for its work along the Heath, planted to mature into structure rather than decoration.",
  },
  {
    title: "Privacy",
    copy: "Set back behind mature planting on a quiet, gated road, The Elmstead is entirely private without a single visible boundary wall.",
  },
  {
    title: "Contemporary Design",
    copy: "A language of quiet geometry that favours restraint over spectacle, inside and out.",
  },
];

export const introCopy = {
  heading: "A New Standard of Living",
  paragraphs: [
    "The Elmstead is a private architectural retreat, available for exclusive whole-house stays, designed around light, proportion and natural materials.",
    "Set within a quiet, gated plot moments from Hampstead Heath, it was conceived as a single continuous gesture — from the entrance court through to the garden beyond, reserved entirely for you and your guests.",
  ],
};

export const lifestyleCopy = {
  lines: ["Designed not simply to be seen.", "Designed to be lived."],
  body: "Every room at The Elmstead was drawn around the way a family actually moves through a house — toward the light, toward the garden, and toward each other.",
};
