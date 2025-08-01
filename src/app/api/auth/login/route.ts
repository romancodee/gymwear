import connectDb from "../../../lib/dbconnect";
import User from "../../../model/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    await connectDb();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User does not exists" }, { status: 400 });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect Password Or Email" }, { status: 400 });
    }
    if (!user.isActive) {
      return Response.json({ error: "Account is inactive. Contact admin." }, { status: 403 });
    }

    const tokenData = {
    id: user._id.toString(),
      email: user.email,
      firstname:user.firstname,
      lastname:user.lasttname,
      createdAt:user.createdAt,
      lastUpdate:user.lastUpdate,
      isActive:user.isActive,
      role:user.role,
      tokenCreatedAt: new Date() 
     
    };

    
    const secret = process.env.Token_Secret_key;
    const refreshSecret = process.env.Refresh_Token_Secret;

    if (!secret || !refreshSecret) {
      throw new Error("Secret keys are missing in .env");
    }

    const token = jwt.sign(tokenData, secret, { expiresIn: "1d" });
    const refreshToken=jwt.sign({ id: user._id.toString() },refreshSecret,{expiresIn:"5d"})
    const response = NextResponse.json({
      message: "Login successfully",
      success: true,
      token,refreshToken
    });
  
   
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 *60* 24, 
    });
    
   
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60  * 60 * 24 *5, 
    });

    return response;

  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
