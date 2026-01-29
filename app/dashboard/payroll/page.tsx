"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payrollApi } from "@/lib/api"
import { DollarSign, AlertCircle, FileCheck, Clock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PayrollOfficerDashboard() {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalRuns: 0,
    thisMonth: 0,
    anomalies: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await payrollApi.getAll()

      if (response.success && response.data) {
        const pending = response.data.filter((p) => p.status === "pending").length
        const thisMonth = response.data.filter((p) => {
          const now = new Date()
          return new Date(p.createdAt).getMonth() === now.getMonth() &&
                 new Date(p.createdAt).getFullYear() === now.getFullYear()
        }).length
        const totalAnomalies = response.data.reduce((acc, p) => {
          return acc + (p.anomalies?.length || 0)
        }, 0)

        setStats({
          pendingApprovals: pending,
          totalRuns: response.data.length,
          thisMonth,
          anomalies: totalAnomalies,
        })
      }
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["payroll_officer"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payroll Officer Dashboard</h1>
          <p className="text-muted-foreground">Manage payroll operations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.anomalies}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common payroll tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/payroll/run">
                <Button className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Run Payroll
                </Button>
              </Link>
              <Link href="/payroll">
                <Button variant="outline" className="w-full justify-start">
                  <FileCheck className="mr-2 h-4 w-4" />
                  View All Payroll
                </Button>
              </Link>
              <Link href="/payslips">
                <Button variant="outline" className="w-full justify-start">
                  <FileCheck className="mr-2 h-4 w-4" />
                  View Payslips
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payroll Runs</CardTitle>
              <CardDescription>Latest payroll activities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all payroll runs in the payroll section
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
