import { unsplash } from "@/lib/unsplash";

export interface NearbyPlace {
  name: string;
  time: string;
}

export const nearbyPlaces: NearbyPlace[] = [
  { name: "Hampstead Heath", time: "3 min" },
  { name: "Primrose Hill", time: "8 min" },
  { name: "Regent's Park", time: "12 min" },
  { name: "Mayfair", time: "18 min" },
  { name: "Heathrow Airport", time: "35 min" },
];

export const locationImages = [
  unsplash("1715964301154-3012466ae09f", 1600),
  unsplash("1723249798988-95f20b2081d6", 1000),
  unsplash("1650823272653-94806305978b", 1200),
];
