import type { Role } from "@/app/generated/prisma/client";

export function hasRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole);
}

export function isAdmin(role: Role) {
  return role === "ADMIN";
}
