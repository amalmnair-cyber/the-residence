import { unsplash } from "@/lib/unsplash";

export interface Material {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const materials: Material[] = [
  {
    id: "travertine",
    name: "Travertine",
    description:
      "Honed Roman travertine laid throughout the ground floor for its warmth underfoot.",
    image: unsplash("1708168250435-e7d0b2ac72c4", 1200),
  },
  {
    id: "oak",
    name: "Natural Oak",
    description:
      "Wide-plank European oak, engineered for durability beneath London's changing light.",
    image: unsplash("1611600700192-d87eaeed4f81", 1200),
  },
  {
    id: "marble",
    name: "Italian Marble",
    description:
      "Calacatta marble surfaces sourced from the quarries of Carrara.",
    image: unsplash("1558346648-9757f2fa4474", 1200),
  },
  {
    id: "brass",
    name: "Brushed Brass",
    description:
      "Solid brass ironmongery and fixtures, left to develop a soft living patina.",
    image: unsplash("1545873509-33e944ca7655", 1200),
  },
  {
    id: "glass",
    name: "Glass",
    description:
      "Floor-to-ceiling glazing and fluted glass partitions soften every threshold.",
    image: unsplash("1652862730507-32988eb23a67", 1200),
  },
  {
    id: "stone",
    name: "Natural Stone",
    description:
      "Portland stone cladding ties the Residence to Hampstead's historic material language.",
    image: unsplash("1625008668243-e10fa6121030", 1200),
  },
];
