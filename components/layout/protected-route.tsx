"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthUser } from "@/components/hooks/use-auth-user";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { status } = useSession();
  const user = useAuthUser();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || user === null) {
      router.push("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/dashboard/employee");
    }
  }, [router, allowedRoles, user, status]);

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated" || user === null) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
