import { unsplash } from "@/lib/unsplash";

export interface FloorPlanRoom {
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

// Simplified fictional ground-floor schematic. viewBox: 0 0 1000 640
export const floorPlanRooms: FloorPlanRoom[] = [
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
];

export const floorPlanBounds = { x: 30, y: 30, w: 940, h: 580 };
