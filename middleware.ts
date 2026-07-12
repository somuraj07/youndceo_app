import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/home/:path*",
    "/learn/:path*",
    "/portfolio/:path*",
    "/spend/:path*",
    "/news/:path*",
    "/assignments/:path*",
    "/funds/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/challenges/:path*",
    "/ranks/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
