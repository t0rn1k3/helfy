export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}
