// import { NextResponse } from "next/server";
// import dbConnect from "../../../../lib/dbconnect";
// import productSchema from "@/app/model/productSchema";
// import { cookies } from "next/headers";
// import { getUserDate } from "@/helper/getUserData"; // Ensure correct import

// function generateSlug(text: string) {
//   return text
//     .toLowerCase()
//     .trim()
//     .replace(/[\s\W-]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// export async function POST(req: Request) {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;

//   if (!token) {
//     return NextResponse.json(
//       { success: false, error: "No token provided" },
//       { status: 401 }
//     );
//   }

//   await dbConnect();

//   const decoded = await getUserDate(token);
//   if (!decoded) {
//     return NextResponse.json(
//       { success: false, error: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const body = await req.json();
//   const {
//     name,
//     description,
//     tags,
//      gender,
//     category,
//     isActive = true,
//     isFeatured = false,
//     variants,
   
//   } = body;

//   // --- Basic validations ---
//   if (!name || typeof name !== "string") {
//     return NextResponse.json(
//       { success: false, error: "Name is required and must be a string" },
//       { status: 400 }
//     );
//   }

//   if (!Array.isArray(variants) || variants.length === 0) {
//     return NextResponse.json(
//       { success: false, error: "At least one variant is required" },
//       { status: 400 }
//     );
//   }

//   if (!["male", "female", "unisex"].includes(gender)) {
//     return NextResponse.json(
//       { success: false, error: "Gender must be male, female or unisex" },
//       { status: 400 }
//     );
//   }

//   for (const [index, variant] of variants.entries()) {
//     const priceNum = Number(variant.price);
//     if (isNaN(priceNum) || priceNum <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Variant at index ${index} must have a valid positive price`,
//         },
//         { status: 400 }
//       );
//     }

//     if (!variant.color || typeof variant.color !== "string") {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Variant at index ${index} must have a valid color`,
//         },
//         { status: 400 }
//       );
//     }

//     if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Variant at index ${index} must include at least one size`,
//         },
//         { status: 400 }
//       );
//     }

//     for (const [i, sizeObj] of variant.sizes.entries()) {
//       if (
//         !sizeObj.size ||
//         typeof sizeObj.size !== "string" ||
//         sizeObj.size.trim() === ""
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `Variant ${index} - Size ${i} is missing a valid size name`,
//           },
//           { status: 400 }
//         );
//       }

//       if (
//         sizeObj.stock == null ||
//         isNaN(Number(sizeObj.stock)) ||
//         Number(sizeObj.stock) < 0
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: `Variant ${index} - Size ${i} must have stock >= 0`,
//           },
//           { status: 400 }
//         );
//       }
//     }
//   }

//   if (!image || typeof image !== "string" || image.trim() === "") {
//     return NextResponse.json(
//       { success: false, error: "Valid image URL is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     new URL(image);
//   } catch {
//     return NextResponse.json(
//       { success: false, error: "Image must be a valid URL" },
//       { status: 400 }
//     );
//   }

//   // Calculate root price (lowest variant price)
//   const variantPrices = variants.map((v) => Number(v.price));
//   const rootPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;


//   // Calculate total stock across all variants and sizes
//   const totalStock = variants.reduce((total, variant) => {
//     return (
//       total +
//       (Array.isArray(variant.sizes)
//         ? variant.sizes.reduce(
//             (sum: number, sz: { stock: number | string }) =>
//               sum + (Number(sz.stock) || 0),
//             0
//           )
//         : 0)
//     );
//   }, 0);

//   const slug = generateSlug(name);

//   try {
//     const product = new Product({
//       name,
//       description,
//       price: rootPrice,
//       tags: Array.isArray(tags) ? tags : [],
//       variants,
//       countInStock: totalStock,
//       category,
//       isActive,
//       isFeatured,
//       gender,
     
//       slug,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     await product.save();

//     return NextResponse.json({ success: true, product });
//   } catch (error) {
//     console.error("Product save error:", error, "Input:");
//     return NextResponse.json(
//       { success: false, error: "Error saving product" },
//       { status: 500 }
//     );
//   }
// }
