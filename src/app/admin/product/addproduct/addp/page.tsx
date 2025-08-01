"use client";
import { useState,useEffect,useRef } from "react";
import { WithContext as ReactTags, Tag } from "react-tag-input";

const colorOptions = [
  { label: "Black", value: "Black" },
  { label: "White", value: "White" },
  { label: "Red", value: "Red" },
  { label: "Blue", value: "Blue" },
  { label: "Green", value: "Green" },
  { label: "Grey", value: "Grey" },
  { label: "Yellow", value: "Yellow" },
  { label: "Purple", value: "Purple" },
];

const sizeOptions = ["XS", "S", "M", "L", "XL"];

const genderOption = ["men", "women", "unisex"];
const categoryOptions = ["men", "women"];

const keyCodes = {
  comma: 188,
  enter: 13,
};
const delimiters = [keyCodes.comma, keyCodes.enter];

interface SizeStock {
  size: string;
  stock: number;
}

interface Variant {
  color: string;
  price: number;
  totalStock: number;
  sizes: SizeStock[];
  images: File[];
}

interface Product {
  name: string;
  description: string;
  gender: string;
  category: string;
  tags: string[];
  variants: Variant[];
   isActive: boolean;    
  isFeatured: boolean;
}

export default function CreateProductPage() {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [isActive,setIsActive]=useState<boolean>(true)
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [currentVariant, setCurrentVariant] = useState<Variant>({
    color: "",
    price: 0,
    totalStock: 0,
    sizes: [],
    images: [],
  });
  const [addedSizes, setAddedSizes] = useState<string[]>([]);
  const [sizeStockError, setSizeStockError] = useState<string>("");

  const handleAddition = (tag: Tag) => {
    setTags([...tags, tag]);
  };

  const handleDelete = (i: number) => {
    setTags((prev) => prev.filter((_, index) => index !== i));
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = [...tags];
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setTags(newTags);
  };

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files ? Array.from(e.target.files) : [];
  setCurrentVariant((prev) => ({
    ...prev,
    images: [...prev.images, ...files], // append images
  }));
};
const removeImageFromCurrentVariant = (index: number) => {
  setCurrentVariant((prev) => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index),
  }));
};
const handleAddSizeStock = (size: string, stock: number) => {
  const otherSizes = currentVariant.sizes.filter((s) => s.size !== size);
  const totalSizeStock = otherSizes.reduce((sum, s) => sum + s.stock, 0) + stock;

  if (totalSizeStock > currentVariant.totalStock) {
    setSizeStockError("Total size stock exceeds total stock");
    return;
  }

  const updatedSizes = [...otherSizes, { size, stock }];
  setCurrentVariant({ ...currentVariant, sizes: updatedSizes });

  // ✅ Add to addedSizes
  if (!addedSizes.includes(size)) {
    setAddedSizes([...addedSizes, size]);
  }

  setSizeStockError("");
};

  const handleAddVariant = () => {
   if (
  !currentVariant.color ||
  currentVariant.sizes.length === 0 ||
  currentVariant.images.length === 0 ||
  currentVariant.price <= 0 ||
  currentVariant.totalStock <= 0
) {
  alert("Please fill out all variant fields");
  return;
}
setVariants([...variants, currentVariant]);

setCurrentVariant({ color: "", price: 0, totalStock: 0, sizes: [], images: [] });
setAddedSizes([]);

if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
  };
useEffect(() => {
  const usedStock = currentVariant.sizes.reduce((sum, s) => sum + s.stock, 0);
  const remaining = currentVariant.totalStock - usedStock;
  if (remaining > 0) {
    setSizeStockError(""); // remove error if space is available
  }
}, [currentVariant.totalStock]);
const handleDeleteVariant = (index: number) => {
  const updated = [...variants];
  updated.splice(index, 1);
  setVariants(updated);
};




  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData();

  formData.append("name", name);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("gender", gender);
  formData.append("isActive", String(isActive));
  formData.append("isFeatured", String(isFeatured));
  formData.append("tags", JSON.stringify(tags.map((tag) => tag.text)));

  variants.forEach((variant, index) => {
    formData.append(`variants[${index}][color]`, variant.color);
    formData.append(`variants[${index}][price]`, variant.price.toString());
    formData.append(`variants[${index}][totalStock]`, variant.totalStock.toString());
    formData.append(`variants[${index}][sizes]`, JSON.stringify(variant.sizes));

  variant.images.forEach((imageFile) => {
      formData.append(`variantImages-${index}`, imageFile);
    });
  });

 
console.log("📦 Final submission payload:");
for (const pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}


  try {
    const res = await fetch("/api/admin/product/addp", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      console.log("✅ Product created:", result);
    } else {
      console.error("❌ Error:", result.message);
    }
  } catch (error) {
    console.error("❌ Submission failed:", error);
  }
};

  return (
    <div className="max-w-screen-lg mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg overflow-y-auto max-h-[90vh]">
  <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Product</h1>

  <form onSubmit={handleSubmit} className="space-y-6 text-sm">
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block font-semibold">Product Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 p-2 rounded" required />
      </div>

      <div className="space-y-2">
        <label className="block font-semibold">Gender</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-gray-300 p-2 rounded" required>
          <option value="">Select Gender</option>
          {genderOption.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block font-semibold">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 p-2 rounded" required>
          <option value="">Select Category</option>
          {categoryOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="block font-semibold">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 p-2 rounded" rows={3} required />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="block font-semibold">Tags</label>
        <div className="border border-gray-300 p-2 rounded bg-gray-50 min-h-[60px]">
          <ReactTags
            tags={tags}
            handleDelete={handleDelete}
            handleAddition={handleAddition}
            handleDrag={handleDrag}
            delimiters={delimiters}
            inputFieldPosition="bottom"
            autocomplete
            classNames={{
              tagInput: "my-2",
              tag: "inline-block bg-black text-white px-2 py-1 rounded mr-2 mb-2",
              remove: "ml-1 cursor-pointer text-red-300 hover:text-red-500 font-bold",
              tagInputField: "w-full p-2 border border-gray-300 rounded",
            }}
          />
        </div>
      </div>
    </div>

    <hr className="border-t my-4" />
    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Add Variant</h2>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block font-semibold">Color</label>
        <input type="text" list="color-options" value={currentVariant.color} onChange={(e) => setCurrentVariant({ ...currentVariant, color: e.target.value })} className="w-full border border-gray-300 p-2 rounded" />
        <datalist id="color-options">
          {colorOptions.map((color) => (
            <option key={color.value} value={color.value} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <label className="block font-semibold">Price</label>
        <input type="number" value={isNaN(currentVariant.price) ? '' : currentVariant.price} onChange={(e) => setCurrentVariant({ ...currentVariant, price: parseFloat(e.target.value) })} className="w-full border border-gray-300 p-2 rounded" />
      </div>

      <div className="space-y-2">
        <label className="block font-semibold">Total Stock</label>
        <input type="number" className="w-full border border-gray-300 p-2 rounded" value={currentVariant.totalStock || ""} onChange={(e) => setCurrentVariant({ ...currentVariant, totalStock: parseInt(e.target.value) || 0 })} />
        <p className="text-xs text-gray-500">Remaining stock: {currentVariant.totalStock - currentVariant.sizes.reduce((sum, s) => sum + s.stock, 0)}</p>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="block font-semibold">Size Stock</label>
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map((size) => (
            <div key={size}>
              <label className="text-xs font-medium">{size}</label>
              <input
                key={currentVariant.sizes.length + "-" + size}
                type="number"
                min={0}
                disabled={addedSizes.includes(size)}
                onBlur={(e) => handleAddSizeStock(size, parseInt(e.target.value))}
                placeholder="Stock"
                className="w-full border p-2 rounded"
              />
            </div>
          ))}
        </div>
        {sizeStockError && <p className="text-red-600 text-xs mt-1">{sizeStockError}</p>}
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="block font-semibold">Upload Images</label>
        <input type="file" ref={fileInputRef} multiple onChange={handleImageUpload} />
        <div className="flex flex-wrap gap-2 mt-2">
          {currentVariant.images.map((file, idx) => (
            <div key={idx} className="relative group w-20 h-20">
              <img src={URL.createObjectURL(file)} alt={`variant-${idx}`} className="w-full h-full object-cover rounded border" />
              <button type="button" onClick={() => removeImageFromCurrentVariant(idx)} className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <button type="button" onClick={handleAddVariant} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          Add Variant
        </button>
      </div>
    </div>

    <div className="flex items-center gap-6 mt-4">
      <label className="flex items-center gap-2 font-semibold">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
        Active
      </label>

      <label className="flex items-center gap-2 font-semibold">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4" />
        Featured
      </label>
    </div>

    {variants.length > 0 && (
      <div className="mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Variants</h3>
        <table className="w-full border border-gray-200 text-left text-sm table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Color</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total Stock</th>
              <th className="p-2 border">Sizes</th>
              <th className="p-2 border">Images</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => (
              <tr key={index} className="border">
                <td className="p-2 border">{variant.color}</td>
                <td className="p-2 border">{variant.price}</td>
                <td className="p-2 border">{variant.totalStock}</td>
                <td className="p-2 border">{variant.sizes.map((s) => `${s.size}: ${s.stock}`).join(", ")}</td>
                <td className="p-2 border">
                  <div className="flex gap-1 flex-wrap">
                    {variant.images.map((img, idx) => (
                      <img key={idx} src={URL.createObjectURL(img)} alt={`variant-preview-${idx}`} className="w-10 h-10 object-cover rounded border" />
                    ))}
                  </div>
                </td>
                <td className="p-2 border text-center">
                  <button onClick={() => handleDeleteVariant(index)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <div className="text-right">
      <button type="submit" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
        Add Product
      </button>
    </div>
  </form>
</div>

  );
}