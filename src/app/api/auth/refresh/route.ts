import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDb from "../../../lib/dbconnect";
import User from "../../../model/User";

interface DecodedRefreshToken {
  id: string;
  exp: number;
  iat: number;
}

export async function GET(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
    }

    const refreshSecret = process.env.Refresh_Token_Secret!;
    const accessSecret = process.env.Token_Secret_key!;

    // Verify the refresh token
    let decoded: DecodedRefreshToken;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret) as DecodedRefreshToken;
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 403 });
    }

    await connectDb();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a new access token containing full user information
    const newAccessToken = jwt.sign(
      {
        id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastUpdate: user.lastUpdate,
        tokenCreatedAt: new Date().toISOString(), // Important: update token creation time
      },
      accessSecret,
      { expiresIn: "15m" }
    );

    const response = NextResponse.json({
      message: "Access token refreshed successfully",
      token: newAccessToken,
    });

    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, 
    });

    return response;

  } catch (err: any) {
    console.error("Error refreshing access token:", err.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
