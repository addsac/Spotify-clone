import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Token will exist if the user is logged in
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  const { pathname } = req.nextUrl;

  // Allow the request if the following are true...
  // 1) It's a request for next-auth session & provider fetching
  // 2) The token exist
  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  // Redirecting the users if they don't have a token and are requesting a protected route
  if(!token && pathname !== "/login"){
    return NextResponse.redirect("/login")
  }
}
