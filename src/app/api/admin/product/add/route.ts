import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbconnect';
import Product from '../../../../model/product';
import { cookies } from 'next/headers';
import { getUserDate } from '../../../../../helper/getUserData';

export async function POST(req: Request) {
    const cookieStore=await cookies();
    const token = cookieStore.get('token')?.value||"";
     if(!token){
        return NextResponse.json({message:"No token Exist"
        },{status:401})
      }
      const decoded=await getUserDate(token)
      if(!decoded){
        return NextResponse.json({message:"invalid token"},{status:401})
      }
  try {
    await dbConnect();

    const body = await req.json();
    const {
      name,
      description,
      price,
      sizes,
      category,
      isActive,
      isFeatured,
      images,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      description,
      price,
      sizes, // Expecting [{ size, stock }]
      category,
      isActive,
      isFeatured,
      images, // Cloudinary image URLs
      createdAt: new Date(),
    });

    await product.save();

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Product add error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
