import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/dal";
import { getProperties } from "@/lib/queries/properties";

export default async function AdminPropertiesPage() {
  await requireAdmin();
  const properties = await getProperties();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Content</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Properties</h1>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/admin/properties/${p.id}`}
            className="flex items-center justify-between py-5 transition-colors hover:text-brass"
          >
            <div>
              <p className="font-display text-lg text-ink">{p.name}</p>
              <p className="mt-1 text-[13px] text-stone">{p.location}</p>
            </div>
            <span className="text-[12px] uppercase tracking-[0.08em] text-stone">Edit →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
