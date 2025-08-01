import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '../../lib/dbconnect';
import Cart from '../../model/cart';
import Product from '../../model/product';
import { ProductData} from '../../model/productType';
import { getUserDate } from '@/helper/getUserData';
import { Types } from 'mongoose';

interface CartItem {
   userId:string;
  productId: string;
  variantId: string;
  size: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
}

// ========= [POST] Add to Cart =========
export async function POST(req: NextRequest) {
  await dbConnect();
 const cookiesstore= await cookies();
 const token = cookiesstore.get('token')?.value;

  if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const userId = await getUserDate(token);
  if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { productId, variantId, size, quantity, name, image, price }: CartItem = await req.json();

  let cart = await Cart.findOne({ userId });


  // let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Create new cart with one item
    cart = new Cart({
      userId,
      items: [
        {
          userId,
          productId,
          variantId,
          size,
          quantity,
          price,
          name,
          image,
        },
      ],
    });
  } else {
    // Check if same item already exists
    const existingItemIndex = cart.items.findIndex(
      (item: any) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId &&
        item.size === size
    );

    if (existingItemIndex > -1) {
      // Increase quantity if already exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        userId,
        productId,
        variantId,
        size,
        quantity,
        price,
        name,
        image,
      });
    }
  }
  cart.updatedAt=new Date();
  await cart.save();

  return NextResponse.json({ success: true, cart });
}

// ========= [GET] Get Cart =========


export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const cookiesStore = await cookies();
    const token = cookiesStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserDate(token);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get cart directly
  const cart = await Cart.findOne({ userId }).lean() as { items: any[] } | null;

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ success: true, cart: { items: [] } });
    }

    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items, // items already contain price, name, image
      },
    });

  } catch (error) {
    console.error('[GET CART ERROR]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


// ========= [DELETE] Remove from Cart =========
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  if (!token)
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const userId = await getUserDate(token);
  if (!userId)
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { productId, variantId, size } = await req.json();

  if (!productId || !variantId || !size) {
    return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });
  }

  const prevLength = cart.items.length;

  cart.items = cart.items.filter((item: any) =>
    !(item.productId.toString() === productId &&
      item.variantId.toString() === variantId &&
      item.size === size)
  );

  if (cart.items.length === prevLength) {
    return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
  }

  cart.updatedAt = new Date();
  await cart.save();

  return NextResponse.json({ success: true, message: 'Item removed successfully', cart });
}


// ========= [PUT] Update Quantity =========
export async function PUT(req: NextRequest) {
  await dbConnect();
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  if (!token)
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const userId = await getUserDate(token);
  if (!userId)
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { productId, variantId, size, quantity } = await req.json();

  if (!productId || !variantId || !size || typeof quantity !== 'number' || quantity < 1) {
    return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });
  }

  const item = cart.items.find((item: any) =>
    item.productId.toString() === productId &&
    item.variantId.toString() === variantId &&
    item.size === size
  );

  if (!item) {
    return NextResponse.json({ success: false, message: 'Item not found in cart' }, { status: 404 });
  }

  item.quantity = quantity;
  cart.updatedAt = new Date();
  await cart.save();

  return NextResponse.json({ success: true, message: 'Quantity updated', cart });
}
