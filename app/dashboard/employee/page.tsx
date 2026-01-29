"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payslipApi } from "@/lib/api"
import { FileText, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { getStoredUser } from "@/lib/auth"
import { toast } from "sonner"
import type { Payslip } from "@/types"

export default function EmployeeDashboard() {
  const user = getStoredUser()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    try {
      const response = await payslipApi.getMyPayslips()

      if (response.success && response.data) {
        setPayslips(response.data.slice(0, 3)) // Show latest 3
      }
    } catch (error) {
      toast.error("Failed to load payslips")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <ProtectedRoute allowedRoles={["employee"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Your employee dashboard</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payslips.length}</div>
              <p className="text-xs text-muted-foreground">Available payslips</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Net Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payslips.length > 0 ? formatCurrency(payslips[0].netPay) : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Most recent payslip</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date().toLocaleString("default", { month: "long" })}
              </div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Payslips</CardTitle>
                <CardDescription>Your latest payslip records</CardDescription>
              </div>
              <Link href="/payslips/my">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : payslips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payslips available</p>
            ) : (
              <div className="space-y-4">
                {payslips.map((payslip) => (
                  <div
                    key={payslip.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(payslip.year, parseInt(payslip.month) - 1).toLocaleString(
                          "default",
                          { month: "long", year: "numeric" }
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Net Pay: {formatCurrency(payslip.netPay)}
                      </p>
                    </div>
                    <Link href={`/payslips/${payslip.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
