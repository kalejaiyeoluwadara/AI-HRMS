"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ProtectedRoute } from "@/components/layout/protected-route"
import { userApi } from "@/lib/api"
import { Plus, Search, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { getStoredUser } from "@/lib/auth"
import type { User, UserRole } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function UsersPage() {
  const currentUser = getStoredUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee" as UserRole,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll()
      if (response.success && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const response = await userApi.create(formData)
      if (response.success) {
        toast.success("User created successfully")
        setIsCreateDialogOpen(false)
        setFormData({ name: "", email: "", role: "employee" })
        loadUsers()
      } else {
        toast.error(response.message || "Failed to create user")
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.id) return

    try {
      const response = await userApi.delete(deleteDialog.id)
      if (response.success) {
        toast.success("User deleted successfully")
        loadUsers()
      } else {
        toast.error(response.message || "Failed to delete user")
      }
    } catch (error) {
      toast.error("Failed to delete user")
    } finally {
      setDeleteDialog({ open: false, id: null })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const canCreateAdmin = currentUser?.role === "superadmin"
  const canDeleteAdmin = currentUser?.role === "superadmin"

  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage system users and accounts</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <Card className="border-none  shadow-sm">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>All system users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "superadmin"
                                ? "destructive"
                                : user.role === "admin"
                                ? "default"
                                : user.role === "payroll_officer"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.id !== currentUser?.id && (
                            <div className="flex justify-end gap-2">
                              {(user.role !== "admin" && user.role !== "superadmin") ||
                              canDeleteAdmin ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDialog({ open: true, id: user.id })}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              ) : null}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account. {!canCreateAdmin && "Only superadmin can create admin accounts."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
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
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <option value="employee">Employee</option>
                    <option value="payroll_officer">Payroll Officer</option>
                    {canCreateAdmin && <option value="admin">Admin</option>}
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, id: null })}
          onConfirm={handleDelete}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  )
}
