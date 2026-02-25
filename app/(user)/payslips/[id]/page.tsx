"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payslipApi } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { useAuthUser, useBackendToken } from "@/components/hooks/use-auth-user"
import type { Payslip } from "@/types"

export default function PayslipDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const user = useAuthUser()
  const token = useBackendToken()
  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayslip()
  }, [id])

  const loadPayslip = async () => {
    try {
      const response = await payslipApi.getById(id, token)
      if (response.success && response.data) {
        setPayslip(response.data)
      }
    } catch (error) {
      toast.error("Failed to load payslip")
      if (user?.role === "employee") {
        router.push("/payslips/my")
      } else {
        router.push("/payslips")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!payslip) return
    try {
      const blob = await payslipApi.download(payslip.id, token)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payslip-${payslip.id}.pdf`
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    )
  }

  if (!payslip) {
    return null
  }

  const isEmployee = user?.role === "employee"
  const backUrl = isEmployee ? "/payslips/my" : "/payslips"

  return (
    <ProtectedRoute allowedRoles={["admin", "payroll_officer", "employee","superadmin"]}>
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href={backUrl}>
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Payslip Details</h1>
            <p className="text-muted-foreground">
              {new Date(payslip.year, parseInt(payslip.month) - 1).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Employee Name:</span>
              <span className="font-medium">{payslip.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-medium">
                {new Date(payslip.year, parseInt(payslip.month) - 1).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Generated At:</span>
              <span className="font-medium">{formatDate(payslip.generatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Salary Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Basic Salary:</span>
                <span className="font-medium text-lg">{formatCurrency(payslip.basicSalary)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Allowances:</span>
                <span className="font-medium text-lg text-green-600">
                  +{formatCurrency(payslip.allowances)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Deductions:</span>
                <span className="font-medium text-lg text-red-600">
                  -{formatCurrency(payslip.deductions)}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-none mt-2">
                <span className="font-bold text-xl">Net Pay:</span>
                <span className="font-bold text-2xl">{formatCurrency(payslip.netPay)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
