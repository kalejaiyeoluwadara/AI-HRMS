"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payrollApi } from "@/lib/api"
import { useAuthUser, useBackendToken } from "@/components/hooks/use-auth-user"
import { Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { PayrollRun } from "@/types"

export default function PayrollPage() {
  const user = useAuthUser()
  const token = useBackendToken()
  const [payrolls, setPayrolls] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayrolls()
  }, [token])

  const loadPayrolls = async () => {
    try {
      const response = await payrollApi.getAll(token)
      if (response.success && response.data) {
        setPayrolls(response.data)
      }
    } catch (error) {
      toast.error("Failed to load payroll data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success"
      case "pending":
        return "warning"
      case "rejected":
        return "destructive"
      default:
        return "default"
    }
  }

  const canApprove = user?.role === "admin"
  const canRun = user?.role === "payroll_officer" || user?.role === "admin"

  return (
    <ProtectedRoute allowedRoles={["admin", "payroll_officer","superadmin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payroll</h1>
            <p className="text-muted-foreground">Manage payroll runs and approvals</p>
          </div>
          {canRun && (
            <Link href="/payroll/run">
              <Button>Run Payroll</Button>
            </Link>
          )}
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Payroll Runs</CardTitle>
            <CardDescription>View and manage all payroll runs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : payrolls.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No payroll runs found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month/Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Anomalies</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-medium">
                          {new Date(payroll.year, parseInt(payroll.month) - 1).toLocaleString(
                            "default",
                            { month: "long", year: "numeric" }
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(payroll.status)}>
                            {payroll.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payroll.totalEmployees}</TableCell>
                        <TableCell>{formatCurrency(payroll.totalAmount)}</TableCell>
                        <TableCell>
                          {payroll.anomalies && payroll.anomalies.length > 0 ? (
                            <div className="flex items-center gap-1 text-warning">
                              <AlertCircle className="h-4 w-4" />
                              <span>{payroll.anomalies.length}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(payroll.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/payroll/${payroll.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
