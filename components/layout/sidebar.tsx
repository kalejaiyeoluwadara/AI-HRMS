"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getStoredUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  FileText,
} from "lucide-react"

const roleRoutes: Record<UserRole, { label: string; path: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  superadmin: [
    { label: "Dashboard", path: "/dashboard/superadmin", icon: LayoutDashboard },
    { label: "Users", path: "/dashboard/users", icon: Users },
    { label: "Employees", path: "/employees", icon: UserCheck },
    { label: "Payroll", path: "/payroll", icon: DollarSign },
    { label: "Payslips", path: "/payslips", icon: FileText },
  ],
  admin: [
    { label: "Dashboard", path: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", path: "/dashboard/users", icon: Users },
    { label: "Employees", path: "/employees", icon: UserCheck },
    { label: "Payroll", path: "/payroll", icon: DollarSign },
    { label: "Payslips", path: "/payslips", icon: FileText },
  ],
  payroll_officer: [
    { label: "Dashboard", path: "/dashboard/payroll", icon: LayoutDashboard },
    { label: "Payroll", path: "/payroll", icon: DollarSign },
    { label: "Payslips", path: "/payslips", icon: FileText },
  ],
  employee: [
    { label: "Dashboard", path: "/dashboard/employee", icon: LayoutDashboard },
    { label: "My Payslips", path: "/payslips/my", icon: FileText },
  ],
}

export function Sidebar() {
  const pathname = usePathname()
  const user = getStoredUser()

  if (!user || pathname === "/login" || pathname === "/register") {
    return null
  }

  const routes = roleRoutes[user.role] || []

  return (
    <aside className="w-full p-4 min-h-screen border-none shadow-sm bg-background sticky top-0">
       <Link href="/" className="text-xl mb-8 pt-4 font-bold">
          HRMS
        </Link>
      <nav className="flex flex-col pt-12 gap-1">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.path || pathname.startsWith(route.path + "/")
          
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
