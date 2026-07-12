import type { Role } from "@/app/generated/prisma/client";
import type { NextAuthConfig } from "next-auth";

const studentOnlyRoutes = [
  "/home",
  "/learn",
  "/portfolio",
  "/spend",
  "/news",
];
const sharedRoutes = ["/profile"];

function getPostLoginPath(role: string | undefined) {
  return role === "ADMIN" ? "/admin" : "/home";
}

function hasValidSession(auth: { user?: { id?: string; role?: string } } | null) {
  return Boolean(auth?.user?.id && auth.user.role);
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  // Required for `next start` and most hosts (Vercel sets host headers dynamically).
  trustHost: true,

  session: {
    strategy: "jwt",
  },

  providers: [],

  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id!;
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.avatarUrl = user.avatarUrl ?? user.image ?? null;
      }

      if (trigger === "update" && session?.user) {
        const next = session.user;
        if (typeof next.name === "string") token.name = next.name;
        if (typeof next.email === "string") token.email = next.email;
        if ("avatarUrl" in next) {
          token.avatarUrl =
            typeof next.avatarUrl === "string" ? next.avatarUrl : null;
        }
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = token.role as Role;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.avatarUrl =
          typeof token.avatarUrl === "string" ? token.avatarUrl : null;
        session.user.image =
          typeof token.avatarUrl === "string" ? token.avatarUrl : null;
      }

      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isAuthPage) {
        if (isLoggedIn && hasValidSession(auth)) {
          const destination = getPostLoginPath(auth.user.role);
          return Response.redirect(new URL(destination, nextUrl));
        }

        return true;
      }

      if (pathname.startsWith("/assignments")) {
        const rest = pathname.replace(/^\/assignments/, "") || "";
        return Response.redirect(new URL(`/learn${rest}`, nextUrl));
      }

      if (pathname.startsWith("/funds")) {
        return Response.redirect(new URL("/portfolio", nextUrl));
      }

      if (
        pathname.startsWith("/challenges") ||
        pathname.startsWith("/ranks") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin/challenges") ||
        pathname.startsWith("/admin/ranks") ||
        pathname.startsWith("/admin/funds") ||
        pathname.startsWith("/admin/analytics")
      ) {
        const target = pathname.startsWith("/admin") ? "/admin" : "/home";
        return Response.redirect(new URL(target, nextUrl));
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          return false;
        }

        if (auth.user.role !== "ADMIN") {
          return Response.redirect(new URL("/home", nextUrl));
        }

        return true;
      }

      if (studentOnlyRoutes.some((route) => pathname.startsWith(route))) {
        if (!isLoggedIn) {
          return false;
        }

        if (auth.user.role === "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }

        return true;
      }

      if (sharedRoutes.some((route) => pathname.startsWith(route))) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
