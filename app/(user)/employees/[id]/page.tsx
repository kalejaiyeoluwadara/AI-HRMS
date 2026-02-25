"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { employeeApi } from "@/lib/api"
import { useBackendToken } from "@/components/hooks/use-auth-user"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Oval } from "react-loader-spinner"

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const token = useBackendToken()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobRole: "",
    salary: "",
    allowances: "0",
    deductions: "0",
    employmentStatus: "active",
  })

  useEffect(() => {
    loadEmployee()
  }, [id, token])

  const loadEmployee = async () => {
    try {
      const response = await employeeApi.getById(id, token)
      if (response.success && response.data) {
        const emp = response.data
        setFormData({
          name: emp.name,
          email: emp.email,
          jobRole: emp.jobRole,
          salary: emp.salary.toString(),
          allowances: emp.allowances.toString(),
          deductions: emp.deductions.toString(),
          employmentStatus: emp.employmentStatus,
        })
      }
    } catch (error) {
      toast.error("Failed to load employee data")
      router.push("/employees")
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await employeeApi.update(
        id,
        {
          name: formData.name,
          email: formData.email,
          jobRole: formData.jobRole,
          salary: parseFloat(formData.salary),
          allowances: parseFloat(formData.allowances),
          deductions: parseFloat(formData.deductions),
          employmentStatus: formData.employmentStatus as "active" | "inactive" | "terminated",
        },
        token
      )

      if (response.success) {
        toast.success("Employee updated successfully")
        router.push("/employees")
      } else {
        toast.error(response.message || "Failed to update employee")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="w-full flex items-center mt-10 justify-center p-6">
        <Oval color="hsl(var(--primary))" secondaryColor="hsl(var(--secondary))" height={40} width={40} ariaLabel="oval-loading" />
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin","superadmin"]}>
      <div className="w-full p-6">
        <div className="mb-4">
          <Link href="/employees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Button>
          </Link>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Edit Employee</CardTitle>
            <CardDescription>Update employee information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">Job Role *</Label>
                <Input
                  id="jobRole"
                  required
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowances">Allowances</Label>
                  <Input
                    id="allowances"
                    type="number"
                    step="0.01"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    type="number"
                    step="0.01"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status *</Label>
                <Select
                  value={formData.employmentStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employmentStatus: value })
                  }
                >
                  <SelectTrigger id="employmentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Employee"
                  )}
                </Button>
                <Link href="/employees">
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
