"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from 'next/image';
// import Select from 'react-select'

type SizeOption = {
  size: string;
  stock: string;
};

type Variant = {
  color: string;
  price: string;
  stock: string;
  image: File | null;
  imagePreview: string;
  sizes: SizeOption[];
};

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  tags: string;
  gender: string;
  sizes: SizeOption[];
  variants: Variant[];
  isActive: boolean;
  isFeatured: boolean;
  images: File[];
  imagePreviews: string[];
  discount: string;
  discountType: string;
};

const defaultSizes = ["XS", "S", "M", "L", "XL"];

const initialVariant: Variant = {
  color: "",
  price: "",
  stock: "",
  image: null,
  imagePreview: "",
  sizes: defaultSizes.map((size) => ({ size, stock: "" })),
};

const initialFormState: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  tags: "",
  gender: "",
  sizes: defaultSizes.map((size) => ({ size, stock: "" })),
  variants: [initialVariant],
  isActive: true,
  isFeatured: false,
  images: [],
  imagePreviews: [],
  discount: "",
  discountType: "flat",
};

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);

  // Update main sizes stock
  const handleSizeChange = (index: number, field: "size" | "stock", value: string) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData({ ...formData, sizes: newSizes });
  };

  // Update variant size stock
  const handleVariantSizeStockChange = (
    variantIndex: number,
    sizeIndex: number,
    stockValue: string
  ) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes[sizeIndex].stock = stockValue;
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Update variant fields: color, price, stock
  const handleVariantFieldChange = (
    variantIndex: number,
    field: keyof Variant,
    value: string | File | null
  ) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex][field] = value as any;
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Remove variant but keep at least one
  const removeVariant = (variantIndex: number) => {
    if (formData.variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }
    const updatedVariants = formData.variants.filter((_, i) => i !== variantIndex);
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Handle variant image file change and create preview
  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>, vIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const updatedVariants = [...formData.variants];
      updatedVariants[vIndex].image = file;
      updatedVariants[vIndex].imagePreview = reader.result as string;
      setFormData({ ...formData, variants: updatedVariants });
    };
    reader.readAsDataURL(file);
  };

  // Handle main images upload and preview
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

    try {
      const base64Previews = await Promise.all(fileArray.map(toBase64));
      setFormData((prev) => ({
        ...prev,
        images: fileArray,
        imagePreviews: base64Previews,
      }));
    } catch {
      toast.error("Error reading image files.");
    }
  };

  // Convert variant images to base64 string for backend before sending
  const convertFileToBase64 = (file: File | null): Promise<string> => {
    return new Promise((resolve) => {
      if (!file) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return toast.error("Missing product name");
    }

    const hasInvalidVariantPrice = formData.variants.some((variant) => {
      const priceValue = parseFloat(variant.price);
      return !variant.price.trim() || isNaN(priceValue) || priceValue <= 0;
    });

    if (hasInvalidVariantPrice) {
      toast.error("One or more variant prices are missing or invalid");
      return;
    }

    const preparedSizes = formData.sizes.map((s) => ({
      size: s.size.toUpperCase(),
      stock: parseInt(s.stock, 10) || 0,
    }));

    const totalStock = preparedSizes.reduce((acc, cur) => acc + cur.stock, 0);

    // Convert all variant images to base64 string before sending
    const variantsWithBase64Images = await Promise.all(
      formData.variants.map(async (variant) => ({
        color: variant.color,
        price: parseFloat(variant.price),
        stock: parseInt(variant.stock, 10) || 0,
        image: variant.image ? await convertFileToBase64(variant.image) : "",
        sizes: variant.sizes.map((s) => ({
          size: s.size.toUpperCase(),
          stock: parseInt(s.stock, 10) || 0,
        })),
      }))
    );

    const productData = {
      name: formData.name,
      description: formData.description,
      sizes: preparedSizes,
      countInStock: totalStock,
      category: formData.category,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      variants: variantsWithBase64Images,
      gender: formData.gender,
      discount: formData.discount,
      discountType: formData.discountType,
      image: formData.imagePreviews[0] || "",
    };

    try {
      const res = await fetch("/api/admin/product/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Unknown error");
      }

      toast.success("Product added successfully!");
      setFormData(initialFormState);
      setSelectedSizeIndex(0);
    } catch (error: any) {
      toast.error(error.message || "Failed to add product.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-8">
      <main className="flex-1 max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold">Add New Product</h1>

        {/* General Info */}
        <section className="bg-white p-6 rounded shadow space-y-6">
          <h2 className="text-xl font-semibold">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Product Name</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Category</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
              <div className="md:col-span-2">
    <label className="block font-medium mb-1">Tags (comma-separated)</label>
    <input
      type="text"
      className="w-full border rounded p-2"
      placeholder="e.g. gym, performance, sportswear"
      value={formData.tags}
      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
    />
  </div>
          </div>
        </section>

        {/* Sizes & Gender */}
        <section className="bg-white p-6 rounded shadow space-y-6">
          <h2 className="text-xl font-semibold">Sizes & Gender</h2>
          <div>
            <label className="block font-medium mb-1">Sizes (click to select)</label>
            <div className="flex gap-3 flex-wrap">
              {formData.sizes.map((size, i) => (
                <button
                  type="button"
                  key={i}
                  className={`px-4 py-2 rounded cursor-pointer border font-semibold 
                    ${selectedSizeIndex === i ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-200"}`}
                  onClick={() => setSelectedSizeIndex(i)}
                >
                  {size.size}
                </button>
              ))}
            </div>
            <div className="mt-3 max-w-xs">
              <label className="block mb-1 font-medium">
                Stock for selected size ({formData.sizes[selectedSizeIndex]?.size}):
              </label>
              <input
                type="number"
                min={0}
                className="w-full border rounded p-2"
                value={formData.sizes[selectedSizeIndex]?.stock}
                onChange={(e) => handleSizeChange(selectedSizeIndex, "stock", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Gender</label>
            <select
              className="w-full border rounded p-2"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select gender</option>
              <option value="unisex">Unisex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-white p-6 rounded shadow space-y-6">
          <h2 className="text-xl font-semibold">Variants</h2>
          {formData.variants.map((variant, vIndex) => (
            <div
              key={vIndex}
              className="border rounded p-4 space-y-4 relative bg-gray-50"
              aria-label={`Variant ${vIndex + 1}`}
            >
              <button
                type="button"
                className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
                onClick={() => removeVariant(vIndex)}
                aria-label={`Remove variant ${vIndex + 1}`}
              >
                &times;
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-1">Color</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={variant.color}
                    onChange={(e) => handleVariantFieldChange(vIndex, "color", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Price</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded p-2"
                    value={variant.price}
                    onChange={(e) => handleVariantFieldChange(vIndex, "price", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Total Stock</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded p-2"
                    value={variant.stock}
                    onChange={(e) => handleVariantFieldChange(vIndex, "stock", e.target.value)}
                  />
                </div>
              </div>

              {/* Sizes per variant */}
              <div>
                <label className="block font-medium mb-2">Stock per Size</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {variant.sizes.map((size, sIndex) => (
                    <div key={sIndex}>
                      <div className="font-semibold mb-1">{size.size}</div>
                      <input
                        type="number"
                        min={0}
                        className="w-full border rounded p-1 text-center"
                        value={size.stock}
                        onChange={(e) =>
                          handleVariantSizeStockChange(vIndex, sIndex, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant image upload */}
              <div>
                <label className="block font-medium mb-1">Variant Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleVariantImageChange(e, vIndex)}
                />
                {variant.imagePreview && (
                  <img
                    src={variant.imagePreview}
                    alt={`Variant ${vIndex + 1} Preview`}
                    className="mt-2 max-w-xs h-auto rounded border"
                  />
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                variants: [
                  ...formData.variants,
                  {
                    ...initialVariant,
                    sizes: defaultSizes.map((size) => ({ size, stock: "" })),
                  },
                ],
              })
            }
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Variant
          </button>
        </section>

        {/* Main Images */}
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">Product Images</h2>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          <div className="flex flex-wrap gap-4 mt-4">
            {formData.imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Preview ${idx + 1}`}
                className="w-28 h-28 object-cover rounded border"
              />
            ))}
          </div>
        </section>
        {/* Product Settings */}
<section className="bg-white p-6 rounded shadow space-y-6">
  <h2 className="text-xl font-semibold">Product Settings</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block font-medium mb-1">Discount</label>
      <input
        type="number"
        min={0}
        className="w-full border rounded p-2"
        placeholder="0"
        value={formData.discount}
        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
      />
    </div>
    <div>
      <label className="block font-medium mb-1">Discount Type</label>
      <select
        className="w-full border rounded p-2"
        value={formData.discountType}
        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
      >
        <option value="">Select type</option>
        <option value="percentage">Percentage</option>
        <option value="flat">Flat</option>
      </select>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="isActive"
        checked={formData.isActive}
        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
      />
      <label htmlFor="isActive" className="font-medium">Is Active</label>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="isFeatured"
        checked={formData.isFeatured}
        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
      />
      <label htmlFor="isFeatured" className="font-medium">Is Featured</label>
    </div>
  </div>
</section>


        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          Submit Product
        </button>
      </main>
    </div>
  );
}
