// // app/productDetail/[id]/page.tsx
// import Image from 'next/image';
// import { getProductById } from '../lib/productService';
// import { notFound } from 'next/navigation';
// import { IProduct } from '../model/product';

// export default async function ProductDetailPage({ params }: { params: { id: string } }) {
// const product: IProduct | null = await getProductById(params.id)
//   if (!product) return notFound();

//   const defaultVariant = product.variants[0];

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
//       {/* Left: Images */}
//       <div className="flex flex-col md:flex-row gap-4">
//         {/* Variant thumbnails */}
//         <div className="flex md:flex-col gap-2">
//           {product.variants.map((variant, idx) => (
//             <Image
//               key={idx}
//               src={variant.image}
//               alt={variant.color}
//               width={80}
//               height={80}
//               className="border rounded cursor-pointer object-cover"
//             />
//           ))}
//         </div>
//         {/* Main Image */}
//         <div className="flex-1">
//           <Image
//             src={defaultVariant.image}
//             alt={product.name}
//             width={600}
//             height={600}
//             className="rounded-lg object-cover w-full"
//           />
//         </div>
//       </div>

//       {/* Right: Info */}
//       <div className="space-y-5">
//         <h1 className="text-2xl font-bold">{product.name}</h1>
//         <p className="text-lg text-gray-700">Rs. {product.finalPrice?.toLocaleString()}</p>
//         <p className="text-sm text-gray-500">Tax included. Shipping calculated at checkout.</p>

//         {/* Colors */}
//         <div>
//           <p className="text-sm font-semibold">Available Colors:</p>
//           <div className="flex gap-2 mt-2">
//             {product.variants.map((variant, idx) => (
//               <div key={idx} className="flex flex-col items-center">
//                 <Image
//                   src={variant.image}
//                   alt={variant.color}
//                   width={50}
//                   height={50}
//                   className="rounded border"
//                 />
//                 <span className="text-xs">{variant.color}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Sizes */}
//         <div>
//           <p className="text-sm font-semibold mt-4">Sizes:</p>
//           <div className="flex gap-3 mt-2">
//             {defaultVariant.sizes.map((opt) => (
//               <button
//                 key={opt.size}
//                 disabled={opt.stock === 0}
//                 className={`px-4 py-2 border rounded ${
//                   opt.stock === 0
//                     ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
//                     : 'hover:bg-black hover:text-white'
//                 }`}
//               >
//                 {opt.size}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Quantity */}
//         <div className="flex items-center gap-4 mt-4">
//           <label htmlFor="qty" className="text-sm font-semibold">
//             Quantity
//           </label>
//           <input
//             id="qty"
//             type="number"
//             min="1"
//             defaultValue={1}
//             className="w-16 border px-2 py-1 rounded"
//           />
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row gap-4 mt-6">
//           <button className="bg-black text-white py-3 px-6 uppercase tracking-wide hover:opacity-90 transition">
//             Add to Cart
//           </button>
//           <button className="border border-black text-black py-3 px-6 uppercase tracking-wide hover:bg-black hover:text-white transition">
//             Buy it Now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
