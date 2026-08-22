import Hero from "@/components/sections/Hero";
import Introduction from "@/components/sections/Introduction";
import PropertyStats from "@/components/sections/PropertyStats";
import Architecture from "@/components/sections/Architecture";
import RoomShowcase from "@/components/sections/RoomShowcase";
import ScrollRooms from "@/components/sections/ScrollRooms";
import FloorPlan from "@/components/sections/FloorPlan";
import Materials from "@/components/sections/Materials";
import Gallery from "@/components/sections/Gallery";
import Location from "@/components/sections/Location";
import Lifestyle from "@/components/sections/Lifestyle";
import Booking from "@/components/sections/Booking";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Introduction />
      <PropertyStats />
      <Architecture />
      <RoomShowcase />
      <ScrollRooms />
      <FloorPlan />
      <Materials />
      <Gallery />
      <Location />
      <Lifestyle />
      <Booking />
      <Footer />
    </main>
  );
}
