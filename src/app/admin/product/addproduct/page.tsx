"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddProductForm() {
  const pathname = usePathname();

 type SizeOption = {
  size: string;
  stock: string;
};

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  sizes: SizeOption[];
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  images: File[];
};

const [formData, setFormData] = useState<ProductFormData>({
  name: '',
  description: '',
  price: '',
  sizes: [{ size: '', stock: '' }],
  category: '',
  isActive: true,
  isFeatured: false,
  images: [],
});

const handleSizeChange = (index: number, field: 'size' | 'stock', value: string) => {
  const newSizes = [...formData.sizes];
  newSizes[index] = {
    ...newSizes[index],
    [field]: value,
  };
  setFormData({ ...formData, sizes: newSizes });
};


  const handleAddSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: "", stock: "" }],
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrls = [];

    for (const file of formData.images) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "your_preset");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        {
          method: "POST",
          body: data,
        }
      );
      const imgData = await res.json();
      imageUrls.push(imgData.secure_url);
    }

    const res = await fetch("/api/admin/product/add", {
      method: "POST",
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        sizes: formData.sizes.map((s) => ({
          size: s.size,
          stock: parseInt(s.stock),
        })),
        images: imageUrls,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    if (result.success) {alert("Product added!");
    toast.success("product added")}
    else alert("Error: " + result.error);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      {/* <aside className="w-64 p-4 bg-gray-800 text-white h-screen space-y-2">
        <Link
          href="/admin/dashboard"
          className={`block hover:bg-gray-700 p-2 rounded ${
            pathname === "/admin/dashboard" ? "bg-gray-700" : ""
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/usermanagment"
          className={`block hover:bg-gray-700 p-2 rounded ${
            pathname === "/admin/usermanagment" ? "bg-gray-700" : ""
          }`}
        >
          User Management
        </Link>
        <Link
          href="/admin/product"
          className={`block hover:bg-gray-700 p-2 rounded ${
            pathname === "/admin/product" ? "bg-gray-700" : ""
          }`}
        >
          Products
        </Link>
      </aside> */}

      {/* Form */}
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
  <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
    
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          placeholder="Product name"
          className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          placeholder="Product description"
          className="w-full p-3 border rounded-md shadow-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-black"
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
        <input
          type="number"
          placeholder="Price"
          className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          type="text"
          placeholder="Category"
          className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sizes & Stock</label>
        <div className="space-y-2">
          {formData.sizes.map((s, i) => (
            <div key={i} className="flex gap-4">
              <input
                placeholder="Size"
                className="flex-1 p-2 border rounded-md shadow-sm"
                value={s.size}
                onChange={(e) => handleSizeChange(i, "size", e.target.value)}
              />
              <input
                placeholder="Stock"
                type="number"
                className="flex-1 p-2 border rounded-md shadow-sm"
                value={s.stock}
                onChange={(e) => handleSizeChange(i, "stock", e.target.value)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddSize}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Add Size
        </button>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
        <input
          type="file"
          multiple
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
          onChange={handleImageChange}
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-6 mt-4">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="form-checkbox h-5 w-5 text-black"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="form-checkbox h-5 w-5 text-black"
          />
          <span className="text-sm text-gray-700">Featured</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="mt-4 w-full bg-black text-white py-3 rounded-md hover:bg-gray-900 transition"
      >
        Add Product
      </button>
    </form>
  </div>
</main>
    </div>
  );
}
