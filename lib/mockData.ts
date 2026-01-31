import type { User, Employee, PayrollRun, PayrollDetail, Payslip } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  USERS: "hrms_mock_users",
  EMPLOYEES: "hrms_mock_employees",
  PAYROLL_RUNS: "hrms_mock_payroll_runs",
  PAYSLIPS: "hrms_mock_payslips",
} as const;

// Helper functions for localStorage
const getStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
  }
};

// Initialize mock data if not exists
const initializeMockData = () => {
  if (typeof window === "undefined") return;

  // Initialize users - always ensure superadmin exists
  const existingUsers = getStorage<User[]>(STORAGE_KEYS.USERS, []);
  const hasSuperadmin = existingUsers.some((u) => u.role === "superadmin");
  
  if (!localStorage.getItem(STORAGE_KEYS.USERS) || !hasSuperadmin) {
    const defaultUsers: User[] = [
      {
        id: "superadmin-1",
        email: "superadmin@hrms.com",
        name: "Super Admin",
        role: "superadmin",
      },
      {
        id: "admin-1",
        email: "admin@hrms.com",
        name: "Admin User",
        role: "admin",
      },
      {
        id: "payroll-1",
        email: "payroll@hrms.com",
        name: "Payroll Officer",
        role: "payroll_officer",
      },
      {
        id: "emp-1",
        email: "employee@hrms.com",
        name: "John Employee",
        role: "employee",
      },
    ];
    setStorage(STORAGE_KEYS.USERS, defaultUsers);
  }

  // Initialize employees
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    const defaultEmployees: Employee[] = [
      {
        id: "emp1",
        name: "John Employee",
        email: "employee@hrms.com",
        jobRole: "Software Engineer",
        salary: 75000,
        allowances: 5000,
        deductions: 2000,
        employmentStatus: "active",
        createdAt: new Date(2025, 0, 15).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
      {
        id: "emp2",
        name: "Jane Smith",
        email: "jane.smith@hrms.com",
        jobRole: "Product Manager",
        salary: 90000,
        allowances: 6000,
        deductions: 2500,
        employmentStatus: "active",
        createdAt: new Date(2025, 1, 1).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
      {
        id: "emp3",
        name: "Bob Johnson",
        email: "bob.johnson@hrms.com",
        jobRole: "UX Designer",
        salary: 70000,
        allowances: 4000,
        deductions: 1800,
        employmentStatus: "active",
        createdAt: new Date(2025, 2, 10).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
      {
        id: "emp4",
        name: "Alice Williams",
        email: "alice.williams@hrms.com",
        jobRole: "HR Manager",
        salary: 85000,
        allowances: 5500,
        deductions: 2200,
        employmentStatus: "active",
        createdAt: new Date(2025, 0, 5).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
      {
        id: "emp5",
        name: "Charlie Brown",
        email: "charlie.brown@hrms.com",
        jobRole: "DevOps Engineer",
        salary: 80000,
        allowances: 5000,
        deductions: 2100,
        employmentStatus: "active",
        createdAt: new Date(2025, 1, 20).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
    ];
    setStorage(STORAGE_KEYS.EMPLOYEES, defaultEmployees);
  }

  // Initialize payroll runs
  if (!localStorage.getItem(STORAGE_KEYS.PAYROLL_RUNS)) {
    const defaultPayrollRuns: PayrollRun[] = [
      {
        id: "pay1",
        month: "11",
        year: 2025,
        status: "approved",
        totalEmployees: 5,
        totalAmount: 400000,
        createdAt: new Date(2025, 10, 1).toISOString(),
      },
      {
        id: "pay2",
        month: "12",
        year: 2025,
        status: "approved",
        totalEmployees: 5,
        totalAmount: 400000,
        createdAt: new Date(2025, 11, 1).toISOString(),
      },
      {
        id: "pay3",
        month: "1",
        year: 2026,
        status: "pending",
        totalEmployees: 5,
        totalAmount: 400000,
        anomalies: [
          {
            employeeId: "emp2",
            employeeName: "Jane Smith",
            type: "unusual_deduction",
            message: "Deduction amount is higher than usual",
            severity: "medium",
          },
        ],
        createdAt: new Date(2026, 0, 1).toISOString(),
      },
    ];
    setStorage(STORAGE_KEYS.PAYROLL_RUNS, defaultPayrollRuns);
  }

  // Initialize payslips
  if (!localStorage.getItem(STORAGE_KEYS.PAYSLIPS)) {
    const employees = getStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    const defaultPayslips: Payslip[] = employees.flatMap((emp) => {
      const payslips: Payslip[] = [];
      
      // Generate payslips for the last 9 months (through January 2026)
      const months = [
        { month: "5", year: 2025, date: new Date(2025, 4, 1) },
        { month: "6", year: 2025, date: new Date(2025, 5, 1) },
        { month: "7", year: 2025, date: new Date(2025, 6, 1) },
        { month: "8", year: 2025, date: new Date(2025, 7, 1) },
        { month: "9", year: 2025, date: new Date(2025, 8, 1) },
        { month: "10", year: 2025, date: new Date(2025, 9, 1) },
        { month: "11", year: 2025, date: new Date(2025, 10, 1) },
        { month: "12", year: 2025, date: new Date(2025, 11, 1) },
        { month: "1", year: 2026, date: new Date(2026, 0, 1) },
      ];

      months.forEach(({ month, year, date }) => {
        // Add slight variations to make data more realistic
        const salaryVariation = Math.random() > 0.8 ? (Math.random() * 1000 - 500) : 0;
        const allowanceVariation = Math.random() > 0.7 ? (Math.random() * 500 - 250) : 0;
        const deductionVariation = Math.random() > 0.8 ? (Math.random() * 300 - 150) : 0;

        const basicSalary = Math.max(emp.salary + salaryVariation, emp.salary * 0.95);
        const allowances = Math.max(emp.allowances + allowanceVariation, 0);
        const deductions = Math.max(emp.deductions + deductionVariation, 0);

        payslips.push({
          id: `payslip-${emp.id}-${year}-${month}`,
          employeeId: emp.id,
          employeeName: emp.name,
          month,
          year,
          basicSalary: Math.round(basicSalary),
          allowances: Math.round(allowances),
          deductions: Math.round(deductions),
          netPay: Math.round(basicSalary + allowances - deductions),
          generatedAt: date.toISOString(),
        });
      });

      return payslips;
    });
    setStorage(STORAGE_KEYS.PAYSLIPS, defaultPayslips);
  }
};

// Default demo employee (employee@hrms.com) - always ensure this exists for "My Payslips"
const DEMO_EMPLOYEE: Employee = {
  id: "emp1",
  name: "John Employee",
  email: "employee@hrms.com",
  jobRole: "Software Engineer",
  salary: 75000,
  allowances: 5000,
  deductions: 2000,
  employmentStatus: "active",
  createdAt: new Date(2025, 0, 15).toISOString(),
  updatedAt: new Date(2026, 0, 15).toISOString(),
};

// Utility function to force regenerate payslips (useful for development)
export const regeneratePayslips = (): void => {
  if (typeof window === "undefined") return;
  
  // First ensure employees exist - if not, initialize them
  let employees = getStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
  
  if (employees.length === 0) {
    console.log("⚠️ No employees found. Initializing default employees...");
    const defaultEmployees: Employee[] = [
      DEMO_EMPLOYEE,
      {
        id: "emp2",
        name: "Jane Smith",
        email: "jane.smith@hrms.com",
        jobRole: "Product Manager",
        salary: 90000,
        allowances: 6000,
        deductions: 2500,
        employmentStatus: "active",
        createdAt: new Date(2025, 1, 1).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
      {
        id: "emp3",
        name: "Bob Johnson",
        email: "bob.johnson@hrms.com",
        jobRole: "UX Designer",
        salary: 70000,
        allowances: 4000,
        deductions: 1800,
        employmentStatus: "active",
        createdAt: new Date(2025, 2, 10).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
      {
        id: "emp4",
        name: "Alice Williams",
        email: "alice.williams@hrms.com",
        jobRole: "HR Manager",
        salary: 85000,
        allowances: 5500,
        deductions: 2200,
        employmentStatus: "active",
        createdAt: new Date(2025, 0, 5).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
      {
        id: "emp5",
        name: "Charlie Brown",
        email: "charlie.brown@hrms.com",
        jobRole: "DevOps Engineer",
        salary: 80000,
        allowances: 5000,
        deductions: 2100,
        employmentStatus: "active",
        createdAt: new Date(2025, 1, 20).toISOString(),
        updatedAt: new Date(2026, 0, 15).toISOString(),
      },
    ];
    setStorage(STORAGE_KEYS.EMPLOYEES, defaultEmployees);
    employees = defaultEmployees;
    console.log(`✅ Initialized ${employees.length} employees`);
  } else {
    // Ensure demo employee (employee@hrms.com) exists so "My Payslips" works
    const hasDemoEmployee = employees.some((e) => e.email.toLowerCase() === "employee@hrms.com");
    if (!hasDemoEmployee) {
      console.log("⚠️ Demo employee (employee@hrms.com) missing. Restoring...");
      employees = [DEMO_EMPLOYEE, ...employees];
      setStorage(STORAGE_KEYS.EMPLOYEES, employees);
      console.log(`✅ Restored demo employee. Total employees: ${employees.length}`);
    }
  }
  
  const payslips: Payslip[] = employees.flatMap((emp) => {
    const payslips: Payslip[] = [];
    
    // Generate payslips for the last 9 months (through January 2026)
    const months = [
      { month: "5", year: 2025, date: new Date(2025, 4, 1) },
      { month: "6", year: 2025, date: new Date(2025, 5, 1) },
      { month: "7", year: 2025, date: new Date(2025, 6, 1) },
      { month: "8", year: 2025, date: new Date(2025, 7, 1) },
      { month: "9", year: 2025, date: new Date(2025, 8, 1) },
      { month: "10", year: 2025, date: new Date(2025, 9, 1) },
      { month: "11", year: 2025, date: new Date(2025, 10, 1) },
      { month: "12", year: 2025, date: new Date(2025, 11, 1) },
      { month: "1", year: 2026, date: new Date(2026, 0, 1) },
    ];

    months.forEach(({ month, year, date }) => {
      // Add slight variations to make data more realistic
      const salaryVariation = Math.random() > 0.8 ? (Math.random() * 1000 - 500) : 0;
      const allowanceVariation = Math.random() > 0.7 ? (Math.random() * 500 - 250) : 0;
      const deductionVariation = Math.random() > 0.8 ? (Math.random() * 300 - 150) : 0;

      const basicSalary = Math.max(emp.salary + salaryVariation, emp.salary * 0.95);
      const allowances = Math.max(emp.allowances + allowanceVariation, 0);
      const deductions = Math.max(emp.deductions + deductionVariation, 0);

      payslips.push({
        id: `payslip-${emp.id}-${year}-${month}`,
        employeeId: emp.id,
        employeeName: emp.name,
        month,
        year,
        basicSalary: Math.round(basicSalary),
        allowances: Math.round(allowances),
        deductions: Math.round(deductions),
        netPay: Math.round(basicSalary + allowances - deductions),
        generatedAt: date.toISOString(),
      });
    });

    return payslips;
  });
  
  setStorage(STORAGE_KEYS.PAYSLIPS, payslips);
  console.log(`✅ Regenerated ${payslips.length} payslips for ${employees.length} employees`);
  console.log(`📋 Payslips generated for employee IDs:`, [...new Set(payslips.map(p => p.employeeId))]);
};

// Reset all mock data (useful for development)
export const resetMockData = (): void => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
  localStorage.removeItem(STORAGE_KEYS.PAYROLL_RUNS);
  localStorage.removeItem(STORAGE_KEYS.PAYSLIPS);
  
  console.log("🔄 Mock data cleared. Refresh the page to reinitialize.");
};

// Initialize on import
if (typeof window !== "undefined") {
  initializeMockData();
  
  // Ensure superadmin always exists (in case it was deleted)
  const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
  const hasSuperadmin = users.some((u) => u.role === "superadmin" && u.email === "superadmin@hrms.com");
  if (!hasSuperadmin) {
    const superadmin: User = {
      id: "superadmin-1",
      email: "superadmin@hrms.com",
      name: "Super Admin",
      role: "superadmin",
    };
    users.unshift(superadmin); // Add to beginning
    setStorage(STORAGE_KEYS.USERS, users);
  }

  // Expose utility functions to window for console access
  (window as any).resetMockData = resetMockData;
  (window as any).regeneratePayslips = regeneratePayslips;
}

// Mock data access functions
export const mockDataStore = {
  // Users
  getUsers: (): User[] => getStorage(STORAGE_KEYS.USERS, []),
  setUsers: (users: User[]): void => setStorage(STORAGE_KEYS.USERS, users),
  addUser: (user: User): void => {
    const users = mockDataStore.getUsers();
    users.push(user);
    mockDataStore.setUsers(users);
  },
  findUserByEmail: (email: string): User | undefined => {
    return mockDataStore.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id: string): User | undefined => {
    return mockDataStore.getUsers().find((u) => u.id === id);
  },

  // Employees
  getEmployees: (): Employee[] => getStorage(STORAGE_KEYS.EMPLOYEES, []),
  setEmployees: (employees: Employee[]): void => setStorage(STORAGE_KEYS.EMPLOYEES, employees),
  addEmployee: (employee: Employee): void => {
    const employees = mockDataStore.getEmployees();
    employees.push(employee);
    mockDataStore.setEmployees(employees);
  },
  updateEmployee: (id: string, updates: Partial<Employee>): Employee | null => {
    const employees = mockDataStore.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) return null;
    employees[index] = { ...employees[index], ...updates, updatedAt: new Date().toISOString() };
    mockDataStore.setEmployees(employees);
    return employees[index];
  },
  deleteEmployee: (id: string): boolean => {
    const employees = mockDataStore.getEmployees();
    const filtered = employees.filter((e) => e.id !== id);
    if (filtered.length === employees.length) return false;
    mockDataStore.setEmployees(filtered);
    return true;
  },
  getEmployeeById: (id: string): Employee | undefined => {
    return mockDataStore.getEmployees().find((e) => e.id === id);
  },

  // Payroll Runs
  getPayrollRuns: (): PayrollRun[] => getStorage(STORAGE_KEYS.PAYROLL_RUNS, []),
  setPayrollRuns: (runs: PayrollRun[]): void => setStorage(STORAGE_KEYS.PAYROLL_RUNS, runs),
  addPayrollRun: (run: PayrollRun): void => {
    const runs = mockDataStore.getPayrollRuns();
    runs.push(run);
    mockDataStore.setPayrollRuns(runs);
  },
  updatePayrollRun: (id: string, updates: Partial<PayrollRun>): PayrollRun | null => {
    const runs = mockDataStore.getPayrollRuns();
    const index = runs.findIndex((r) => r.id === id);
    if (index === -1) return null;
    runs[index] = { ...runs[index], ...updates };
    mockDataStore.setPayrollRuns(runs);
    return runs[index];
  },
  getPayrollRunById: (id: string): PayrollRun | undefined => {
    return mockDataStore.getPayrollRuns().find((r) => r.id === id);
  },

  // Payslips
  getPayslips: (): Payslip[] => getStorage(STORAGE_KEYS.PAYSLIPS, []),
  setPayslips: (payslips: Payslip[]): void => setStorage(STORAGE_KEYS.PAYSLIPS, payslips),
  addPayslip: (payslip: Payslip): void => {
    const payslips = mockDataStore.getPayslips();
    payslips.push(payslip);
    mockDataStore.setPayslips(payslips);
  },
  getPayslipById: (id: string): Payslip | undefined => {
    return mockDataStore.getPayslips().find((p) => p.id === id);
  },
  getPayslipsByEmployeeId: (employeeId: string): Payslip[] => {
    return mockDataStore.getPayslips().filter((p) => p.employeeId === employeeId);
  },
};

// Simulate network delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export { delay, generateId };
