import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {jwtDecode} from 'jwt-decode';
import { JwtPayload } from '../gymwear/src/app/model/interface';

// export interface JwtPayload {
//     role: string;
//     email: string;
//     firstname: string;
//     lastname: string;
//     createdAt: string;
//     lastupdate: string;
//     isActive: boolean;
//     tokenCreatedAt: string;
//     exp?: number;
//     [key: string]: any;
//   }

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = ['/login', '/signup'].includes(path);

  const token = request.cookies.get("token")?.value || "";
  const refreshToken = request.cookies.get("refreshToken")?.value || "";
//math.floor give you time in milisecond and /1000 convert it into second
  const now = Math.floor(Date.now() / 1000);

  try {
    if (!token) {
      if (!isPublic) {
        console.log("No token — redirecting to login");
        return redirectToLogin(request, "unauthorized");
      }
      return NextResponse.next();
    }

    let decoded: JwtPayload;
    try {
      decoded = jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.log("Invalid token — redirecting to login");
      return redirectToLogin(request, "invalidToken");
    }

    const role = decoded.role;
    //get the current time and /1000 to convert it into second
    const tokenCreatedAt = new Date(decoded.tokenCreatedAt).getTime() / 1000;

    ///60 to convert it in to mintues
    const ageInMinutes = (now - tokenCreatedAt) / 60;

    if (ageInMinutes > 2) {
      console.log("Access token expired — trying refresh token");

      try {
        if (refreshToken) {
          const res = await fetch(`${request.nextUrl.origin}/api/users/refresh`, {
            method: "GET",
            headers: { Cookie: `refreshToken=${refreshToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            const response = NextResponse.next();
            response.cookies.set("token", data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 60 * 15, // 15 minutes
            });
            return response;
          } else {
            console.log("Refresh token invalid — redirecting to login");
            return redirectToLogin(request, "sessionExpired");
          }
        } else {
          console.log("No refresh token — redirecting to login");
          return redirectToLogin(request, "sessionExpired");
        }
      } catch (error) {
        console.log("Error refreshing token:", error);
        return redirectToLogin(request, "sessionExpired");
      }
    }

    if (path.startsWith("/admin") && role !== "admin") {
      console.log("Non-admin trying to access admin page");
      return redirectToCorrectPage(role, request);
    }

    if (path.startsWith("/user") && role !== "user") {
      console.log("Non-user trying to access user page");
      return redirectToCorrectPage(role, request);
    }

    if (isPublic && token) {
      return redirectToCorrectPage(role, request);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return redirectToLogin(request, "sessionExpired");
  }
}

function redirectToLogin(request: NextRequest, reason: string) {
  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("error", reason);

  const response = NextResponse.redirect(loginUrl);

  // Only delete cookies when necessary (e.g., session expired)
  if (reason === "sessionExpired" || reason === "unauthorized") {
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
  }

  return response;
}

function redirectToCorrectPage(role: string, request: NextRequest) {
  const redirectUrl = new URL(role === "admin" ? "/admin" : "/user", request.nextUrl.origin);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/admin/:path*",
    "/user/:path*",
    "/profile/:path*", 
  ],
};
