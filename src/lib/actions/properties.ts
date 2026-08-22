"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/dal";
import {
  propertyUpdateSchema,
  propertyImageUploadSchema,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/validation";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

function revalidatePropertyPages(propertyId: string) {
  revalidatePath("/(site)/[slug]", "page");
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function updateProperty(propertyId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = propertyUpdateSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    location: formData.get("location"),
    description: formData.get("description"),
    nightly_rate: Number(formData.get("nightly_rate")),
    cleaning_fee: Number(formData.get("cleaning_fee")),
    min_nights: Number(formData.get("min_nights")),
    max_guests: Number(formData.get("max_guests")),
    bedrooms: Number(formData.get("bedrooms")),
    bathrooms: Number(formData.get("bathrooms")),
    square_feet: Number(formData.get("square_feet")),
    floors: Number(formData.get("floors")),
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("property update failed", error);
    return { ok: false, message: "Could not save changes. Please try again." };
  }

  revalidatePropertyPages(propertyId);
  return { ok: true };
}

export async function uploadPropertyImage(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Please choose an image to upload." };
  }

  const parsed = propertyImageUploadSchema.safeParse({
    propertyId: formData.get("propertyId"),
    category: formData.get("category"),
    alt: formData.get("alt") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields." };
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type as keyof typeof ALLOWED_IMAGE_TYPES];
  if (!ext) {
    return { ok: false, message: "Please upload a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "Image must be under 5MB." };
  }

  const { propertyId, category, alt } = parsed.data;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("name")
    .eq("id", propertyId)
    .single();
  if (!property) {
    return { ok: false, message: "Property not found." };
  }

  const path = `${propertyId}/${category}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("property-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("image upload failed", uploadError);
    return { ok: false, message: "Could not upload the image. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("property-images").getPublicUrl(path);

  const { data: existing } = await supabase
    .from("property_images")
    .select("sort_order")
    .eq("property_id", propertyId)
    .eq("category", category)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error: insertError } = await supabase.from("property_images").insert({
    property_id: propertyId,
    url: publicUrl,
    alt: alt || `${property.name} ${category} photo`,
    category,
    sort_order: nextSortOrder,
    storage_path: path,
  });

  if (insertError) {
    console.error("image row insert failed", insertError);
    // DB row failed — don't leave an orphaned object behind in storage.
    await supabase.storage.from("property-images").remove([path]);
    return { ok: false, message: "Could not save the image. Please try again." };
  }

  revalidatePropertyPages(propertyId);
  return { ok: true };
}

export async function deletePropertyImage(imageId: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data: image, error: lookupError } = await supabase
    .from("property_images")
    .select("property_id, storage_path")
    .eq("id", imageId)
    .single();

  if (lookupError || !image) {
    return { ok: false, message: "Image not found." };
  }

  const { error: deleteError } = await supabase.from("property_images").delete().eq("id", imageId);
  if (deleteError) {
    console.error("image delete failed", deleteError);
    return { ok: false, message: "Could not delete the image. Please try again." };
  }

  // Only admin-uploaded images have a storage object to clean up — the
  // originally-seeded rows point at external Unsplash URLs.
  if (image.storage_path) {
    const { error: removeError } = await supabase.storage
      .from("property-images")
      .remove([image.storage_path]);
    if (removeError) {
      // The DB row (source of truth for what's shown on the site) is
      // already gone — a leftover storage object is harmless clutter, not
      // worth failing the request over.
      console.error("storage object removal failed", removeError);
    }
  }

  revalidatePropertyPages(image.property_id);
  return { ok: true };
}

export async function moveImage(imageId: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data: image, error: lookupError } = await supabase
    .from("property_images")
    .select("id, property_id, category")
    .eq("id", imageId)
    .single();
  if (lookupError || !image) {
    return { ok: false, message: "Image not found." };
  }

  const { data: siblings, error: siblingsError } = await supabase
    .from("property_images")
    .select("id, sort_order")
    .eq("property_id", image.property_id)
    .eq("category", image.category)
    .order("sort_order");
  if (siblingsError || !siblings) {
    return { ok: false, message: "Could not reorder. Please try again." };
  }

  const index = siblings.findIndex((s) => s.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) {
    return { ok: true };
  }

  const current = siblings[index];
  const swapWith = siblings[swapIndex];

  const [{ error: error1 }, { error: error2 }] = await Promise.all([
    supabase.from("property_images").update({ sort_order: swapWith.sort_order }).eq("id", current.id),
    supabase.from("property_images").update({ sort_order: current.sort_order }).eq("id", swapWith.id),
  ]);

  if (error1 || error2) {
    console.error("image reorder failed", error1 ?? error2);
    return { ok: false, message: "Could not reorder. Please try again." };
  }

  revalidatePropertyPages(image.property_id);
  return { ok: true };
}
