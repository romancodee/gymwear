import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbconnect";
import Product from "@/app/model/productSchema";
import { cookies } from "next/headers";
import { getUserDate } from "@/helper/getUserData";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import slugify from "slugify";
import mongoose from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

// POST /api/products
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Token missing" },
      { status: 401 }
    );
  }

  await dbConnect();

  const decoded = await getUserDate(token);
  if (!decoded) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }

  const formData = await req.formData();

  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const gender = formData.get("gender") as string;
    const category = formData.get("category") as string;
    const tags = JSON.parse(formData.get("tags") as string) as string[];
    const isActive = formData.get("isActive") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const variants: any[] = [];
// 🧠 Loop over variants using index
let index = 0;
while (formData.get(`variants[${index}][color]`)) {
  const color = formData.get(`variants[${index}][color]`) as string;
  const price = Number(formData.get(`variants[${index}][price]`));
  const totalStock = Number(formData.get(`variants[${index}][totalStock]`));
  const sizes = JSON.parse(formData.get(`variants[${index}][sizes]`) as string);

  // ✅ FIX: Fetch files using correct key
  const images: File[] = [];
  for (const entry of formData.getAll(`variantImages-${index}`)) {
    if (entry instanceof File) {
      images.push(entry);
    }
  }

 const savedImagePaths: string[] = [];

for (const imageFile of images) {
  const buffer = await imageFile.arrayBuffer();
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const uploadDir = path.join(process.cwd(), "public/uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  await fs.promises.writeFile(filePath, Buffer.from(buffer));

  // Save relative path (e.g., to access like `/uploads/image.png`)
  savedImagePaths.push(`/uploads/${fileName}`);
}

variants.push({ _id: new mongoose.Types.ObjectId(),  color, price, totalStock, sizes, images: savedImagePaths });

  index++;
}



    console.log("📦 Incoming product body:", JSON.stringify({
      name, description, gender, category, tags, isActive, isFeatured, variants
    }, null, 2));

    // === VALIDATION ===

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Product name is required and must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Description must be at least 10 characters." },
        { status: 400 }
      );
    }
let normalizedGender = gender.toLowerCase();
if (normalizedGender === "men") normalizedGender = "male";
if (normalizedGender === "women") normalizedGender = "female";

const allowedGenders = ["male", "female", "unisex"];
if (!allowedGenders.includes(normalizedGender)) {
  return NextResponse.json(
    { success: false, error: "Gender must be one of: male, female, unisex." },
    { status: 400 }
  );
}

    if (!category || typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Category is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, error: "Tags must be an array." },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one variant is required." },
        { status: 400 }
      );
    }

    for (const [index, variant] of variants.entries()) {
      if (!variant.color || typeof variant.color !== "string" || variant.color.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: `Variant ${index + 1}: Color is required.` },
          { status: 400 }
        );
      }

      const price = Number(variant.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { success: false, error: `Variant ${index + 1}: Price must be a valid positive number.` },
          { status: 400 }
        );
      }

      if (
        variant.totalStock == null ||
        isNaN(Number(variant.totalStock)) ||
        Number(variant.totalStock) < 0
      ) {
        return NextResponse.json(
          { success: false, error: `Variant ${index + 1}: Total stock must be 0 or more.` },
          { status: 400 }
        );
      }

      if (!Array.isArray(variant.images)) {
        return NextResponse.json(
          { success: false, error: `Variant ${index + 1}: Images must be an array.` },
          { status: 400 }
        );
      }

      if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
        return NextResponse.json(
          { success: false, error: `Variant ${index + 1}: At least one size is required.` },
          { status: 400 }
        );
      }

      for (const [i, sizeObj] of variant.sizes.entries()) {
        if (!sizeObj.size || typeof sizeObj.size !== "string" || sizeObj.size.trim() === "") {
          return NextResponse.json(
            {
              success: false,
              error: `Variant ${index + 1} → Size ${i + 1}: Size name is required.`,
            },
            { status: 400 }
          );
        }

        if (
          sizeObj.stock == null ||
          isNaN(Number(sizeObj.stock)) ||
          Number(sizeObj.stock) < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Variant ${index + 1} → Size ${i + 1}: Stock must be 0 or more.`,
            },
            { status: 400 }
          );
        }
      }
    }

    const rootPrice = Math.min(...variants.map((v) => Number(v.price)));
  const baseSlug = slugify(name, { lower: true, strict: true });
const slug = `${baseSlug}-${Date.now()}`;

    const product = new Product({
      name,
      description,
      price: rootPrice,
      tags,
      variants,
      slug,
      category,
      isActive,
      isFeatured,
      gender,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();
    console.log("✅ Saved Product Variant IDs:", product.variants.map((v: { _id: string }) => v._id));

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ Error saving product:", errorMessage);
    return NextResponse.json(
      { success: false, error: "Internal server error. Failed to save product." },
      { status: 500 }
    );
  }
}
