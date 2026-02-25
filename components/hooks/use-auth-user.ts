"use client";

import { useSession } from "next-auth/react";
import { sessionUserToUser } from "@/lib/auth";
import type { User } from "@/types";

/**
 * Returns the current user in our app's User format, or null if not authenticated.
 */
export function useAuthUser(): User | null {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  return sessionUserToUser(session.user);
}

/**
 * Returns the backend JWT token for API calls, or null if not authenticated.
 */
export function useBackendToken(): string | null {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session) {
    return null;
  }

  return (session as { backendToken?: string }).backendToken ?? null;
}
