import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from './app/model/interface';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ✅ UPDATED: Treat '/' as public
  const isPublic = ['/', '/login', '/signup'].includes(path);

  const token = request.cookies.get("token")?.value || "";
  const refreshToken = request.cookies.get("refreshToken")?.value || "";

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
    const tokenCreatedAt = new Date(decoded.tokenCreatedAt).getTime() / 1000;
    const ageInMinutes = (now - tokenCreatedAt) / 60;

    if (ageInMinutes > 2) {
      console.log("Access token expired — trying refresh token");

      try {
        if (refreshToken) {
          const res = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
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
              maxAge: 60 * 15,
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

    // ✅ UPDATED: Admin lands on '/' → redirect to /admin
    if (path === "/" && role === "admin") {
      console.log("Admin landed on root — redirecting to /admin");
      return redirectToCorrectPage(role, request);
    }
if (path.startsWith("/user") && role !== "user") {
  console.log("Admin trying to access user-only page");
  return redirectToCorrectPage(role, request);
}
    // ✅ NEW: If user has token and role is 'user', allow access to '/'
    if (path === "/" && role === "user") {
      console.log("User landed on landing page — allow access");
      return NextResponse.next();
    }

    // ✅ Prevent users from accessing admin
    if (path.startsWith("/admin") && role !== "admin") {
      console.log("Non-admin trying to access admin page");
      return redirectToCorrectPage(role, request);
    }

    // ✅ If public route and already authenticated
    if (isPublic && token) {
      // ✅ NEW: prevent login/signup access when already authenticated
      console.log("Already logged in — redirect to correct role page");
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

  if (reason === "sessionExpired" || reason === "unauthorized") {
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
  }

  return response;
}

function redirectToCorrectPage(role: string, request: NextRequest) {
  let redirectPath = "/";
  if (role === "admin") {
    redirectPath = "/admin";
  } else if (role === "user") {
    redirectPath = "/"; // ✅ stays on landing page
  } else {
    redirectPath = "/login";
  }
  const redirectUrl = new URL(redirectPath, request.nextUrl.origin);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/", // ✅ included in public
    "/login",
    "/signup",
    "/admin/:path*",
    "/user/:path*",
    "/profile/:path*",
     "/user/:path*",
  ],
};
