import { getProductBySlug } from '../../lib/productService';
import { notFound } from 'next/navigation';
import { ProductData } from '../../model/productType';
import ProductDetailClient from '../../components/ProductDetailClient';
import NavBar from '../../components/NavBar';
// app/productDetail/[slug]/page.tsx


export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product: ProductData | null = await getProductBySlug(params.slug);

  if (!product) return notFound();
  // console.log("product ",product)
   
  return (

        <>
      {/* <NavBar /> */}
      <ProductDetailClient product={product} />
    </>
  )
}
