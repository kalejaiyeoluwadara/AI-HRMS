"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { userApi, employeeApi, payrollApi } from "@/lib/api"
import { useBackendToken } from "@/components/hooks/use-auth-user"
import { Users, DollarSign, FileText, Shield, UserPlus, Clock, UserCheck, Settings } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SuperAdminDashboard() {
  const token = useBackendToken()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    pendingPayroll: 0,
    totalPayroll: 0,
  })
  const [loading, setLoading] = useState(true)
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string
    action: string
    user: string
    timestamp: Date
    type: "user" | "payroll" | "system"
  }>>([])

  useEffect(() => {
    loadStats()
    loadAuditLogs()
  }, [token])

  const loadStats = async () => {
    try {
      const [usersRes, employeesRes, payrollRes] = await Promise.all([
        userApi.getAll(token),
        employeeApi.getAll(token),
        payrollApi.getAll(token),
      ])

      const pending = payrollRes.success && payrollRes.data
        ? payrollRes.data.filter((p) => p.status === "pending").length
        : 0

      setStats({
        totalUsers: usersRes.success && usersRes.data ? usersRes.data.length : 0,
        totalEmployees: employeesRes.success && employeesRes.data ? employeesRes.data.length : 0,
        pendingPayroll: pending,
        totalPayroll: payrollRes.success && payrollRes.data ? payrollRes.data.length : 0,
      })
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    // Mock audit log data - in production, this would come from an API
    const mockLogs = [
      { id: "1", action: "User created", user: "admin@example.com", timestamp: new Date(Date.now() - 5 * 60000), type: "user" as const },
      { id: "2", action: "Payroll approved", user: "superadmin@example.com", timestamp: new Date(Date.now() - 15 * 60000), type: "payroll" as const },
      { id: "3", action: "User deleted", user: "admin@example.com", timestamp: new Date(Date.now() - 30 * 60000), type: "user" as const },
      { id: "4", action: "Employee updated", user: "admin@example.com", timestamp: new Date(Date.now() - 45 * 60000), type: "system" as const },
      { id: "5", action: "Payroll run created", user: "superadmin@example.com", timestamp: new Date(Date.now() - 60 * 60000), type: "payroll" as const },
    ]
    setAuditLogs(mockLogs)
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getActionIcon = (type: "user" | "payroll" | "system") => {
    switch (type) {
      case "user":
        return UserCheck
      case "payroll":
        return DollarSign
      default:
        return Clock
    }
  }

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your HRMS system</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Users", value: stats.totalUsers, description: "System users", Icon: Users },
            { title: "Total Employees", value: stats.totalEmployees, description: "Active employees", Icon: Users },
            { title: "Pending Payroll", value: stats.pendingPayroll, description: "Awaiting approval", Icon: DollarSign },
            { title: "Total Payroll Runs", value: stats.totalPayroll, description: "All time", Icon: FileText },
          ].map(({ title, value, description, Icon }) => (
            <Card key={title} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { label: "Manage Users", href: "/dashboard/users", Icon: Shield },
                { label: "Create User Account", href: "/dashboard/users", Icon: UserPlus },
                { label: "Manage Employees", href: "/employees", Icon: Users },
                { label: "View Payroll", href: "/payroll", Icon: DollarSign },
                { label: "All Payslips", href: "/payslips", Icon: FileText },
                { label: "Settings", href: "/dashboard/settings", Icon: Settings },
              ].map(({ label, href, Icon }) => (
                <Link key={label} href={href}>
                  <Button variant="outline" className="w-full justify-start">
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Recent system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No audit logs available</p>
                ) : (
                  auditLogs.map((log) => {
                    const Icon = getActionIcon(log.type)
                    return (
                      <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="mt-0.5">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{log.action}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{log.user}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
