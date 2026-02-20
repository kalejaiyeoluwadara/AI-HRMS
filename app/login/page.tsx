"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api"
import { setStoredUser, setStoredToken } from "@/lib/auth"
import { toast } from "sonner"
import { Oval } from "react-loader-spinner"
import { resetMockData, regeneratePayslips } from "@/lib/mockData"
import { RefreshCw } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authApi.login(formData.email, formData.password)
      
      if (response.success && response.data) {
        setStoredUser(response.data.user)
        setStoredToken(response.data.token)
        toast.success("Login successful!")
        
        // Redirect based on role
        const role = response.data.user.role
        if (role === "superadmin") {
          router.push("/dashboard/superadmin")
        } else if (role === "admin") {
          router.push("/dashboard/admin")
        } else if (role === "payroll_officer") {
          router.push("/dashboard/payroll")
        } else {
          router.push("/dashboard/employee")
        }
      } else {
        toast.error(response.message || "Login failed")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResetData = () => {
    if (confirm("This will reset all mock data including users, employees, and payslips. Continue?")) {
      resetMockData()
      toast.success("Mock data reset! Refreshing page...")
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full border-none shadow-lg px-8 py-12  max-w-xl">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full py-3 mt-8" variant="default" disabled={loading}>
              {loading ? (
                <>
                  <Oval color="white" secondaryColor="hsl(var(--secondary))" height={20} width={20} ariaLabel="oval-loading" />
                  Logging in
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Development Tools */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground mb-3">Development Tools:</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleResetData}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Reset Mock Data & Payslips
            </Button>
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-xs font-medium mb-1">Test Accounts:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• employee@hrms.com (Employee)</li>
                <li>• admin@hrms.com (Admin)</li>
                <li>• payroll@hrms.com (Payroll Officer)</li>
                <li>• superadmin@hrms.com (Super Admin)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
