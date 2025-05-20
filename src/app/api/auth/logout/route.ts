import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
      success: true,
    });

    // Expire both cookies by setting their expiry to a past date
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire the cookie
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Logout failed" }, { status: 500 });
  }
}
