import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/dal";
import { getPropertyById, getPropertyImages } from "@/lib/queries/properties";
import PropertyEditForm from "@/components/admin/PropertyEditForm";
import PropertyImageManager from "@/components/admin/PropertyImageManager";

export default async function AdminPropertyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const [heroImages, galleryImages] = await Promise.all([
    getPropertyImages(id, "hero"),
    getPropertyImages(id, "gallery"),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/properties"
        className="text-[12px] uppercase tracking-[0.1em] text-stone transition-colors hover:text-ink"
      >
        ← Properties
      </Link>

      <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-brass">Content</p>
      <h1 className="mt-2 font-display text-3xl text-ink">{property.name}</h1>

      <div className="mt-10">
        <PropertyEditForm property={property} />
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <PropertyImageManager propertyId={id} heroImages={heroImages} galleryImages={galleryImages} />
      </div>
    </div>
  );
}
