"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { gradeApi, allowanceApi, deductionApi } from "@/lib/api"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { toast } from "sonner"
import type { Grade, AllowanceType, DeductionType } from "@/types"

export default function SettingsPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [allowances, setAllowances] = useState<AllowanceType[]>([])
  const [deductions, setDeductions] = useState<DeductionType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states for grades
  const [editingGrade, setEditingGrade] = useState<string | null>(null)
  const [gradeForm, setGradeForm] = useState({
    name: "",
    description: "",
    minSalary: "",
    maxSalary: "",
  })

  // Form states for allowances
  const [editingAllowance, setEditingAllowance] = useState<string | null>(null)
  const [allowanceForm, setAllowanceForm] = useState({
    name: "",
    description: "",
    type: "fixed" as "fixed" | "percentage",
    amount: "",
    isActive: true,
  })

  // Form states for deductions
  const [editingDeduction, setEditingDeduction] = useState<string | null>(null)
  const [deductionForm, setDeductionForm] = useState({
    name: "",
    description: "",
    type: "fixed" as "fixed" | "percentage",
    amount: "",
    isActive: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [gradesRes, allowancesRes, deductionsRes] = await Promise.all([
        gradeApi.getAll(),
        allowanceApi.getAll(),
        deductionApi.getAll(),
      ])

      if (gradesRes.success && gradesRes.data) setGrades(gradesRes.data)
      if (allowancesRes.success && allowancesRes.data) setAllowances(allowancesRes.data)
      if (deductionsRes.success && deductionsRes.data) setDeductions(deductionsRes.data)
    } catch (error) {
      toast.error("Failed to load settings data")
    } finally {
      setLoading(false)
    }
  }

  // Grade handlers
  const handleCreateGrade = async () => {
    if (!gradeForm.name || !gradeForm.minSalary || !gradeForm.maxSalary) {
      toast.error("Please fill in all required fields")
      return
    }

    const minSalary = parseFloat(gradeForm.minSalary)
    const maxSalary = parseFloat(gradeForm.maxSalary)

    if (minSalary >= maxSalary) {
      toast.error("Maximum salary must be greater than minimum salary")
      return
    }

    const res = await gradeApi.create({
      name: gradeForm.name,
      description: gradeForm.description,
      minSalary,
      maxSalary,
    })

    if (res.success && res.data) {
      setGrades([...grades, res.data])
      setGradeForm({ name: "", description: "", minSalary: "", maxSalary: "" })
      toast.success("Grade created successfully")
    } else {
      toast.error(res.message || "Failed to create grade")
    }
  }

  const handleUpdateGrade = async (id: string) => {
    if (!gradeForm.name || !gradeForm.minSalary || !gradeForm.maxSalary) {
      toast.error("Please fill in all required fields")
      return
    }

    const minSalary = parseFloat(gradeForm.minSalary)
    const maxSalary = parseFloat(gradeForm.maxSalary)

    if (minSalary >= maxSalary) {
      toast.error("Maximum salary must be greater than minimum salary")
      return
    }

    const res = await gradeApi.update(id, {
      name: gradeForm.name,
      description: gradeForm.description,
      minSalary,
      maxSalary,
    })

    if (res.success && res.data) {
      setGrades(grades.map((g) => (g.id === id ? res.data! : g)))
      setEditingGrade(null)
      setGradeForm({ name: "", description: "", minSalary: "", maxSalary: "" })
      toast.success("Grade updated successfully")
    } else {
      toast.error(res.message || "Failed to update grade")
    }
  }

  const handleDeleteGrade = async (id: string) => {
    const res = await gradeApi.delete(id)
    if (res.success) {
      setGrades(grades.filter((g) => g.id !== id))
      toast.success("Grade deleted successfully")
    } else {
      toast.error(res.message || "Failed to delete grade")
    }
  }

  const startEditingGrade = (grade: Grade) => {
    setEditingGrade(grade.id)
    setGradeForm({
      name: grade.name,
      description: grade.description || "",
      minSalary: grade.minSalary.toString(),
      maxSalary: grade.maxSalary.toString(),
    })
  }

  const cancelEditingGrade = () => {
    setEditingGrade(null)
    setGradeForm({ name: "", description: "", minSalary: "", maxSalary: "" })
  }

  // Allowance handlers
  const handleCreateAllowance = async () => {
    if (!allowanceForm.name || !allowanceForm.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    const amount = parseFloat(allowanceForm.amount)
    if (amount <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    const res = await allowanceApi.create({
      name: allowanceForm.name,
      description: allowanceForm.description,
      type: allowanceForm.type,
      amount,
      isActive: allowanceForm.isActive,
    })

    if (res.success && res.data) {
      setAllowances([...allowances, res.data])
      setAllowanceForm({ name: "", description: "", type: "fixed", amount: "", isActive: true })
      toast.success("Allowance created successfully")
    } else {
      toast.error(res.message || "Failed to create allowance")
    }
  }

  const handleUpdateAllowance = async (id: string) => {
    if (!allowanceForm.name || !allowanceForm.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    const amount = parseFloat(allowanceForm.amount)
    if (amount <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    const res = await allowanceApi.update(id, {
      name: allowanceForm.name,
      description: allowanceForm.description,
      type: allowanceForm.type,
      amount,
      isActive: allowanceForm.isActive,
    })

    if (res.success && res.data) {
      setAllowances(allowances.map((a) => (a.id === id ? res.data! : a)))
      setEditingAllowance(null)
      setAllowanceForm({ name: "", description: "", type: "fixed", amount: "", isActive: true })
      toast.success("Allowance updated successfully")
    } else {
      toast.error(res.message || "Failed to update allowance")
    }
  }

  const handleDeleteAllowance = async (id: string) => {
    const res = await allowanceApi.delete(id)
    if (res.success) {
      setAllowances(allowances.filter((a) => a.id !== id))
      toast.success("Allowance deleted successfully")
    } else {
      toast.error(res.message || "Failed to delete allowance")
    }
  }

  const startEditingAllowance = (allowance: AllowanceType) => {
    setEditingAllowance(allowance.id)
    setAllowanceForm({
      name: allowance.name,
      description: allowance.description || "",
      type: allowance.type,
      amount: allowance.amount.toString(),
      isActive: allowance.isActive,
    })
  }

  const cancelEditingAllowance = () => {
    setEditingAllowance(null)
    setAllowanceForm({ name: "", description: "", type: "fixed", amount: "", isActive: true })
  }

  // Deduction handlers
  const handleCreateDeduction = async () => {
    if (!deductionForm.name || !deductionForm.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    const amount = parseFloat(deductionForm.amount)
    if (amount <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    const res = await deductionApi.create({
      name: deductionForm.name,
      description: deductionForm.description,
      type: deductionForm.type,
      amount,
      isActive: deductionForm.isActive,
    })

    if (res.success && res.data) {
      setDeductions([...deductions, res.data])
      setDeductionForm({ name: "", description: "", type: "fixed", amount: "", isActive: true })
      toast.success("Deduction created successfully")
    } else {
      toast.error(res.message || "Failed to create deduction")
    }
  }

  const handleUpdateDeduction = async (id: string) => {
    if (!deductionForm.name || !deductionForm.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    const amount = parseFloat(deductionForm.amount)
    if (amount <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    const res = await deductionApi.update(id, {
      name: deductionForm.name,
      description: deductionForm.description,
      type: deductionForm.type,
      amount,
      isActive: deductionForm.isActive,
    })

    if (res.success && res.data) {
      setDeductions(deductions.map((d) => (d.id === id ? res.data! : d)))
      setEditingDeduction(null)
      setDeductionForm({ name: "", description: "", type: "fixed", amount: "", isActive: true })
      toast.success("Deduction updated successfully")
    } else {
      toast.error(res.message || "Failed to update deduction")
    }
  }

  const handleDeleteDeduction = async (id: string) => {
    const res = await deductionApi.delete(id)
    if (res.success) {
      setDeductions(deductions.filter((d) => d.id !== id))
      toast.success("Deduction deleted successfully")
    } else {
      toast.error(res.message || "Failed to delete deduction")
    }
  }

  const startEditingDeduction = (deduction: DeductionType) => {
    setEditingDeduction(deduction.id)
    setDeductionForm({
      name: deduction.name,
      description: deduction.description || "",
      type: deduction.type,
      amount: deduction.amount.toString(),
      isActive: deduction.isActive,
    })
  }

  const cancelEditingDeduction = () => {
    setEditingDeduction(null)
    setDeductionForm({ name: "", description: "", type: "fixed", amount: "", isActive: true })
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage system configurations</p>
        </div>

        <Tabs defaultValue="grades" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="allowances-deductions">Allowances & Deductions</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grade Management</CardTitle>
                <CardDescription>Create and manage salary grades for employees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create/Edit Form */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold">{editingGrade ? "Edit Grade" : "Create New Grade"}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="grade-name">Name *</Label>
                      <Input
                        id="grade-name"
                        value={gradeForm.name}
                        onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                        placeholder="e.g., Junior, Senior"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade-description">Description</Label>
                      <Input
                        id="grade-description"
                        value={gradeForm.description}
                        onChange={(e) => setGradeForm({ ...gradeForm, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade-min-salary">Minimum Salary *</Label>
                      <Input
                        id="grade-min-salary"
                        type="number"
                        value={gradeForm.minSalary}
                        onChange={(e) => setGradeForm({ ...gradeForm, minSalary: e.target.value })}
                        placeholder="40000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade-max-salary">Maximum Salary *</Label>
                      <Input
                        id="grade-max-salary"
                        type="number"
                        value={gradeForm.maxSalary}
                        onChange={(e) => setGradeForm({ ...gradeForm, maxSalary: e.target.value })}
                        placeholder="60000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingGrade ? (
                      <>
                        <Button onClick={() => handleUpdateGrade(editingGrade)}>
                          <Save className="mr-2 h-4 w-4" />
                          Update Grade
                        </Button>
                        <Button variant="outline" onClick={cancelEditingGrade}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleCreateGrade}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Grade
                      </Button>
                    )}
                  </div>
                </div>

                {/* Grades List */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Existing Grades</h3>
                  {grades.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No grades created yet</p>
                  ) : (
                    grades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{grade.name}</h4>
                          {grade.description && (
                            <p className="text-sm text-muted-foreground">{grade.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Salary Range: ${grade.minSalary.toLocaleString()} - ${grade.maxSalary.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingGrade(grade)}
                            disabled={editingGrade !== null}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteGrade(grade.id)}
                            disabled={editingGrade !== null}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allowances-deductions" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Allowances */}
              <Card>
                <CardHeader>
                  <CardTitle>Allowances</CardTitle>
                  <CardDescription>Manage allowance types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create/Edit Form */}
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold text-sm">
                      {editingAllowance ? "Edit Allowance" : "Create Allowance"}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="allowance-name">Name *</Label>
                        <Input
                          id="allowance-name"
                          value={allowanceForm.name}
                          onChange={(e) => setAllowanceForm({ ...allowanceForm, name: e.target.value })}
                          placeholder="e.g., Housing"
                        />
                      </div>
                      <div>
                        <Label htmlFor="allowance-description">Description</Label>
                        <Input
                          id="allowance-description"
                          value={allowanceForm.description}
                          onChange={(e) =>
                            setAllowanceForm({ ...allowanceForm, description: e.target.value })
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <Label htmlFor="allowance-type">Type *</Label>
                        <Select
                          value={allowanceForm.type}
                          onValueChange={(value: "fixed" | "percentage") =>
                            setAllowanceForm({ ...allowanceForm, type: value })
                          }
                        >
                          <SelectTrigger id="allowance-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="allowance-amount">
                          {allowanceForm.type === "fixed" ? "Amount ($) *" : "Percentage (%) *"}
                        </Label>
                        <Input
                          id="allowance-amount"
                          type="number"
                          value={allowanceForm.amount}
                          onChange={(e) => setAllowanceForm({ ...allowanceForm, amount: e.target.value })}
                          placeholder={allowanceForm.type === "fixed" ? "1000" : "10"}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingAllowance ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdateAllowance(editingAllowance)}>
                            <Save className="mr-2 h-4 w-4" />
                            Update
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditingAllowance}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={handleCreateAllowance}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Allowances List */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Existing Allowances</h3>
                    {allowances.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No allowances yet</p>
                    ) : (
                      allowances.map((allowance) => (
                        <div key={allowance.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{allowance.name}</h4>
                            {allowance.description && (
                              <p className="text-xs text-muted-foreground">{allowance.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {allowance.type === "fixed"
                                ? `$${allowance.amount.toLocaleString()}`
                                : `${allowance.amount}%`}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingAllowance(allowance)}
                              disabled={editingAllowance !== null}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAllowance(allowance.id)}
                              disabled={editingAllowance !== null}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Deductions */}
              <Card>
                <CardHeader>
                  <CardTitle>Deductions</CardTitle>
                  <CardDescription>Manage deduction types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create/Edit Form */}
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold text-sm">
                      {editingDeduction ? "Edit Deduction" : "Create Deduction"}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="deduction-name">Name *</Label>
                        <Input
                          id="deduction-name"
                          value={deductionForm.name}
                          onChange={(e) => setDeductionForm({ ...deductionForm, name: e.target.value })}
                          placeholder="e.g., Tax"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deduction-description">Description</Label>
                        <Input
                          id="deduction-description"
                          value={deductionForm.description}
                          onChange={(e) =>
                            setDeductionForm({ ...deductionForm, description: e.target.value })
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deduction-type">Type *</Label>
                        <Select
                          value={deductionForm.type}
                          onValueChange={(value: "fixed" | "percentage") =>
                            setDeductionForm({ ...deductionForm, type: value })
                          }
                        >
                          <SelectTrigger id="deduction-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="deduction-amount">
                          {deductionForm.type === "fixed" ? "Amount ($) *" : "Percentage (%) *"}
                        </Label>
                        <Input
                          id="deduction-amount"
                          type="number"
                          value={deductionForm.amount}
                          onChange={(e) => setDeductionForm({ ...deductionForm, amount: e.target.value })}
                          placeholder={deductionForm.type === "fixed" ? "300" : "15"}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingDeduction ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdateDeduction(editingDeduction)}>
                            <Save className="mr-2 h-4 w-4" />
                            Update
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditingDeduction}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={handleCreateDeduction}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Deductions List */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Existing Deductions</h3>
                    {deductions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No deductions yet</p>
                    ) : (
                      deductions.map((deduction) => (
                        <div key={deduction.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{deduction.name}</h4>
                            {deduction.description && (
                              <p className="text-xs text-muted-foreground">{deduction.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {deduction.type === "fixed"
                                ? `$${deduction.amount.toLocaleString()}`
                                : `${deduction.amount}%`}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingDeduction(deduction)}
                              disabled={editingDeduction !== null}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteDeduction(deduction.id)}
                              disabled={editingDeduction !== null}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
