import connectDb from "../../../lib/dbconnect";
import User from "../../../model/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";


export async function POST(req: Request) {
  await connectDb();
  const { token, password } = await req.json();

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({ error: 'Token invalid or expired' }, { status: 400 });
  }

  user.password = await bcryptjs.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return NextResponse.json({ success: true, message: 'Password reset successful' });
}
