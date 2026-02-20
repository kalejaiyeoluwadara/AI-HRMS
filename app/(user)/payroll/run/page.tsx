"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { payrollApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function RunPayrollPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const currentDate = new Date()
  const [formData, setFormData] = useState({
    month: (currentDate.getMonth() + 1).toString().padStart(2, "0"),
    year: currentDate.getFullYear().toString(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await payrollApi.run(
        formData.month,
        parseInt(formData.year)
      )

      if (response.success && response.data) {
        toast.success("Payroll run initiated successfully")
        router.push(`/payroll/${response.data.id}`)
      } else {
        toast.error(response.message || "Failed to run payroll")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["payroll_officer", "admin"]}>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/payroll">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payroll
            </Button>
          </Link>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Run Payroll</CardTitle>
            <CardDescription>Generate payroll for a specific month</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => setFormData({ ...formData, month: value })}
                  >
                    <SelectTrigger id="month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString().padStart(2, "0")}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2020"
                    max="2100"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This will calculate payroll for all active employees for the selected month.
                  The system will automatically detect any anomalies in the calculations.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Payroll...
                    </>
                  ) : (
                    "Run Payroll"
                  )}
                </Button>
                <Link href="/payroll">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
