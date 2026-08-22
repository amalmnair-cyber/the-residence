import { redirect, notFound } from "next/navigation";
import { getProperties } from "@/lib/queries/properties";

// No standalone "choose a property" landing page — the homepage goes
// straight into the flagship property (lowest sort_order), and switching
// between properties happens via the persistent tab in the Navbar instead
// of being a gate visitors have to pass through first.
export default async function Home() {
  const properties = await getProperties();
  if (properties.length === 0) notFound();
  redirect(`/${properties[0].slug}`);
}
