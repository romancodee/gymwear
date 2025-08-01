import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbconnect";
import Product from "../../../../model/product";
import { cookies } from "next/headers";
import { getUserDate } from "../../../../../helper/getUserData";

export async function GET(req: Request, { params }: { params: { id: string } }) {


  // Get the token from cookies
  const cookieStore =await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (!token) {
    return NextResponse.json({ message: "No token exists" }, { status: 401 });
  }

  const decoded = await getUserDate(token);
  if (!decoded) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    // Connect to the database
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    const page = parseInt(searchParams.get("page") || "1");

    const skip = (page - 1) * limit;

    // Fetch paginated products
    const products = await Product.find({}).skip(skip).limit(limit).lean();

    // Optionally: total count (for frontend pagination)
    const total = await Product.countDocuments();

    return NextResponse.json(
      { products, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching product details:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// status change
export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (!token) {
    return NextResponse.json({ message: "No token exists" }, { status: 401 });
  }

  const decoded = await getUserDate(token);
  if (!decoded) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { id, status } = body;

    if (!id || typeof status !== "boolean") {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: status }, // ✅ use boolean field
      { new: true, runValidators: true, strict: false }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Status updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating product status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
