# Chapter 4: Implementation

**Project Title:** An AI-Driven Approach to Human Resource Management: Automating Employee Records and Payroll

---

## 4.1 Introduction

This chapter presents the implementation of the HRMS. The system is built with Next.js 15 (App Router), Tailwind CSS, and Radix UI. It supports four user roles—superadmin, admin, payroll officer, and employee—with role-based access control. Data is persisted via a mock API using localStorage for demonstration purposes.

---

## 4.2 Authentication and Access Control

**Figure 4.1: Login Screen**

The login page accepts email and password. Authentication is handled via a mock API that validates credentials against stored users. On success, the user and token are stored in localStorage, and the user is redirected to a role-specific dashboard. Registration is disabled; users are created by administrators through the user management module.

**Figure 4.2: Role-Based Navigation**

The sidebar displays navigation links based on the logged-in user's role. Superadmins see Users, Employees, Payroll, Payslips, and Settings. Admins additionally see the AI Assistant. Payroll officers see Payroll and Payslips. Employees see only their dashboard and My Payslips. Protected routes enforce role checks before rendering.

---

## 4.3 Dashboards

**Figure 4.3: Superadmin Dashboard**

The superadmin dashboard shows summary statistics: total users, total employees, pending payroll runs, and total payroll runs. Quick action buttons allow navigation to key modules. An audit log section displays recent system activity.

**Figure 4.4: Admin Dashboard**

The admin dashboard displays employee count, pending payroll, and total payroll runs. Quick actions and audit log are provided for efficient workflow.

**Figure 4.5: Payroll Officer Dashboard**

This dashboard focuses on payroll tasks: pending approvals, total runs, runs for the current month, and anomaly count. Quick actions link to payroll run and approval workflows.

**Figure 4.6: Employee Dashboard**

Employees see a welcome message, payslip count, latest net pay, and recent payslips. The interface is simplified to their scope of access.

---

## 4.4 Employee Management

**Figure 4.7: Employee List**

The employee list displays all employees in a table with search by name, email, or job role. Each row shows name, email, job role, salary (NGN), and employment status (active, inactive, terminated). Actions include Add Employee, Edit, and Delete.

**Figure 4.8: Add/Edit Employee Form**

The form captures employee name, email, job role, basic salary, allowances, deductions, and employment status. Validation ensures required fields are filled. On submit, data is saved via the API and the user is redirected to the employee list.

---

## 4.5 User Management (Superadmin)

**Figure 4.9: Users List**

Superadmins and admins can view all system users. The list shows name, email, and role. Superadmins can create new users (name, email, role) and delete users. Role-based restrictions prevent deletion of critical accounts.

---

## 4.6 Payroll Processing

**Figure 4.10: Payroll Runs List**

The payroll page lists all payroll runs with month/year, status (pending/approved/rejected), employee count, total amount (NGN), and anomaly count. Runs are sorted by creation date.

**Figure 4.11: Run Payroll**

The run payroll page allows selection of month and year. On execution, the system computes payslips for all active employees using their salary, allowances, and deductions. Anomaly detection runs automatically during processing.

**Figure 4.12: Payroll Run Detail and Approval**

The run detail view shows per-employee breakdown (basic salary, allowances, deductions, net pay) and any detected anomalies. Approve and Reject actions are available for pending runs. Rejection requires a reason. Approved runs update status and cannot be modified.

---

## 4.7 Anomaly Detection (AI Component)

**Figure 4.13: Anomalies in Payroll Run**

During payroll processing, the system applies rule-based anomaly detection. Key rules include: (1) deductions exceeding 30% of salary flagged as high severity; (2) unusually high allowances for engineering roles flagged as low severity. Anomalies are displayed per employee with type, message, and severity. Officers can review before approving.

---

## 4.8 Payslips

**Figure 4.14: All Payslips (Admin/Payroll Officer)**

Administrators and payroll officers view all payslips in a table. Each payslip shows employee name, month/year, basic salary, allowances, deductions, and net pay. View and Download PDF actions are available.

**Figure 4.15: My Payslips (Employee)**

Employees access only their own payslips. The list shows month/year and net pay. They can view details and download PDF. A regenerate mock option is provided for demonstration.

**Figure 4.16: Payslip Detail**

The payslip detail view displays a breakdown of basic salary, allowances, deductions, and net pay. The download action generates a PDF representation of the payslip.

---

## 4.9 AI HR Assistant

**Figure 4.17: AI HR Assistant Chat Interface**

The AI HR Assistant is a chat interface available to admins. Users type questions in natural language. The assistant responds with information drawn from live data (employees, payroll) and predefined policy responses. Supported topics include: employee count and lists, departments/job roles, pending payroll approvals, payroll history, leave policies, attendance, and general HR help. A simulated delay provides a conversational feel. The implementation uses rule-based pattern matching with API calls to fetch current data.

---

## 4.10 Settings

**Figure 4.18: Grades, Allowances, and Deductions**

The settings page manages three configuration modules:

- **Grades:** Name, description, minimum and maximum salary. Used for salary banding.
- **Allowances:** Name, description, type (fixed or percentage), amount, and active status.
- **Deductions:** Same structure as allowances for tax, pension, and other deductions.

Each module supports Create, Read, Update, and Delete. Changes affect payroll calculations for employees linked to these configurations.

---

## 4.11 Technology Stack Summary

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | Next.js 15 (App Router)              |
| UI          | Tailwind CSS, Radix UI, Lucide icons |
| State       | React useState / useEffect           |
| Auth        | localStorage-based (mock)            |
| Data        | Mock API with localStorage           |
| Currency    | Nigerian Naira (NGN)                 |
| Roles       | superadmin, admin, payroll_officer, employee |

---

## 4.12 Conclusion

This chapter described the implementation of each major feature of the HRMS. The system provides role-based dashboards, employee and user management, automated payroll processing with anomaly detection, payslip generation and download, an AI HR Assistant for queries, and configurable settings for grades, allowances, and deductions. The implementation demonstrates the automation of employee records and payroll as outlined in the project objectives.
