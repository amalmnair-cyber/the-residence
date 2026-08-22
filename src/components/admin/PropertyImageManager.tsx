"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { deletePropertyImage, moveImage, uploadPropertyImage } from "@/lib/actions/properties";
import type { PropertyImage } from "@/lib/queries/properties";

function ImageRow({ image, isFirst, isLast }: { image: PropertyImage; isFirst: boolean; isLast: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleMove(direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      const result = await moveImage(image.id, direction);
      if (!result.ok) setError(result.message ?? "Could not reorder.");
    });
  }

  function handleDelete() {
    const confirmed = window.confirm("Delete this image? This can't be undone.");
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePropertyImage(image.id);
      if (!result.ok) setError(result.message ?? "Could not delete.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-line-soft py-3 last:border-b-0">
      <div className="relative h-16 w-24 flex-none overflow-hidden rounded-md bg-bone-2">
        <Image src={image.url} alt={image.alt} fill sizes="96px" className="object-cover" />
      </div>
      <p className="min-w-0 flex-1 truncate text-[13px] text-stone">{image.alt}</p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isPending || isFirst}
          onClick={() => handleMove("up")}
          aria-label="Move up"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={isPending || isLast}
          onClick={() => handleMove("down")}
          aria-label="Move down"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="ml-2 cursor-pointer text-[11px] uppercase tracking-[0.08em] text-red-700 transition-colors hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error && <p className="w-full text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

function UploadForm({ propertyId, category }: { propertyId: string; category: "hero" | "gallery" }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await uploadPropertyImage(formData);
      if (!result.ok) {
        setError(result.message ?? "Could not upload the image.");
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="category" value={category} />
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-stone">
          Add image (JPEG/PNG/WebP, under 5MB)
        </label>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="text-[13px] text-stone file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-line file:bg-transparent file:px-4 file:py-1.5 file:text-[11px] file:uppercase file:tracking-[0.08em] file:text-ink file:transition-colors hover:file:border-ink"
        />
      </div>
      <input
        type="text"
        name="alt"
        placeholder="Alt text (optional)"
        className="border-b border-line bg-transparent px-1 py-1.5 text-[13px] text-ink outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-full bg-ink px-5 py-2 text-[11px] uppercase tracking-[0.08em] text-bone transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Uploading" : "Upload"}
      </button>
      {error && <p className="w-full text-[12px] text-red-600">{error}</p>}
    </form>
  );
}

function ImageCategorySection({
  title,
  hint,
  propertyId,
  category,
  images,
}: {
  title: string;
  hint: string;
  propertyId: string;
  category: "hero" | "gallery";
  images: PropertyImage[];
}) {
  return (
    <div>
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="mt-1 text-[12px] text-stone">{hint}</p>
      {images.length === 0 ? (
        <p className="py-4 text-[13px] text-stone">No images uploaded yet — using a placeholder.</p>
      ) : (
        <div className="mt-4">
          {images.map((img, i) => (
            <ImageRow key={img.id} image={img} isFirst={i === 0} isLast={i === images.length - 1} />
          ))}
        </div>
      )}
      <UploadForm propertyId={propertyId} category={category} />
    </div>
  );
}

export default function PropertyImageManager({
  propertyId,
  heroImages,
  galleryImages,
}: {
  propertyId: string;
  heroImages: PropertyImage[];
  galleryImages: PropertyImage[];
}) {
  return (
    <div className="space-y-12">
      <ImageCategorySection
        title="Hero image"
        hint="The first image here is used as the page's hero photo."
        propertyId={propertyId}
        category="hero"
        images={heroImages}
      />
      <ImageCategorySection
        title="Gallery"
        hint="The first image here is used on the introduction section."
        propertyId={propertyId}
        category="gallery"
        images={galleryImages}
      />
    </div>
  );
}
