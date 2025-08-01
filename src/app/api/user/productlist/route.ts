import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbconnect';
import Product from '../../../model/product';

;

export async function GET(req: Request) {
  try {
    await dbConnect();

  const products = await Product.find({ isActive: true })
  .sort({ createdAt: -1 })
  .lean();


    return NextResponse.json(
      {
        message: "Successfully fetched data",
        products,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to fetch data",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
