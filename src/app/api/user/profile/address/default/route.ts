import { NextRequest, NextResponse } from "next/server";
import { getUserDate } from "@/helper/getUserData";
import User from "../../../../../model/User";
import connectDB from "@/app/lib/dbconnect";
import { cookies } from "next/headers";
export async function PUT(request: NextRequest) {
  await connectDB();

  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: No token found." },
      { status: 401 }
    );
  }

  const decodedId = await getUserDate(token);
  if (!decodedId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Invalid token." },
      { status: 401 }
    );
  }

  try {
    const user = await User.findById(decodedId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log("Incoming request body:", body); // ✅ DEBUG LOG

    const { addressId } = body;

    // ✅ VALIDATE addressId
    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID is required." },
        { status: 400 }
      );
    }

    // ✅ CHECK if addressId exists in user's addresses
    const addressExists = user.addresses.some(
      (addr: any) => addr._id.toString() === addressId
    );

    if (!addressExists) {
      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404 }
      );
    }

    // ✅ SET DEFAULT FLAG
    user.addresses = user.addresses.map((addr: any) => {
      return {
        ...addr.toObject?.() ?? addr, // handle both Mongoose doc or plain obj
        isDefault: addr._id.toString() === addressId,
      };
    });

    await user.save();

    // ✅ RETURN FULL USER WITH ADDRESSES (FIXED)
    const updatedUser = await User.findById(decodedId).select(
      "-password -__v"
    ); // optional: hide sensitive fields

    return NextResponse.json(
      {
        success: true,
        message: "Default address set successfully.",
        user: updatedUser, // ✅ FIXED: return updated user object
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Set default address error:", err);
    return NextResponse.json(
      { success: false, message: "Error: " + err.message },
      { status: 500 }
    );
  }
}
