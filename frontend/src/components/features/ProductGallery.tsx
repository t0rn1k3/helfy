import { useState } from 'react';
import type { ProductImage } from '@helfy/shared';

import { cn } from '@/lib/utils';
import { getProductImageUrl } from '@/lib/formatPrice';

interface ProductGalleryProps {
  slug: string;
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ slug, images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const galleryImages =
    sorted.length > 0
      ? sorted.map((image) => ({ id: image.id, url: image.url, alt: image.alt ?? productName }))
      : [{ id: 'fallback', url: getProductImageUrl(slug, 800, 800), alt: productName }];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        <img src={active.url} alt={active.alt} className="size-full object-cover" />
      </div>
      {galleryImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                index === activeIndex ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={image.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
