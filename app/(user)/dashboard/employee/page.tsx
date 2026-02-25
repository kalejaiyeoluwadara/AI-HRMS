"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payslipApi } from "@/lib/api"
import { FileText, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuthUser, useBackendToken } from "@/components/hooks/use-auth-user"
import { toast } from "sonner"
import type { Payslip } from "@/types"

export default function EmployeeDashboard() {
  const user = useAuthUser()
  const token = useBackendToken()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    try {
      const response = await payslipApi.getMyPayslips(user, token)

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
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const statsCards = [
    {
      title: "Total Payslips",
      value: payslips.length,
      description: "Available payslips",
      icon: FileText,
    },
    {
      title: "Latest Net Pay",
      value: payslips.length > 0 ? formatCurrency(payslips[0].netPay) : "$0.00",
      description: "Most recent payslip",
      icon: DollarSign,
    },
    {
      title: "This Month",
      value: new Date().toLocaleString("default", { month: "long" }),
      description: "Current month",
      icon: Calendar,
    },
  ]

  return (
    <ProtectedRoute allowedRoles={["employee"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Here’s your dashboard overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statsCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-none shadow-sm">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium">
                        {new Date(payslip.year, parseInt(payslip.month) - 1).toLocaleString(
                          "default",
                          { month: "long", year: "numeric" }
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(payslip.netPay)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/payslips/${payslip.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
