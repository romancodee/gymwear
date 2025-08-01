'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCart, CartItem } from './context/cartcontext';
import Link from 'next/link';
interface Size {
  size: string;
  stock: number;
}

interface Variant {
  color: string;
  totalStock: number;
  price: number;
  sizes: Size[];
  images: string[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  variants: Variant[];
  category: string;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortValue, setSortValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search')?.toLowerCase() || '';
  const {fetchCart}= useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/user/productlist', {
           method: 'GET',
  headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
    fetchCart();
  }, []);

  // Filter
  const filteredProducts = products.filter((product) => {
    const matchesCategory = category
      ? product.category.toLowerCase() === category.toLowerCase()
      : true;

    const matchesSearch =
      search === '' ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });
  

 
  


  // Sort
  const getSortedProducts = (productsToSort: Product[]) => {
    const sorted = [...productsToSort];

    if (sortValue === 'lowToHigh') {
     sorted.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));

    } else if (sortValue === 'highToLow') {
    sorted.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));

    } else if (sortValue === 'oldToNew') {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortValue === 'newToOld') {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortValue === 'featured') {
      return sorted.filter((p) => p.isFeatured === true);
    }

    return sorted;
  };

  // Reset to page 1 on filter/sort
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sortValue]);

  const finalProducts = getSortedProducts(filteredProducts);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = finalProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(finalProducts.length / productsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* <Navbar /> */}

      {category && (
        <div className="text-4xl font-bold text-center my-10 capitalize">
          {category}
        </div>
      )}

      {/* Sort dropdown */}
      <div className="my-4">
        <select
          id="sort"
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value)}
          className="w-52 px-4 py-3 border-2 text-lg font-medium rounded-md dark:bg-gray-800 dark:text-white border-gray-600"
        >
          <option value="">Sort...</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
          <option value="featured">Featured</option>
          <option value="newToOld">Date: New to Old</option>
          <option value="oldToNew">Date: Old to New</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {currentProducts.map((product) => {
  // ✅ Calculate the cheapest variant inside the map
  const cheapestVariant = product.variants.reduce((lowest, current) =>
    current.price < lowest.price ? current : lowest,
    product.variants[0]
  );

  return (
    <div
      key={product._id}
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
    >
      <div className="relative h-64 w-full">
        <Image
          src={cheapestVariant?.images?.[0] || '/placeholder.png'}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-700 flex-grow line-clamp-3 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-blue-600">
            ${cheapestVariant?.price?.toFixed(2) || 'N/A'}
          </span>

  {/* 🟠 Out of Stock Badge */}
 {product.variants.every((variant) => {
  const sizeStocks = variant.sizes || [];
  const total = sizeStocks.reduce((sum, s) => sum + s.stock, 0);
  return total === 0;
}) && (
  <span className="inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded mt-1">
    Out of Stock
  </span>
)}


  {/* 🟣 Color Swatches
  <div className="flex gap-2 mt-2">
    {product.variants.map((variant, idx) => (
      <div
        key={idx}
        className="w-4 h-4 rounded-full border border-gray-300"
        style={{ backgroundColor: variant.color.toLowerCase() }}
        title={variant.color}
      />
    ))}
  </div> */}

  {/* 🔵 Sizes */}
   {/* <div className="mt-1 text-sm text-gray-600">
   Sizes:{' '}
   {[
    ...new Set(
      product.variants.flatMap((variant) =>
        (variant.sizes || [])
          .filter((s) => s.stock > 0)
          .map((s) => s.size.toUpperCase())
      )
    ),
  ].join(', ')}
</div> */}


          <Link href={`/productDetail/${product.slug}`}>
            <button className="bg-blue-600 text-white py-2 px-5 rounded hover:bg-blue-700 transition">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
})}
</div>

      {/* Pagination Controls */}
     {/* Pagination */}
{totalPages > 1 && (
  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
    <button
      disabled={currentPage <= 1}
      onClick={() => setCurrentPage(1)}
      className={`px-4 py-2 rounded-lg font-medium ${
        currentPage <= 1
          ? 'bg-indigo-200 cursor-not-allowed'
          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
      }`}
    >
      &lt;&lt;
    </button>
    <button
      disabled={currentPage <= 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className={`px-4 py-2 rounded-lg font-medium ${
        currentPage <= 1
          ? 'bg-indigo-200 cursor-not-allowed'
          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
      }`}
    >
      &lt;
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .slice(
        Math.max(currentPage - 3, 0),
        Math.min(currentPage + 2, totalPages)
      )
      .map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-4 py-2 rounded-lg font-medium ${
            page === currentPage
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-200 hover:bg-indigo-300'
          }`}
        >
          {page}
        </button>
      ))}

    <button
      disabled={currentPage >= totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className={`px-4 py-2 rounded-lg font-medium ${
        currentPage >= totalPages
          ? 'bg-indigo-200 cursor-not-allowed'
          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
      }`}
    >
      &gt;
    </button>
    <button
      disabled={currentPage >= totalPages}
      onClick={() => setCurrentPage(totalPages)}
      className={`px-4 py-2 rounded-lg font-medium ${
        currentPage >= totalPages
          ? 'bg-indigo-200 cursor-not-allowed'
          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
      }`}
    >
      &gt;&gt;
    </button>
  </div>
)}

    </div>
  );
}
