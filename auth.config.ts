import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  providers: [],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          return false;
        }

        if (auth.user.role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      }

      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
