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
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payslipApi } from "@/lib/api"
import { useBackendToken } from "@/components/hooks/use-auth-user"
import { Eye, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Payslip } from "@/types"

export default function PayslipsPage() {
  const token = useBackendToken()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    try {
      const response = await payslipApi.getAll(token)
      if (response.success && response.data) {
        setPayslips(response.data)
      }
    } catch (error) {
      toast.error("Failed to load payslips")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const blob = await payslipApi.download(id, token)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payslip-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Payslip downloaded")
    } catch (error) {
      toast.error("Failed to download payslip")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "payroll_officer","superadmin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Payslips</h1>
          <p className="text-muted-foreground">View and manage all payslips</p>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Payslip List</CardTitle>
            <CardDescription>All generated payslips</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : payslips.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No payslips found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Month/Year</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell className="font-medium">{payslip.employeeName}</TableCell>
                        <TableCell>
                          {new Date(payslip.year, parseInt(payslip.month) - 1).toLocaleString(
                            "default",
                            { month: "long", year: "numeric" }
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(payslip.basicSalary)}</TableCell>
                        <TableCell>{formatCurrency(payslip.allowances)}</TableCell>
                        <TableCell>{formatCurrency(payslip.deductions)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(payslip.netPay)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/payslips/${payslip.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(payslip.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
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
