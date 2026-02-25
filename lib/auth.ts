import type { User } from "@/types";

/**
 * Convert NextAuth session user to our User type.
 */
export function sessionUserToUser(sessionUser: {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
}): User | null {
  if (!sessionUser?.id || !sessionUser?.role) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email || "",
    name: sessionUser.name || "",
    role: sessionUser.role as User["role"],
  };
}
