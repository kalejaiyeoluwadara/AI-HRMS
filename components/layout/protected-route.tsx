"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getStoredUser } from "@/lib/auth"
import type { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    if (allowedRoles) {
      const user = getStoredUser()
      if (user && !allowedRoles.includes(user.role)) {
        router.push("/dashboard/employee")
      }
    }
  }, [router, allowedRoles])

  if (!isAuthenticated()) {
    return null
  }

  if (allowedRoles) {
    const user = getStoredUser()
    if (user && !allowedRoles.includes(user.role)) {
      return null
    }
  }

  return <>{children}</>
}
