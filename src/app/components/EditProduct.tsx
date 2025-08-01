"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

type EditProductProps = {
  productId: string;
};

export default function EditProduct({ productId }: EditProductProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch product data by ID and populate form
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/product/editproduct/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch product data");

        const data = await res.json();

        // Map backend product data to form state structure
        const loadedSizes: SizeOption[] = data.sizes?.map((s: any) => ({
          size: s.size.toUpperCase(),
          stock: s.stock.toString(),
        })) || defaultSizes.map((size) => ({ size, stock: "" }));

        const loadedVariants: Variant[] = (data.variants || [initialVariant]).map((v: any) => ({
          color: v.color || "",
          price: v.price?.toString() || "",
          stock: v.stock?.toString() || "",
          image: null,
          imagePreview: v.image || "",
          sizes: v.sizes?.map((s: any) => ({
            size: s.size.toUpperCase(),
            stock: s.stock.toString(),
          })) || defaultSizes.map((size) => ({ size, stock: "" })),
        }));

        const loadedImages: string[] = data.images || (data.image ? [data.image] : []);

        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          category: data.category || "",
          tags: data.tags || "",
          gender: data.gender || "",
          sizes: loadedSizes,
          variants: loadedVariants,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          images: [], // Files not available from backend, upload again if needed
          imagePreviews: loadedImages,
          discount: data.discount?.toString() || "",
          discountType: data.discountType || "",
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // Helper functions to update form state

  const handleSizeChange = (index: number, field: "size" | "stock", value: string) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleVariantSizeStockChange = (
    variantIndex: number,
    sizeIndex: number,
    stockValue: string
  ) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes[sizeIndex].stock = stockValue;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleVariantFieldChange = (
    variantIndex: number,
    field: keyof Variant,
    value: string | File | null
  ) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex][field] = value as any;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const removeVariant = (variantIndex: number) => {
    if (formData.variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }
    const updatedVariants = formData.variants.filter((_, i) => i !== variantIndex);
    setFormData({ ...formData, variants: updatedVariants });
  };

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

    const variantsWithBase64Images = await Promise.all(
      formData.variants.map(async (variant) => ({
        color: variant.color,
        price: parseFloat(variant.price),
        stock: parseInt(variant.stock, 10) || 0,
        image: variant.image ? await convertFileToBase64(variant.image) : variant.imagePreview || "",
        sizes: variant.sizes.map((s) => ({
          size: s.size.toUpperCase(),
          stock: parseInt(s.stock, 10) || 0,
        })),
      }))
    );

    const productData = {
      id: productId,
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
      images: formData.imagePreviews, // Send all image previews (base64 or URLs)
    };

    try {
      const res = await fetch(`/api/admin/product/editproduct/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully");
      // Optionally reload or redirect or reset form here
    } catch (error: any) {
      toast.error(error.message || "Error updating product");
    }
  };

  if (loading) return <p>Loading product data...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

      {/* Name */}
      <div>
        <label className="block mb-1 font-semibold">Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 font-semibold">Description</label>
        <textarea
          className="w-full border px-3 py-2 rounded"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block mb-1 font-semibold">Category</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block mb-1 font-semibold">Tags (comma separated)</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block mb-1 font-semibold">Gender</label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select gender</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>

      {/* Sizes with stock */}
      <div>
        <label className="block mb-1 font-semibold">Sizes & Stock</label>
        <div className="flex space-x-2">
          {formData.sizes.map((size, i) => (
            <div key={i} className="flex flex-col items-center">
              <button
                type="button"
                className={`px-4 py-2 rounded cursor-pointer border font-semibold ${
                  selectedSizeIndex === i
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedSizeIndex(i)}
              >
                {size.size.toUpperCase()}
              </button>
              {selectedSizeIndex === i && (
                <input
                  type="number"
                  min={0}
                  className="mt-1 border rounded px-2 py-1 w-20"
                  value={formData.sizes[i].stock}
                  onChange={(e) => handleSizeChange(i, "stock", e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div>
        <label className="block mb-2 font-semibold">Variants</label>
        {formData.variants.map((variant, vIndex) => (
          <div
            key={vIndex}
            className="border rounded p-4 mb-4 relative bg-gray-50"
          >
            <button
              type="button"
              className="absolute top-2 right-2 text-red-600 font-bold"
              onClick={() => removeVariant(vIndex)}
              title="Remove variant"
            >
              &times;
            </button>

            {/* Color */}
            <div>
              <label className="block mb-1">Color</label>
              <input
                type="text"
                value={variant.color}
                onChange={(e) => handleVariantFieldChange(vIndex, "color", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Price */}
            <div className="mt-2">
              <label className="block mb-1">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(e) => handleVariantFieldChange(vIndex, "price", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Stock */}
            <div className="mt-2">
              <label className="block mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) => handleVariantFieldChange(vIndex, "stock", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Sizes stock for this variant */}
            <div className="mt-2">
              <label className="block mb-1 font-semibold">Sizes Stock</label>
              <div className="flex space-x-2">
                {variant.sizes.map((size, sIndex) => (
                  <div key={sIndex} className="flex flex-col items-center">
                    <span className="text-sm font-semibold">{size.size}</span>
                    <input
                      type="number"
                      min={0}
                      className="border rounded px-2 py-1 w-16"
                      value={size.stock}
                      onChange={(e) =>
                        handleVariantSizeStockChange(vIndex, sIndex, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="mt-2">
              <label className="block mb-1">Variant Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleVariantImageChange(e, vIndex)}
              />
              {variant.imagePreview && (
                <img
                  src={variant.imagePreview}
                  alt={`Variant ${vIndex} preview`}
                  className="mt-2 h-24 object-contain"
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => setFormData({
            ...formData,
            variants: [...formData.variants, { ...initialVariant }],
          })}
        >
          Add Variant
        </button>
      </div>

      {/* Discount */}
      <div>
        <label className="block mb-1 font-semibold">Discount</label>
        <input
          type="number"
          min="0"
          value={formData.discount}
          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* Discount Type */}
      <div>
        <label className="block mb-1 font-semibold">Discount Type</label>
        <select
          value={formData.discountType}
          onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select type</option>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>
      </div>

      {/* Active & Featured */}
      <div className="flex space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span>Active</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          />
          <span>Featured</span>
        </label>
      </div>

      {/* Main Images Upload */}
      <div>
        <label className="block mb-1 font-semibold">Product Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        <div className="mt-2 flex flex-wrap gap-4">
          {formData.imagePreviews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Product image preview ${i}`}
              className="h-24 object-contain rounded border"
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Update Product"}
        </button>
      </div>
    </form>
  );
}
