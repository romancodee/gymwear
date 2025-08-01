// /app/api/fix-variants/route.ts
import { NextRequest, NextResponse } from "next/server";
import Product from "@/app/model/productSchema";
import connectDB from "@/app/lib/dbconnect";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const products = await Product.find({});

    let updatedCount = 0;

    for (const product of products) {
      let modified = false;
      const slug = product.slug;

      if (!slug) {
        // If slug is missing, skip this product
        console.log(`Skipping product with no slug: ${product.name}`);
        continue;
      }

      const existing = await Product.findOne({
        slug,
        _id: { $ne: product._id },
      });

      if (existing) {
        console.log(`Duplicate slug found: ${slug} in ${product.name}`);
        continue; // Don't proceed if slug is not unique
      }

      const updatedVariants = product.variants.map((variant: any) => {
        const updated = variant.toObject?.() || variant;

        // Ensure totalStock exists
        if (
          updated.totalStock === undefined ||
          updated.totalStock === null
        ) {
          updated.totalStock = 0;
          modified = true;
        }

        return updated;
      });

      if (modified) {
        product.variants = updatedVariants;
        product.markModified("variants");

        try {
          await product.save();
          updatedCount++;
        } catch (err: any) {
          console.error(
            `Error saving product ${product.name}:`,
            err.message
          );
        }
      }
    }

    return NextResponse.json({
      message: "Fixed variant IDs and totalStock",
      updatedCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fix variants" },
      { status: 500 }
    );
  }
}
