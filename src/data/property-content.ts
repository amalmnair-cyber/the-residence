import { unsplash } from "@/lib/unsplash";

export interface RichRoom {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
}

export interface RichFloorPlanRoom {
  id: string;
  name: string;
  dimensions: string;
  features: string[];
  image: string;
  x: number;
  y: number;
  w: number;
  h: number;
  labelSize?: "sm" | "md";
}

export interface RichContent {
  rooms: RichRoom[];
  floorPlan: {
    rooms: RichFloorPlanRoom[];
    bounds: { x: number; y: number; w: number; h: number };
  };
  architecture: {
    mainImage: string;
    detailImage1: string;
    detailImage2: string;
    features: { title: string; copy: string }[];
  };
  location: {
    heading: [string, string];
    blurb: string;
    places: { name: string; time: string }[];
    images: [string, string];
  };
  lifestyle: {
    image: string;
    lines: [string, string];
    body: string;
  };
}

// Ported as-is from the original single-property src/data/{rooms,floorplan,
// locations}.ts and the architecture/lifestyle fields of content.ts.
const elmsteadContent: RichContent = {
  rooms: [
    {
      id: "living",
      number: "01",
      title: "Living Room",
      description: "A seamless connection between architecture, light and landscape.",
      image: unsplash("1758957701419-2c6e266f7988", 1800),
    },
    {
      id: "kitchen",
      number: "02",
      title: "Kitchen",
      description: "Honed stone and dark oak, built for quiet mornings and long evenings.",
      image: unsplash("1611095210561-67f0832b1ca3", 1800),
    },
    {
      id: "master-suite",
      number: "03",
      title: "Master Suite",
      description: "A private retreat wrapped in natural light and considered proportion.",
      image: unsplash("1616594039964-ae9021a400a0", 1800),
    },
    {
      id: "bathroom",
      number: "04",
      title: "Bathroom",
      description: "Italian marble and brushed brass, drawn from a restrained material palette.",
      image: unsplash("1576698483491-8c43f0862543", 1800),
    },
    {
      id: "cinema",
      number: "05",
      title: "Cinema Room",
      description: "A darkened screening room tuned for sound, comfort and complete immersion.",
      image: unsplash("1710131459450-7c384b8be18f", 1800),
    },
    {
      id: "pool",
      number: "06",
      title: "Pool",
      description: "A subterranean pool hall finished in timber screening and warm stone.",
      image: unsplash("1529290130-4ca3753253ae", 1800),
    },
    {
      id: "garden",
      number: "07",
      title: "Garden",
      description: "Landscaped grounds designed in quiet dialogue with Hampstead Heath.",
      image: unsplash("1668120089662-42642838cfef", 1800),
    },
    {
      id: "terrace",
      number: "08",
      title: "Terrace",
      description: "An elevated outdoor room for evenings that begin at golden hour.",
      image: unsplash("1600210492090-a159ffa3aeaf", 1800),
    },
  ],
  floorPlan: {
    bounds: { x: 30, y: 30, w: 940, h: 580 },
    rooms: [
      {
        id: "living",
        name: "Living Room",
        dimensions: "9.2m × 6.4m",
        features: ["Double-height glazing", "Fireplace", "Direct terrace access"],
        image: unsplash("1758957701419-2c6e266f7988", 1000),
        x: 30,
        y: 30,
        w: 430,
        h: 280,
      },
      {
        id: "kitchen",
        name: "Kitchen & Dining",
        dimensions: "8.0m × 5.5m",
        features: ["Marble island", "Bi-fold doors", "Butler's pantry"],
        image: unsplash("1611095210561-67f0832b1ca3", 1000),
        x: 470,
        y: 30,
        w: 500,
        h: 280,
      },
      {
        id: "master",
        name: "Master Suite",
        dimensions: "6.4m × 5.8m",
        features: ["Private terrace", "Walk-in wardrobe", "En-suite bathroom"],
        image: unsplash("1616594039964-ae9021a400a0", 1000),
        x: 30,
        y: 320,
        w: 300,
        h: 290,
      },
      {
        id: "study",
        name: "Study",
        dimensions: "4.2m × 3.8m",
        features: ["Built-in joinery", "Garden outlook"],
        image: unsplash("1601993957728-1e56ab70c5a8", 1000),
        x: 340,
        y: 320,
        w: 230,
        h: 290,
        labelSize: "sm",
      },
      {
        id: "cinema",
        name: "Cinema Room",
        dimensions: "7.0m × 4.6m",
        features: ["Tiered seating", "Acoustic wall lining"],
        image: unsplash("1710131459450-7c384b8be18f", 1000),
        x: 580,
        y: 320,
        w: 220,
        h: 290,
      },
      {
        id: "pool",
        name: "Pool Hall",
        dimensions: "12.0m × 5.0m",
        features: ["18m pool", "Steam room", "Changing suite"],
        image: unsplash("1529290130-4ca3753253ae", 1000),
        x: 810,
        y: 320,
        w: 160,
        h: 290,
        labelSize: "sm",
      },
    ],
  },
  architecture: {
    mainImage: unsplash("1614595737476-42487331b8a1", 1800),
    detailImage1: unsplash("1691425700573-5e2e6e4f6157", 1400),
    detailImage2: unsplash("1601993957728-1e56ab70c5a8", 1400),
    features: [
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
    ],
  },
  location: {
    heading: ["Hampstead", "London"],
    blurb:
      "Set behind a private gated entrance moments from the Heath, The Elmstead sits within one of London's most established and verdant neighbourhoods.",
    places: [
      { name: "Hampstead Heath", time: "3 min" },
      { name: "Primrose Hill", time: "8 min" },
      { name: "Regent's Park", time: "12 min" },
      { name: "Mayfair", time: "18 min" },
      { name: "Heathrow Airport", time: "35 min" },
    ],
    images: [unsplash("1715964301154-3012466ae09f", 1600), unsplash("1723249798988-95f20b2081d6", 1000)],
  },
  lifestyle: {
    image: unsplash("1650823272653-94806305978b", 2000),
    lines: ["Designed not simply to be seen.", "Designed to be lived."],
    body: "Every room at The Elmstead was drawn around the way a family actually moves through a house — toward the light, toward the garden, and toward each other.",
  },
};

// The Kiln House — a genuine contrast to Elmstead's glass-and-concrete
// language: a converted harbourside store above St Ives, built around one
// vast room facing the water. Images verified to resolve on
// images.unsplash.com before use (see project notes); several are
// deliberately reused across sections the way Elmstead's own content does.
const kilnContent: RichContent = {
  rooms: [
    {
      id: "great-room",
      number: "01",
      title: "Great Room",
      description: "A single vast room open to the sea, framed by reclaimed timber and stone.",
      image: unsplash("1631941392209-70cad44ecfb7", 1800),
    },
    {
      id: "kitchen",
      number: "02",
      title: "Kitchen",
      description: "Dark oak and blackened steel, arranged around the harbour view.",
      image: unsplash("1600684388091-627109f3cd60", 1800),
    },
    {
      id: "primary-suite",
      number: "03",
      title: "Primary Suite",
      description: "A quiet retreat wrapped in timber, waking to the sound of the tide.",
      image: unsplash("1705372334341-3780ebb7c97b", 1800),
    },
    {
      id: "bathroom",
      number: "04",
      title: "Bathroom",
      description: "Honed slate and brushed brass, drawn from the working harbour below.",
      image: unsplash("1765766556463-180500e61ea8", 1800),
    },
    {
      id: "snug",
      number: "05",
      title: "Snug",
      description: "A low-lit room built around a single wood-burning stove.",
      image: unsplash("1759203111456-b63e81a03cec", 1800),
    },
    {
      id: "terrace",
      number: "06",
      title: "Terrace",
      description: "Weathered decking suspended above the rooftops, facing the water.",
      image: unsplash("1658412938736-84b7134375d5", 1800),
    },
  ],
  floorPlan: {
    bounds: { x: 30, y: 30, w: 940, h: 580 },
    rooms: [
      {
        id: "great-room",
        name: "Great Room",
        dimensions: "11.4m × 6.8m",
        features: ["Full-height sea-facing glazing", "Reclaimed ship-timber ceiling", "Wood-burning hearth"],
        image: unsplash("1631941392209-70cad44ecfb7", 1000),
        x: 30,
        y: 30,
        w: 560,
        h: 280,
      },
      {
        id: "kitchen",
        name: "Kitchen & Dining",
        dimensions: "6.2m × 5.4m",
        features: ["Dark oak cabinetry", "Harbour-facing window seat", "Larder pantry"],
        image: unsplash("1600684388091-627109f3cd60", 1000),
        x: 610,
        y: 30,
        w: 360,
        h: 280,
      },
      {
        id: "primary-suite",
        name: "Primary Suite",
        dimensions: "5.6m × 5.2m",
        features: ["En-suite bathroom", "Harbour view", "Built-in wardrobe"],
        image: unsplash("1705372334341-3780ebb7c97b", 1000),
        x: 30,
        y: 320,
        w: 320,
        h: 290,
      },
      {
        id: "snug",
        name: "Snug",
        dimensions: "4.0m × 5.2m",
        features: ["Wood-burning stove", "Built-in bookshelves"],
        image: unsplash("1759203111456-b63e81a03cec", 1000),
        x: 370,
        y: 320,
        w: 260,
        h: 290,
        labelSize: "sm",
      },
      {
        id: "terrace",
        name: "Terrace",
        dimensions: "5.8m × 5.2m",
        features: ["Weathered timber decking", "Harbour outlook", "Outdoor dining"],
        image: unsplash("1658412938736-84b7134375d5", 1000),
        x: 650,
        y: 320,
        w: 320,
        h: 290,
      },
    ],
  },
  architecture: {
    mainImage: unsplash("1727798761837-28245ea1e5b0", 1800),
    detailImage1: unsplash("1759203111456-b63e81a03cec", 1400),
    detailImage2: unsplash("1658412938736-84b7134375d5", 1400),
    features: [
      {
        title: "Exterior Architecture",
        copy: "Dark stained timber and Cornish slate, set low against the coastal wind — a form drawn from the fishing stores that once lined this harbour.",
      },
      {
        title: "Natural Materials",
        copy: "Reclaimed ship timber, honed slate and blackened steel, chosen to weather further with every season by the sea.",
      },
      {
        title: "Light",
        copy: "Deep-set, harbour-facing windows and a single roof lantern draw daylight across the great room from dawn until the tide turns.",
      },
      {
        title: "Landscaping",
        copy: "A salt-tolerant coastal garden of thrift and gorse, planted to hold the ground against the wind rather than resist it.",
      },
      {
        title: "Privacy",
        copy: "Reached by a private lane above the working harbour, The Kiln House is entirely secluded without a single overlooking window.",
      },
      {
        title: "Contemporary Design",
        copy: "A quiet reinterpretation of the Cornish kiln and fisherman's store, stripped back rather than restyled.",
      },
    ],
  },
  location: {
    heading: ["St Ives", "Cornwall"],
    blurb:
      "Set above a working harbour on Cornwall's north coast, The Kiln House sits within one of England's most storied and painterly seaside towns.",
    places: [
      { name: "Porthmeor Beach", time: "4 min" },
      { name: "St Ives Harbour", time: "6 min" },
      { name: "Tate St Ives", time: "7 min" },
      { name: "Zennor Coastal Path", time: "15 min" },
      { name: "Newquay Airport", time: "40 min" },
    ],
    images: [unsplash("1559917230-f11db8732596", 1600), unsplash("1727798761837-28245ea1e5b0", 1000)],
  },
  lifestyle: {
    image: unsplash("1645099815150-ec1633635a3e", 2000),
    lines: ["Designed not to shelter from the sea.", "Designed to face it."],
    body: "Every room at The Kiln House was drawn toward the water — the tide, the working boats, and the changing Cornish light.",
  },
};

export const richContentBySlug: Record<string, RichContent> = {
  "the-elmstead": elmsteadContent,
  "the-kiln-house": kilnContent,
};
