import AnimatedCounter from "../ui/AnimatedCounter";
import { stats } from "@/data/stats";

export default function PropertyStats() {
  return (
    <section className="border-y border-line bg-bone py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <div className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-none text-ink">
                <AnimatedCounter value={stat.value} from={stat.from ?? 0} />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-stone">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
