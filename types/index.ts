export type UserRole = "superadmin" | "admin" | "payroll_officer" | "employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  jobRole: string;
  salary: number;
  allowances: number;
  deductions: number;
  employmentStatus: "active" | "inactive" | "terminated";
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollRun {
  id: string;
  month: string;
  year: number;
  status: "pending" | "approved" | "rejected";
  totalEmployees: number;
  totalAmount: number;
  anomalies?: PayrollAnomaly[];
  createdAt: string;
}

export interface PayrollAnomaly {
  employeeId: string;
  employeeName: string;
  type: "salary_mismatch" | "unusual_deduction" | "missing_data" | "other";
  message: string;
  severity: "low" | "medium" | "high";
}

export interface PayrollDetail {
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  anomalies?: PayrollAnomaly[];
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
