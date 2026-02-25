import type { ApiResponse, User, UserRole, Employee, PayrollRun, PayrollDetail, Payslip, Grade, AllowanceType, DeductionType } from "@/types";
import { mockDataStore, delay, generateId } from "./mockData";

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
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    await delay();
    const employees = mockDataStore.getEmployees();
    return {
      success: true,
      data: employees,
    };
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    await delay();
    const employee = mockDataStore.getEmployeeById(id);
    
    if (!employee) {
      return {
        success: false,
        message: "Employee not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: employee,
    };
  },

  create: async (data: Omit<Employee, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Employee>> => {
    await delay();

    // Check if employee with email already exists
    const existingEmployee = mockDataStore.getEmployees().find((e) => e.email === data.email);
    if (existingEmployee) {
      return {
        success: false,
        message: "Employee with this email already exists",
        error: "Duplicate email",
      };
    }

    const newEmployee: Employee = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDataStore.addEmployee(newEmployee);

    return {
      success: true,
      data: newEmployee,
      message: "Employee created successfully",
    };
  },

  update: async (id: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    await delay();

    const updated = mockDataStore.updateEmployee(id, data);
    
    if (!updated) {
      return {
        success: false,
        message: "Employee not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: updated,
      message: "Employee updated successfully",
    };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();

    const deleted = mockDataStore.deleteEmployee(id);
    
    if (!deleted) {
      return {
        success: false,
        message: "Employee not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      message: "Employee deleted successfully",
    };
  },
};

// Payroll API
export const payrollApi = {
  run: async (month: string, year: number): Promise<ApiResponse<PayrollRun>> => {
    await delay(500); // Simulate longer processing time

    const employees = mockDataStore.getEmployees().filter((e) => e.employmentStatus === "active");
    
    // Calculate total amount
    const totalAmount = employees.reduce((sum, emp) => {
      return sum + emp.salary + emp.allowances - emp.deductions;
    }, 0);

    // Detect anomalies (mock logic)
    const anomalies: PayrollRun["anomalies"] = [];
    employees.forEach((emp) => {
      // Mock anomaly detection
      if (emp.deductions > emp.salary * 0.3) {
        anomalies.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "unusual_deduction",
          message: "Deduction amount exceeds 30% of salary",
          severity: "high",
        });
      }
      if (emp.allowances > emp.salary * 0.2 && emp.jobRole.toLowerCase().includes("engineer")) {
        // This is fine, but we'll add a low severity note
        anomalies.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "other",
          message: "High allowance for engineering role",
          severity: "low",
        });
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

    // Generate payslips for all employees
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

    // Add payslips (avoid duplicates)
    const existingPayslips = mockDataStore.getPayslips();
    const newPayslipIds = new Set(existingPayslips.map((p) => p.id));
    payslips.forEach((payslip) => {
      if (!newPayslipIds.has(payslip.id)) {
        mockDataStore.addPayslip(payslip);
      }
    });

    return {
      success: true,
      data: newPayrollRun,
      message: "Payroll run created successfully",
    };
  },

  getAll: async (): Promise<ApiResponse<PayrollRun[]>> => {
    await delay();
    const runs = mockDataStore.getPayrollRuns();
    return {
      success: true,
      data: runs,
    };
  },

  getById: async (id: string): Promise<ApiResponse<PayrollRun & { details: PayrollDetail[] }>> => {
    await delay();
    const run = mockDataStore.getPayrollRunById(id);
    
    if (!run) {
      return {
        success: false,
        message: "Payroll run not found",
        error: "Not found",
      };
    }

    // Get payroll details from employees
    const employees = mockDataStore.getEmployees();
    const details: PayrollDetail[] = employees
      .filter((e) => e.employmentStatus === "active")
      .map((emp) => {
        // Find anomalies for this employee
        const employeeAnomalies = run.anomalies?.filter((a) => a.employeeId === emp.id);

        return {
          employeeId: emp.id,
          employeeName: emp.name,
          basicSalary: emp.salary,
          allowances: emp.allowances,
          deductions: emp.deductions,
          netPay: emp.salary + emp.allowances - emp.deductions,
          anomalies: employeeAnomalies && employeeAnomalies.length > 0 ? employeeAnomalies : undefined,
        };
      });

    return {
      success: true,
      data: { ...run, details },
    };
  },

  approve: async (id: string): Promise<ApiResponse<PayrollRun>> => {
    await delay();

    const updated = mockDataStore.updatePayrollRun(id, { status: "approved" });
    
    if (!updated) {
      return {
        success: false,
        message: "Payroll run not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: updated,
      message: "Payroll run approved successfully",
    };
  },

  reject: async (id: string, reason?: string): Promise<ApiResponse<PayrollRun>> => {
    await delay();

    const updated = mockDataStore.updatePayrollRun(id, { status: "rejected" });
    
    if (!updated) {
      return {
        success: false,
        message: "Payroll run not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: updated,
      message: reason || "Payroll run rejected",
    };
  },
};

// Payslip API
export const payslipApi = {
  getMyPayslips: async (user: User | null): Promise<ApiResponse<Payslip[]>> => {
    await delay();

    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        error: "Unauthorized",
      };
    }

    const employee = mockDataStore.getEmployees().find((e) => e.email === user.email);
    if (!employee) {
      return {
        success: true,
        data: [],
        message: "No employee record found",
      };
    }

    const payslips = mockDataStore.getPayslipsByEmployeeId(employee.id);
    return {
      success: true,
      data: payslips,
    };
  },

  getAll: async (): Promise<ApiResponse<Payslip[]>> => {
    await delay();
    const payslips = mockDataStore.getPayslips();
    return {
      success: true,
      data: payslips,
    };
  },

  getById: async (id: string): Promise<ApiResponse<Payslip>> => {
    await delay();
    const payslip = mockDataStore.getPayslipById(id);
    
    if (!payslip) {
      return {
        success: false,
        message: "Payslip not found",
        error: "Not found",
      };
    }

    return {
      success: true,
      data: payslip,
    };
  },

  download: async (id: string): Promise<Blob> => {
    await delay(800); // Simulate download time

    const payslip = mockDataStore.getPayslipById(id);
    
    if (!payslip) {
      throw new Error("Payslip not found");
    }

    // Generate a mock PDF content (just a simple text representation)
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

    // Create a blob with text content (in real app, this would be a PDF)
    return new Blob([content], { type: "application/pdf" });
  },
};

// User Management API (for admins/superadmins)
export const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    await delay();
    const users = mockDataStore.getUsers();
    return {
      success: true,
      data: users,
    };
  },

  create: async (data: { name: string; email: string; role: UserRole }, currentUser: User | null): Promise<ApiResponse<User>> => {
    await delay();

    if (!currentUser) {
      return {
        success: false,
        message: "Not authenticated",
        error: "Unauthorized",
      };
    }

    // Only superadmin can create admins, superadmin and admins can create other roles
    if (data.role === "admin" || data.role === "superadmin") {
      if (currentUser.role !== "superadmin") {
        return {
          success: false,
          message: "Only superadmin can create admin accounts",
          error: "Forbidden",
        };
      }
    }

    // Check if user already exists
    const existingUser = mockDataStore.findUserByEmail(data.email);
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
        error: "Duplicate email",
      };
    }

    const newUser: User = {
      id: generateId(),
      email: data.email,
      name: data.name,
      role: data.role,
    };

    mockDataStore.addUser(newUser);

    return {
      success: true,
      data: newUser,
      message: "User created successfully",
    };
  },

  delete: async (id: string, currentUser: User | null): Promise<ApiResponse<void>> => {
    await delay();

    if (!currentUser) {
      return {
        success: false,
        message: "Not authenticated",
        error: "Unauthorized",
      };
    }

    const userToDelete = mockDataStore.findUserById(id);
    if (!userToDelete) {
      return {
        success: false,
        message: "User not found",
        error: "Not found",
      };
    }

    // Prevent deleting yourself
    if (userToDelete.id === currentUser.id) {
      return {
        success: false,
        message: "Cannot delete your own account",
        error: "Forbidden",
      };
    }

    // Only superadmin can delete admins/superadmins
    if ((userToDelete.role === "admin" || userToDelete.role === "superadmin") && currentUser.role !== "superadmin") {
      return {
        success: false,
        message: "Only superadmin can delete admin accounts",
        error: "Forbidden",
      };
    }

    const users = mockDataStore.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    mockDataStore.setUsers(filtered);

    return {
      success: true,
      message: "User deleted successfully",
    };
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
