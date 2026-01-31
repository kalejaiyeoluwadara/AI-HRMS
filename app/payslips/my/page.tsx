"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payslipApi } from "@/lib/api"
import { Download, FileText } from "lucide-react"
import { toast } from "sonner"
import type { Payslip } from "@/types"

export default function MyPayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    try {
      const response = await payslipApi.getMyPayslips()
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
      const blob = await payslipApi.download(id)
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
    <ProtectedRoute allowedRoles={["employee","superadmin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Payslips</h1>
          <p className="text-muted-foreground">View and download your payslips</p>
        </div>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : payslips.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payslips available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payslips.map((payslip) => (
              <Card key={payslip.id}>
                <CardHeader>
                  <CardTitle>
                    {new Date(payslip.year, parseInt(payslip.month) - 1).toLocaleString(
                      "default",
                      { month: "long", year: "numeric" }
                    )}
                  </CardTitle>
                  <CardDescription>Payslip Details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Basic Salary:</span>
                      <span className="font-medium">{formatCurrency(payslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Allowances:</span>
                      <span className="font-medium">{formatCurrency(payslip.allowances)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deductions:</span>
                      <span className="font-medium">{formatCurrency(payslip.deductions)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-none">
                      <span>Net Pay:</span>
                      <span>{formatCurrency(payslip.netPay)}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDownload(payslip.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
