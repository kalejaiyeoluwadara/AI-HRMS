import type { ApiResponse, User, UserRole, Employee, PayrollRun, PayrollDetail, Payslip, Grade, AllowanceType, DeductionType } from "@/types";
import { mockDataStore, delay, generateId } from "./mockData";
import { getApiUrl, getApiHeaders } from "./api-client";

// Mock API - simulates backend API calls using localStorage
// Auth is handled by NextAuth; pass user from useAuthUser() where needed

// Auth API (legacy - login/register handled by NextAuth)
export const authApi = {
  register: async (data: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay();
    return {
      success: false,
      message: "Registration is disabled. Please contact your administrator.",
      error: "Registration disabled",
    };
  },

  getCurrentUser: async (user: User | null): Promise<ApiResponse<User>> => {
    await delay();
    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        error: "Unauthorized",
      };
    }
    const foundUser = mockDataStore.findUserById(user.id);
    if (!foundUser) {
      return {
        success: false,
        message: "User not found",
        error: "Not found",
      };
    }
    return {
      success: true,
      data: foundUser,
    };
  },
};

// Employee API
export const employeeApi = {
  getAll: async (token?: string | null): Promise<ApiResponse<Employee[]>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/employees"), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to fetch employees",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data ?? [],
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch employees",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const employees = mockDataStore.getEmployees();
    return { success: true, data: employees };
  },

  getById: async (id: string, token?: string | null): Promise<ApiResponse<Employee>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/employees/${id}`), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Employee not found",
            error: json.error || "NotFound",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch employee",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const employee = mockDataStore.getEmployeeById(id);
    if (!employee) return { success: false, message: "Employee not found", error: "Not found" };
    return { success: true, data: employee };
  },

  create: async (data: Omit<Employee, "id" | "createdAt" | "updatedAt">, token?: string | null): Promise<ApiResponse<Employee>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/employees"), {
          method: "POST",
          headers: getApiHeaders(token),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to create employee",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to create employee",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const existingEmployee = mockDataStore.getEmployees().find((e) => e.email === data.email);
    if (existingEmployee) {
      return { success: false, message: "Employee with this email already exists", error: "Duplicate email" };
    }
    const newEmployee: Employee = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDataStore.addEmployee(newEmployee);
    return { success: true, data: newEmployee, message: "Employee created successfully" };
  },

  update: async (id: string, data: Partial<Employee>, token?: string | null): Promise<ApiResponse<Employee>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/employees/${id}`), {
          method: "PUT",
          headers: getApiHeaders(token),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to update employee",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to update employee",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const updated = mockDataStore.updateEmployee(id, data);
    if (!updated) return { success: false, message: "Employee not found", error: "Not found" };
    return { success: true, data: updated, message: "Employee updated successfully" };
  },

  delete: async (id: string, token?: string | null): Promise<ApiResponse<void>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/employees/${id}`), {
          method: "DELETE",
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to delete employee",
            error: json.error || "RequestFailed",
          };
        }
        return { success: true, message: json.message };
      } catch (err) {
        return {
          success: false,
          message: "Failed to delete employee",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const deleted = mockDataStore.deleteEmployee(id);
    if (!deleted) return { success: false, message: "Employee not found", error: "Not found" };
    return { success: true, message: "Employee deleted successfully" };
  },
};

// Payroll API
export const payrollApi = {
  run: async (month: string, year: number, token?: string | null): Promise<ApiResponse<PayrollRun>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/payroll/run"), {
          method: "POST",
          headers: getApiHeaders(token),
          body: JSON.stringify({ month, year }),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to run payroll",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to run payroll",
          error: "NetworkError",
        };
      }
    }

    await delay(500);
    const employees = mockDataStore.getEmployees().filter((e) => e.employmentStatus === "active");
    const totalAmount = employees.reduce((sum, emp) => sum + emp.salary + emp.allowances - emp.deductions, 0);
    const anomalies: PayrollRun["anomalies"] = [];
    employees.forEach((emp) => {
      if (emp.deductions > emp.salary * 0.3) {
        anomalies.push({ employeeId: emp.id, employeeName: emp.name, type: "unusual_deduction", message: "Deduction amount exceeds 30% of salary", severity: "high" });
      }
      if (emp.allowances > emp.salary * 0.2 && emp.jobRole.toLowerCase().includes("engineer")) {
        anomalies.push({ employeeId: emp.id, employeeName: emp.name, type: "other", message: "High allowance for engineering role", severity: "low" });
      }
    });
    const newPayrollRun: PayrollRun = {
      id: generateId(),
      month,
      year,
      status: "pending",
      totalEmployees: employees.length,
      totalAmount,
      anomalies: anomalies.length > 0 ? anomalies : undefined,
      createdAt: new Date().toISOString(),
    };
    mockDataStore.addPayrollRun(newPayrollRun);
    const payslips: Payslip[] = employees.map((emp) => ({
      id: `payslip-${emp.id}-${year}-${month}`,
      employeeId: emp.id,
      employeeName: emp.name,
      month,
      year,
      basicSalary: emp.salary,
      allowances: emp.allowances,
      deductions: emp.deductions,
      netPay: emp.salary + emp.allowances - emp.deductions,
      generatedAt: new Date().toISOString(),
    }));
    const existingPayslips = mockDataStore.getPayslips();
    const newPayslipIds = new Set(existingPayslips.map((p) => p.id));
    payslips.forEach((p) => { if (!newPayslipIds.has(p.id)) mockDataStore.addPayslip(p); });
    return { success: true, data: newPayrollRun, message: "Payroll run created successfully" };
  },

  getAll: async (token?: string | null): Promise<ApiResponse<PayrollRun[]>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/payroll"), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to fetch payroll runs",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data ?? [],
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch payroll runs",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const runs = mockDataStore.getPayrollRuns();
    return { success: true, data: runs };
  },

  getById: async (id: string, token?: string | null): Promise<ApiResponse<PayrollRun & { details: PayrollDetail[] }>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/payroll/${id}`), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Payroll run not found",
            error: json.error || "NotFound",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch payroll run",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const run = mockDataStore.getPayrollRunById(id);
    if (!run) return { success: false, message: "Payroll run not found", error: "Not found" };
    const employees = mockDataStore.getEmployees();
    const details: PayrollDetail[] = employees
      .filter((e) => e.employmentStatus === "active")
      .map((emp) => {
        const employeeAnomalies = run.anomalies?.filter((a) => a.employeeId === emp.id);
        return {
          employeeId: emp.id,
          employeeName: emp.name,
          basicSalary: emp.salary,
          allowances: emp.allowances,
          deductions: emp.deductions,
          netPay: emp.salary + emp.allowances - emp.deductions,
          anomalies: employeeAnomalies?.length ? employeeAnomalies : undefined,
        };
      });
    return { success: true, data: { ...run, details } };
  },

  approve: async (id: string, token?: string | null): Promise<ApiResponse<PayrollRun>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/payroll/${id}/approve`), {
          method: "POST",
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to approve payroll",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to approve payroll",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const updated = mockDataStore.updatePayrollRun(id, { status: "approved" });
    if (!updated) return { success: false, message: "Payroll run not found", error: "Not found" };
    return { success: true, data: updated, message: "Payroll run approved successfully" };
  },

  reject: async (id: string, reason?: string, token?: string | null): Promise<ApiResponse<PayrollRun>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/payroll/${id}/reject`), {
          method: "POST",
          headers: getApiHeaders(token),
          body: JSON.stringify({ reason }),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to reject payroll",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to reject payroll",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const updated = mockDataStore.updatePayrollRun(id, { status: "rejected" });
    if (!updated) return { success: false, message: "Payroll run not found", error: "Not found" };
    return { success: true, data: updated, message: reason || "Payroll run rejected" };
  },
};

// Payslip API
export const payslipApi = {
  getMyPayslips: async (user: User | null, token?: string | null): Promise<ApiResponse<Payslip[]>> => {
    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        error: "Unauthorized",
      };
    }

    // Use real backend when token is provided
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/payslips/my"), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to fetch payslips",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data ?? [],
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch payslips",
          error: "NetworkError",
        };
      }
    }

    // Fallback to mock data
    await delay();
    const employee = mockDataStore.getEmployees().find((e) => e.email === user.email);
    if (!employee) {
      return {
        success: true,
        data: [],
        message: "No employee record found",
      };
    }
    const payslips = mockDataStore.getPayslipsByEmployeeId(employee.id);
    return { success: true, data: payslips };
  },

  getAll: async (token?: string | null): Promise<ApiResponse<Payslip[]>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/payslips"), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to fetch payslips",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data ?? [],
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch payslips",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const payslips = mockDataStore.getPayslips();
    return { success: true, data: payslips };
  },

  getById: async (id: string, token?: string | null): Promise<ApiResponse<Payslip>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/payslips/${id}`), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Payslip not found",
            error: json.error || "NotFound",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch payslip",
          error: "NetworkError",
        };
      }
    }

    await delay();
    const payslip = mockDataStore.getPayslipById(id);
    if (!payslip) {
      return {
        success: false,
        message: "Payslip not found",
        error: "Not found",
      };
    }
    return { success: true, data: payslip };
  },

  download: async (id: string, token?: string | null): Promise<Blob> => {
    if (token) {
      const res = await fetch(getApiUrl(`/api/payslips/${id}/download`), {
        headers: getApiHeaders(token),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to download payslip");
      }
      return res.blob();
    }

    await delay(800);
    const payslip = mockDataStore.getPayslipById(id);
    if (!payslip) {
      throw new Error("Payslip not found");
    }
    const content = `
PAYSLIP
Employee: ${payslip.employeeName}
Period: ${new Date(payslip.year, parseInt(payslip.month) - 1).toLocaleString("default", { month: "long", year: "numeric" })}

Basic Salary: $${payslip.basicSalary.toFixed(2)}
Allowances: $${payslip.allowances.toFixed(2)}
Deductions: $${payslip.deductions.toFixed(2)}
Net Pay: $${payslip.netPay.toFixed(2)}

Generated: ${new Date(payslip.generatedAt).toLocaleString()}
    `.trim();
    return new Blob([content], { type: "application/pdf" });
  },
};

// User Management API (for admins/superadmins)
export const userApi = {
  getAll: async (token?: string | null): Promise<ApiResponse<User[]>> => {
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/users"), {
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to fetch users",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data ?? [],
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch users",
          error: "NetworkError",
        };
      }
    }
    await delay();
    const users = mockDataStore.getUsers();
    return { success: true, data: users };
  },

  create: async (data: { name: string; email: string; role: UserRole }, currentUser: User | null, token?: string | null): Promise<ApiResponse<User>> => {
    if (!currentUser) {
      return { success: false, message: "Not authenticated", error: "Unauthorized" };
    }
    if (token) {
      try {
        const res = await fetch(getApiUrl("/api/users"), {
          method: "POST",
          headers: getApiHeaders(token),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to create user",
            error: json.error || "RequestFailed",
          };
        }
        return {
          success: json.success ?? true,
          data: json.data,
          message: json.message,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to create user",
          error: "NetworkError",
        };
      }
    }
    await delay();
    if ((data.role === "admin" || data.role === "superadmin") && currentUser.role !== "superadmin") {
      return { success: false, message: "Only superadmin can create admin accounts", error: "Forbidden" };
    }
    const existingUser = mockDataStore.findUserByEmail(data.email);
    if (existingUser) {
      return { success: false, message: "User with this email already exists", error: "Duplicate email" };
    }
    const newUser: User = { id: generateId(), email: data.email, name: data.name, role: data.role };
    mockDataStore.addUser(newUser);
    return { success: true, data: newUser, message: "User created successfully" };
  },

  delete: async (id: string, currentUser: User | null, token?: string | null): Promise<ApiResponse<void>> => {
    if (!currentUser) {
      return { success: false, message: "Not authenticated", error: "Unauthorized" };
    }
    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/users/${id}`), {
          method: "DELETE",
          headers: getApiHeaders(token),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: json.message || "Failed to delete user",
            error: json.error || "RequestFailed",
          };
        }
        return { success: true, message: json.message };
      } catch (err) {
        return {
          success: false,
          message: "Failed to delete user",
          error: "NetworkError",
        };
      }
    }
    await delay();
    const userToDelete = mockDataStore.findUserById(id);
    if (!userToDelete) return { success: false, message: "User not found", error: "Not found" };
    if (userToDelete.id === currentUser.id) return { success: false, message: "Cannot delete your own account", error: "Forbidden" };
    if ((userToDelete.role === "admin" || userToDelete.role === "superadmin") && currentUser.role !== "superadmin") {
      return { success: false, message: "Only superadmin can delete admin accounts", error: "Forbidden" };
    }
    const users = mockDataStore.getUsers();
    mockDataStore.setUsers(users.filter((u) => u.id !== id));
    return { success: true, message: "User deleted successfully" };
  },
};

// Grade API
export const gradeApi = {
  getAll: async (): Promise<ApiResponse<Grade[]>> => {
    await delay();
    const grades = mockDataStore.getGrades();
    return {
      success: true,
      data: grades,
    };
  },

  create: async (data: Omit<Grade, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Grade>> => {
    await delay();

    const newGrade: Grade = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDataStore.addGrade(newGrade);

    return {
      success: true,
      data: newGrade,
      message: "Grade created successfully",
    };
  },

  update: async (id: string, data: Partial<Omit<Grade, "id" | "createdAt">>): Promise<ApiResponse<Grade>> => {
    await delay();

    const updated = mockDataStore.updateGrade(id, data);

    if (!updated) {
      return {
        success: false,
        message: "Grade not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: updated,
      message: "Grade updated successfully",
    };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();

    const deleted = mockDataStore.deleteGrade(id);

    if (!deleted) {
      return {
        success: false,
        message: "Grade not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      message: "Grade deleted successfully",
    };
  },
};

// Allowance API
export const allowanceApi = {
  getAll: async (): Promise<ApiResponse<AllowanceType[]>> => {
    await delay();
    const allowances = mockDataStore.getAllowances();
    return {
      success: true,
      data: allowances,
    };
  },

  create: async (data: Omit<AllowanceType, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<AllowanceType>> => {
    await delay();

    const newAllowance: AllowanceType = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDataStore.addAllowance(newAllowance);

    return {
      success: true,
      data: newAllowance,
      message: "Allowance created successfully",
    };
  },

  update: async (id: string, data: Partial<Omit<AllowanceType, "id" | "createdAt">>): Promise<ApiResponse<AllowanceType>> => {
    await delay();

    const updated = mockDataStore.updateAllowance(id, data);

    if (!updated) {
      return {
        success: false,
        message: "Allowance not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: updated,
      message: "Allowance updated successfully",
    };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();

    const deleted = mockDataStore.deleteAllowance(id);

    if (!deleted) {
      return {
        success: false,
        message: "Allowance not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      message: "Allowance deleted successfully",
    };
  },
};

// Deduction API
export const deductionApi = {
  getAll: async (): Promise<ApiResponse<DeductionType[]>> => {
    await delay();
    const deductions = mockDataStore.getDeductions();
    return {
      success: true,
      data: deductions,
    };
  },

  create: async (data: Omit<DeductionType, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<DeductionType>> => {
    await delay();

    const newDeduction: DeductionType = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDataStore.addDeduction(newDeduction);

    return {
      success: true,
      data: newDeduction,
      message: "Deduction created successfully",
    };
  },

  update: async (id: string, data: Partial<Omit<DeductionType, "id" | "createdAt">>): Promise<ApiResponse<DeductionType>> => {
    await delay();

    const updated = mockDataStore.updateDeduction(id, data);

    if (!updated) {
      return {
        success: false,
        message: "Deduction not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: updated,
      message: "Deduction updated successfully",
    };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();

    const deleted = mockDataStore.deleteDeduction(id);

    if (!deleted) {
      return {
        success: false,
        message: "Deduction not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      message: "Deduction deleted successfully",
    };
  },
};

// Default export for backward compatibility (not used but kept for safety)
const api = {
  // Empty object - not used in mock mode
};

export default api;
