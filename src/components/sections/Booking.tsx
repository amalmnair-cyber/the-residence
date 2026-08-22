import RevealText from "../ui/RevealText";
import BookingForm from "./BookingForm";
import { getConfirmedDateRanges } from "@/lib/queries/bookings";
import { site } from "@/data/content";

export default async function Booking() {
  const unavailableRanges = await getConfirmedDateRanges();

  return (
    <section id="booking" className="bg-paper py-28 sm:py-36 lg:py-44">
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <div className="text-center">
          <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
            Reservations
          </RevealText>
          <RevealText
            as="h2"
            className="mx-auto mt-6 max-w-xl text-[clamp(2.25rem,5.4vw,4.25rem)] font-display leading-[1.05] text-ink"
          >
            Book your stay
          </RevealText>
          <RevealText
            as="p"
            className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-stone"
          >
            {`${site.propertyName} is available for exclusive, whole-house stays. Select your dates to check availability and request a reservation.`}
          </RevealText>
        </div>

        <div className="relative mt-16">
          <BookingForm unavailableRanges={unavailableRanges} />
        </div>
      </div>
    </section>
  );
}
