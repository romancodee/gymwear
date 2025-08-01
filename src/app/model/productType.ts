// src/types/productTypes.ts
export interface ProductData {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  isFeatured: boolean;
  gender: 'male' | 'female' | 'unisex';
  // discount: number;
  // discountType: 'flat' | 'percent' | 'percentage' | 'fixed';
  // image: string;
  slug?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;

  variants: {
    _id: string;
    color: string;
    price: number;
    totalStock: number; // total stock for the variant
     images: string[];// multiple images for the variant
    sizes: {
      size: string;
      stock: number;
      _id?: string;
    }[];
  }[];
}
