"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payrollApi } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { getStoredUser } from "@/lib/auth"
import type { PayrollRun, PayrollDetail } from "@/types"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { InputDialog } from "@/components/ui/input-dialog"

export default function PayrollDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const user = getStoredUser()
  const [payroll, setPayroll] = useState<PayrollRun | null>(null)
  const [details, setDetails] = useState<PayrollDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [approveDialog, setApproveDialog] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)

  useEffect(() => {
    loadPayroll()
  }, [id])

  const loadPayroll = async () => {
    try {
      const response = await payrollApi.getById(id)
      if (response.success && response.data) {
        setPayroll(response.data)
        setDetails(response.data.details || [])
      }
    } catch (error) {
      toast.error("Failed to load payroll data")
      router.push("/payroll")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const response = await payrollApi.approve(id)
      if (response.success) {
        toast.success("Payroll approved successfully")
        loadPayroll()
      } else {
        toast.error(response.message || "Failed to approve payroll")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred")
    } finally {
      setActionLoading(false)
      setApproveDialog(false)
    }
  }

  const handleReject = async (reason: string) => {
    setActionLoading(true)
    try {
      const response = await payrollApi.reject(id, reason)
      if (response.success) {
        toast.success("Payroll rejected")
        loadPayroll()
      } else {
        toast.error(response.message || "Failed to reject payroll")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred")
    } finally {
      setActionLoading(false)
      setRejectDialog(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const canApprove = user?.role === "admin" && payroll?.status === "pending"

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    )
  }

  if (!payroll) {
    return null
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "payroll_officer","superadmin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/payroll">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Payroll
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">
              Payroll - {new Date(payroll.year, parseInt(payroll.month) - 1).toLocaleString(
                "default",
                { month: "long", year: "numeric" }
              )}
            </h1>
            <p className="text-muted-foreground">Review payroll details and anomalies</p>
          </div>
          {canApprove && (
            <div className="flex gap-2">
              <Button onClick={() => setApproveDialog(true)} disabled={actionLoading}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="destructive" onClick={() => setRejectDialog(true)} disabled={actionLoading}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  payroll.status === "approved"
                    ? "success"
                    : payroll.status === "pending"
                    ? "warning"
                    : "destructive"
                }
              >
                {payroll.status}
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payroll.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(payroll.totalAmount)}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payroll.anomalies?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {payroll.anomalies && payroll.anomalies.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Anomalies Detected</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                {payroll.anomalies.map((anomaly, index) => (
                  <div key={index} className="text-sm">
                    <strong>{anomaly.employeeName}:</strong> {anomaly.message} (
                    {anomaly.severity} severity)
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Payroll Details</CardTitle>
            <CardDescription>Breakdown by employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Anomalies</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.employeeId}>
                      <TableCell className="font-medium">{detail.employeeName}</TableCell>
                      <TableCell>{formatCurrency(detail.basicSalary)}</TableCell>
                      <TableCell>{formatCurrency(detail.allowances)}</TableCell>
                      <TableCell>{formatCurrency(detail.deductions)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(detail.netPay)}</TableCell>
                      <TableCell>
                        {detail.anomalies && detail.anomalies.length > 0 ? (
                          <div className="flex items-center gap-1 text-warning">
                            <AlertCircle className="h-4 w-4" />
                            <span>{detail.anomalies.length}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={approveDialog}
          onOpenChange={setApproveDialog}
          onConfirm={handleApprove}
          title="Approve Payroll"
          description="Are you sure you want to approve this payroll? This will finalize the payroll run."
          confirmText="Approve"
          cancelText="Cancel"
          variant="success"
          loading={actionLoading}
        />

        <InputDialog
          open={rejectDialog}
          onOpenChange={setRejectDialog}
          onSubmit={handleReject}
          title="Reject Payroll"
          description="Please provide a reason for rejecting this payroll."
          label="Rejection Reason"
          placeholder="Enter rejection reason..."
          confirmText="Reject"
          cancelText="Cancel"
          loading={actionLoading}
          multiline
          required
        />
      </div>
    </ProtectedRoute>
  )
}
