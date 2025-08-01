// lib/productService.ts
import dbConnect from './dbconnect';
import Product from '../model/productSchema';
import type { ProductData } from '../model/productType';



export const getProductBySlug = async (slug: string): Promise<ProductData | null> => {
  await dbConnect();

 const product = await Product.findOne({ slug }).lean<ProductData>();

  if (!product) return null;

  
  const newProduct:ProductData=
  {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    gender: product.gender,
    tags: product.tags || [],
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    variants: (product.variants || []).map((variant: any) => ({
      _id: variant._id?.toString(),
      color: variant.color,
      price: variant.price,
      totalStock: variant.totalStock,
      images: variant.images || [],
      sizes: (variant.sizes || []).map((size: any) => ({
        size: size.size,
        stock: size.stock,
      })),
    })),
  };
    console.log(newProduct)
  return newProduct;

};
