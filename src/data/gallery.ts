import { unsplash } from "@/lib/unsplash";

export interface GalleryImage {
  id: string;
  image: string;
  alt: string;
  span: "large" | "tall" | "wide" | "small";
}

export const galleryImages: GalleryImage[] = [
  {
    id: "g1",
    image: unsplash("1748063578185-3d68121b11ff", 1800),
    alt: "The Residence at dusk, glass facade glowing from within",
    span: "large",
  },
  {
    id: "g2",
    image: unsplash("1614595737476-42487331b8a1", 1200),
    alt: "Detail of the board-formed concrete and timber facade",
    span: "tall",
  },
  {
    id: "g3",
    image: unsplash("1758957701419-2c6e266f7988", 1200),
    alt: "Living room with sculptural furniture and concrete walls",
    span: "wide",
  },
  {
    id: "g4",
    image: unsplash("1601993957728-1e56ab70c5a8", 1000),
    alt: "Minimalist plaster staircase",
    span: "small",
  },
  {
    id: "g5",
    image: unsplash("1616048056617-93b94a339009", 1200),
    alt: "Dining room overlooking the garden",
    span: "small",
  },
  {
    id: "g6",
    image: unsplash("1679364297777-1db77b6199be", 1600),
    alt: "The Residence exterior at twilight framed by landscaping",
    span: "wide",
  },
  {
    id: "g7",
    image: unsplash("1576698483491-8c43f0862543", 1200),
    alt: "Marble and brass bathroom detail",
    span: "tall",
  },
  {
    id: "g8",
    image: unsplash("1611095210561-67f0832b1ca3", 1200),
    alt: "Kitchen island in dark oak and marble",
    span: "small",
  },
  {
    id: "g9",
    image: unsplash("1529290130-4ca3753253ae", 1400),
    alt: "Indoor pool hall with timber screening",
    span: "wide",
  },
  {
    id: "g10",
    image: unsplash("1691425700573-5e2e6e4f6157", 1000),
    alt: "Concrete balcony detail against the sky",
    span: "small",
  },
  {
    id: "g11",
    image: unsplash("1668120089662-42642838cfef", 1400),
    alt: "Landscaped garden path",
    span: "wide",
  },
  {
    id: "g12",
    image: unsplash("1616594039964-ae9021a400a0", 1200),
    alt: "Master suite with brass chandelier",
    span: "tall",
  },
];
