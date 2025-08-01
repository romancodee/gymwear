import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import dbconnect from '../../lib/dbconnect';
import dummyproduct from '../../lib/dummyproduct'
import product from '../../model/product'


export async function GET() {
  try {
    await dbconnect();
    await product.deleteMany();

    // Set isActive true on all products if not already present
    const seededProducts = dummyproduct.map(p => ({
  ...p,
  isActive: p.isActive ?? true,
  gender: p.gender ?? 'men', // ✅ Add default gender if missing
}));

    await product.insertMany(seededProducts);

    return NextResponse.json({ success: true, message: 'Products seeded' });
  } catch (err: any) {
    console.error("Seeding error:", err);
    return NextResponse.json(
      { success: false, message: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

