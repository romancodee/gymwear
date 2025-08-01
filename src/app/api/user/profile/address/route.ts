import { NextRequest, NextResponse } from "next/server";
import { getUserDate } from "@/helper/getUserData";
import User from "../../../../model/User";
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
  firstName,
  lastName,
  email,
  phone,
  address,
  city,
  zipCode,
  country,
  isDefault,
} = body;
    if (!firstName || !address || !phone) {
  return NextResponse.json({
    success: false,
    message: "First name, address, and phone are required.",
  }, { status: 400 });
    }

    // Reset previous default address if new one is default
    if (!Array.isArray(user.addresses)) {
  user.addresses = [];
}
if (isDefault) {
  user.addresses.forEach((adr: any) => (adr.isDefault = false));
}

user.addresses.push({
  firstName,
  lastName,
  email,
  phone,
  address,
  city,
  zipCode,
  country,
  isDefault,
});

// ✅ This is necessary for nested arrays!
    user.markModified("addresses");
console.log("Before save, addresses:", user.addresses);
    await user.save();

    // ✅ Optional: Fetch again to confirm
    const updatedUser = await User.findById(user._id);
    console.log("After save, addresses in DB:", updatedUser?.addresses);
  return NextResponse.json({
    success: true,
      user: {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    addresses: user.addresses ?? []  // ✅ make sure to return this!
  }});
    
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

export async function GET(req: NextRequest) {
  await connectDB();

  const cookieStore =await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
  }

  try {
    const decodedId = await getUserDate(token); // Your JWT decoder function
    const user= await User.findById(decodedId);

    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ user, success: true });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong", error, success: false }, { status: 500 });
  }
}


