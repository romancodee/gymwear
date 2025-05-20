'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { products } from "./lib/profuct";

export default function Home() {
  const [images, setImages] = useState({} as Record<string, string>);

  useEffect(() => {
    async function fetchImages() {
      const newImages: Record<string, string> = {};
      for (const product of products) {
        try {
          const res = await fetch(`/api//user/getimage?query=${encodeURIComponent(product.query)}`);
          const data = await res.json();
          if (res.ok && data.imageUrl) {
            newImages[product.id] = data.imageUrl;
          } else {
            newImages[product.id] = "/placeholder.png"; // fallback local image if none found
          }
        } catch {
          newImages[product.id] = "/placeholder.png";
        }
      }
      setImages(newImages);
    }
    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Gym Apparel</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
            {images[product.id] ? (
              <Image
                src={images[product.id]}
                alt={product.name}
                width={400}
                height={300}
                className="rounded"
              />
            ) : (
              <div className="w-[400px] h-[300px] bg-gray-200 rounded animate-pulse" />
            )}
            <h2 className="mt-4 text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="mt-2 font-bold text-blue-600">${product.price}</p>
            <button className="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
