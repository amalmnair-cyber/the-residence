import { unsplash } from "@/lib/unsplash";
import { site } from "./content";

export interface GalleryImage {
  id: string;
  image: string;
  alt: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: "g1",
    image: unsplash("1748063578185-3d68121b11ff", 2400),
    alt: `${site.propertyName} at dusk, glass facade glowing from within`,
  },
  {
    id: "g2",
    image: unsplash("1614595737476-42487331b8a1", 2000),
    alt: "Detail of the board-formed concrete and timber facade",
  },
  {
    id: "g3",
    image: unsplash("1758957701419-2c6e266f7988", 2200),
    alt: "Living room with sculptural furniture and concrete walls",
  },
  {
    id: "g4",
    image: unsplash("1601993957728-1e56ab70c5a8", 2000),
    alt: "Minimalist plaster staircase",
  },
  {
    id: "g5",
    image: unsplash("1616048056617-93b94a339009", 2200),
    alt: "Dining room overlooking the garden",
  },
  {
    id: "g6",
    image: unsplash("1679364297777-1db77b6199be", 2400),
    alt: `${site.propertyName} exterior at twilight framed by landscaping`,
  },
  {
    id: "g7",
    image: unsplash("1576698483491-8c43f0862543", 2000),
    alt: "Marble and brass bathroom detail",
  },
  {
    id: "g8",
    image: unsplash("1611095210561-67f0832b1ca3", 2200),
    alt: "Kitchen island in dark oak and marble",
  },
  {
    id: "g9",
    image: unsplash("1529290130-4ca3753253ae", 2200),
    alt: "Indoor pool hall with timber screening",
  },
  {
    id: "g10",
    image: unsplash("1691425700573-5e2e6e4f6157", 2000),
    alt: "Concrete balcony detail against the sky",
  },
  {
    id: "g11",
    image: unsplash("1668120089662-42642838cfef", 2200),
    alt: "Landscaped garden path",
  },
  {
    id: "g12",
    image: unsplash("1616594039964-ae9021a400a0", 2200),
    alt: "Master suite with brass chandelier",
  },
];
