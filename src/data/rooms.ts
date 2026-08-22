import { unsplash } from "@/lib/unsplash";

export interface Room {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
}

export const rooms: Room[] = [
  {
    id: "living",
    number: "01",
    title: "Living Room",
    description:
      "A seamless connection between architecture, light and landscape.",
    image: unsplash("1758957701419-2c6e266f7988", 1800),
  },
  {
    id: "kitchen",
    number: "02",
    title: "Kitchen",
    description:
      "Honed stone and dark oak, built for quiet mornings and long evenings.",
    image: unsplash("1611095210561-67f0832b1ca3", 1800),
  },
  {
    id: "master-suite",
    number: "03",
    title: "Master Suite",
    description:
      "A private retreat wrapped in natural light and considered proportion.",
    image: unsplash("1616594039964-ae9021a400a0", 1800),
  },
  {
    id: "bathroom",
    number: "04",
    title: "Bathroom",
    description:
      "Italian marble and brushed brass, drawn from a restrained material palette.",
    image: unsplash("1576698483491-8c43f0862543", 1800),
  },
  {
    id: "cinema",
    number: "05",
    title: "Cinema Room",
    description:
      "A darkened screening room tuned for sound, comfort and complete immersion.",
    image: unsplash("1710131459450-7c384b8be18f", 1800),
  },
  {
    id: "pool",
    number: "06",
    title: "Pool",
    description:
      "A subterranean pool hall finished in timber screening and warm stone.",
    image: unsplash("1529290130-4ca3753253ae", 1800),
  },
  {
    id: "garden",
    number: "07",
    title: "Garden",
    description:
      "Landscaped grounds designed in quiet dialogue with Hampstead Heath.",
    image: unsplash("1668120089662-42642838cfef", 1800),
  },
  {
    id: "terrace",
    number: "08",
    title: "Terrace",
    description:
      "An elevated outdoor room for evenings that begin at golden hour.",
    image: unsplash("1600210492090-a159ffa3aeaf", 1800),
  },
];
