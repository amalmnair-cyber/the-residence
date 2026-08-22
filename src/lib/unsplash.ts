export function unsplash(id: string, width = 1600, quality = 80) {
  return `https://images.unsplash.com/photo-${id}?q=${quality}&w=${width}&auto=format&fit=crop`;
}
