import { NextRequest, NextResponse } from "next/server";
import { getUserDate } from "@/helper/getUserData";
import User from "../../../../../model/User";
import connectDB from "@/app/lib/dbconnect";
import { cookies } from "next/headers";

export async function DELETE(request: NextRequest) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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

    const { addressId } = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID is required." },
        { status: 400 }
      );
    }

    // ❗ Fix the typo: it’s `.filter()` not `.filtered()`
    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== addressId
    );

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted successfully",
        user,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error deleting address:", err);
    return NextResponse.json(
      { success: false, message: "Error: " + err.message },
      { status: 500 }
    );
  }
}
