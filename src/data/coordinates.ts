// Fixed geographic coordinates for each property, used only to fetch
// current weather. A structural fact like room layouts, not editable
// content — doesn't belong in the admin form or the database.
export const propertyCoordinates: Record<string, { lat: number; lon: number }> = {
  "the-elmstead": { lat: 51.556, lon: -0.178 },
  "the-kiln-house": { lat: 50.2109, lon: -5.4802 },
};
