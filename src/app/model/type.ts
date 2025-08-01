
export interface SizeStock {
  size: string;
  stock: number;
}

export interface Variant {
  color: string;
  price: number;
  stock: number;
  sizes: SizeStock[];
  images: File[];
}
