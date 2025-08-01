import { NextRequest, NextResponse } from "next/server";
import { getUserDate } from "@/helper/getUserData";
import User from "../../../model/User";
import connectDB from "@/app/lib/dbconnect";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  await connectDB();

  const cookieStore =await cookies();
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
    const body = await req.json();

    const user = await User.findOne({ _id: decodedId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const {
      FirstName,
      LastName,
      Email,
      phone,
      address,
      city,
      zipCode,
      country,
      isDefault,
    } = body;

    // Reset previous default address if new one is default
    if (isDefault) {
      user.address.forEach((adr:any) => (adr.isDefault = false));
    }

    user.address.push({
      FirstName,
      LastName,
      Email,
      phone,
      address,
      city,
      zipCode,
      country,
      isDefault,
    });

    await user.save();

    return NextResponse.json(
      { success: true, message: "Address added successfully." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Add address error:", err.message);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while adding the address.",
        error: err.message,
      },
      { status: 500 }
    );
  }
}


