"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { userApi, employeeApi, payrollApi } from "@/lib/api"
import { Users, DollarSign, FileText, Shield, UserPlus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    pendingPayroll: 0,
    totalPayroll: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [usersRes, employeesRes, payrollRes] = await Promise.all([
        userApi.getAll(),
        employeeApi.getAll(),
        payrollApi.getAll(),
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
                { label: "Manage Users", href: "/users", Icon: Shield },
                { label: "Create User Account", href: "/users", Icon: UserPlus },
                { label: "Manage Employees", href: "/employees", Icon: Users },
                { label: "View Payroll", href: "/payroll", Icon: DollarSign },
                { label: "All Payslips", href: "/payslips", Icon: FileText },
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
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Database</span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">API</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">AI Service</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">User Management</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
