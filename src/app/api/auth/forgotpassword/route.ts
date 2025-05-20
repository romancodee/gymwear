import connectDb from "../../../lib/dbconnect";
import User from "../../../model/User";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sendEmail from "../../../lib/sendEmail";

export async function POST(req: Request) {
  try {
    await connectDb();

    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/resetpassword?token=${token}`;

    await sendEmail(email, "Reset your password", `Click to reset: ${resetLink}`);

    return NextResponse.json({ success: true, message: "Reset link sent" });
  } catch (error: any) {
    console.error("Error sending reset email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
