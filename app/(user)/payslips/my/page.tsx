"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payslipApi } from "@/lib/api"
import { useAuthUser } from "@/components/hooks/use-auth-user"
import { Download, FileText, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Payslip } from "@/types"
import { regeneratePayslips } from "@/lib/mockData"

export default function MyPayslipsPage() {
  const user = useAuthUser()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    try {
      const response = await payslipApi.getMyPayslips(user)
      console.log("📊 Payslip API response:", response)
      if (response.success && response.data) {
        console.log(`✅ Loaded ${response.data.length} payslips`)
        // Sort payslips by year and month (most recent first)
        const sortedPayslips = response.data.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year
          }
          return parseInt(b.month) - parseInt(a.month)
        })
        setPayslips(sortedPayslips)
      } else {
        console.warn("⚠️ Payslip API returned no data:", response.message)
      }
    } catch (error) {
      console.error("❌ Failed to load payslips:", error)
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

  const handleRefreshPayslips = () => {
    if (confirm("This will regenerate payslips with fresh mock data. Continue?")) {
      console.log("🔄 Starting payslip regeneration...")
      
      // First, clear old payslips completely
      if (typeof window !== "undefined") {
        localStorage.removeItem('hrms_mock_payslips');
        console.log("🗑️ Cleared old payslips from localStorage");
      }
      
      // Now regenerate
      regeneratePayslips()
      toast.success("Payslips regenerated! Refreshing...")
      
      setTimeout(() => {
        console.log("🔃 Reloading payslips from API...")
        setLoading(true)
        loadPayslips()
      }, 500)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["employee","superadmin"]}>
      <div className="container  mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Payslips</h1>
            <p className="text-muted-foreground">View and download your payslips</p>
          </div>
          {payslips.length === 0 && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPayslips}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Payslips
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : payslips.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No payslips available</p>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to generate mock payslips for testing
              </p>
              <Button
                variant="default"
                onClick={handleRefreshPayslips}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Mock Payslips
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payslips.map((payslip) => (
              <Card key={payslip.id} className="border-none shadow-sm">
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
