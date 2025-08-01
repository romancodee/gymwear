import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/dbconnect';
import Product from '../../../../../model/product';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Get Product Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  try {
    const body = await request.json();

    const {
      name,
      description,
      category,
      tags,
      gender,
      sizes,
      variants,
      discount,
      discountType,
      isActive,
      isFeatured,
      images,
    } = body;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.tags = tags ?? product.tags;
    product.gender = gender ?? product.gender;
    product.sizes = sizes ?? product.sizes;
    product.variants = variants ?? product.variants;
    product.discount = discount ?? product.discount;
    product.discountType = discountType ?? product.discountType;
    product.isActive = isActive ?? product.isActive;
    product.isFeatured = isFeatured ?? product.isFeatured;
    product.images = images ?? product.images;

    await product.save();

    return NextResponse.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Edit Product Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
