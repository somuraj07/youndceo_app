import type { Role } from "@/app/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    name: string;
    email: string;
    avatarUrl?: string | null;
  }
}
