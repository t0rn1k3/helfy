export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function getProductImageUrl(slug: string, width = 600, height = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/${width}/${height}`;
}
