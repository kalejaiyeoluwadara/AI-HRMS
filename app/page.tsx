"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getStoredUser } from "@/lib/auth"
import { Oval } from "react-loader-spinner"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getStoredUser()
      if (user) {
        if (user.role === "superadmin") {
          router.push("/dashboard/superadmin")
        } else if (user.role === "admin") {
          router.push("/dashboard/admin")
        } else if (user.role === "payroll_officer") {
          router.push("/dashboard/payroll")
        } else {
          router.push("/dashboard/employee")
        }
      }
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center"> 
          <Oval color="hsl(var(--primary))" secondaryColor="hsl(var(--secondary))" height={40} width={40} ariaLabel="oval-loading" />
      </div>
    </div>
  )
}
