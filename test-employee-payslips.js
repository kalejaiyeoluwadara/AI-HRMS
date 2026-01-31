// Test script to verify payslip data for employee@hrms.com
// Run this in the browser console after the app loads

console.log("=== EMPLOYEE PAYSLIP DATA TEST ===\n");

// 1. Check if localStorage has the data
const employeesRaw = localStorage.getItem('hrms_mock_employees');
const payslipsRaw = localStorage.getItem('hrms_mock_payslips');

console.log("1. Storage Check:");
console.log("   - Employees in storage:", employeesRaw ? "✅ Found" : "❌ Not found");
console.log("   - Payslips in storage:", payslipsRaw ? "✅ Found" : "❌ Not found");

if (!employeesRaw || !payslipsRaw) {
  console.log("\n⚠️  Storage is empty. Refresh the page to initialize mock data.");
}

// 2. Parse and examine employee data
const employees = employeesRaw ? JSON.parse(employeesRaw) : [];
const targetEmployee = employees.find(e => e.email === "employee@hrms.com");

console.log("\n2. Employee Record:");
if (targetEmployee) {
  console.log("   ✅ Found employee:", targetEmployee.name);
  console.log("   - ID:", targetEmployee.id);
  console.log("   - Email:", targetEmployee.email);
  console.log("   - Job Role:", targetEmployee.jobRole);
  console.log("   - Salary:", targetEmployee.salary);
  console.log("   - Status:", targetEmployee.employmentStatus);
} else {
  console.log("   ❌ Employee not found!");
}

// 3. Check payslips for this employee
const payslips = payslipsRaw ? JSON.parse(payslipsRaw) : [];
const employeePayslips = targetEmployee 
  ? payslips.filter(p => p.employeeId === targetEmployee.id)
  : [];

console.log("\n3. Payslips:");
console.log("   - Total payslips in system:", payslips.length);
console.log("   - Payslips for employee@hrms.com:", employeePayslips.length);

if (employeePayslips.length > 0) {
  console.log("\n   Payslip Details:");
  employeePayslips
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return parseInt(b.month) - parseInt(a.month);
    })
    .forEach(p => {
      const date = new Date(p.year, parseInt(p.month) - 1);
      const monthName = date.toLocaleString('default', { month: 'long' });
      console.log(`   - ${monthName} ${p.year}: ₦${p.netPay.toLocaleString()} (ID: ${p.id})`);
    });
} else {
  console.log("   ⚠️  No payslips found for this employee");
  if (targetEmployee) {
    console.log("\n   💡 Try running: regeneratePayslips()");
  }
}

// 4. Test the API
console.log("\n4. Testing API (if logged in as employee@hrms.com):");
const currentUserRaw = sessionStorage.getItem('currentUser');
const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

if (currentUser) {
  console.log("   - Current user:", currentUser.name);
  console.log("   - Email:", currentUser.email);
  console.log("   - Role:", currentUser.role);
  
  if (currentUser.email === "employee@hrms.com") {
    console.log("   ✅ Logged in as employee@hrms.com");
  } else {
    console.log("   ⚠️  Logged in as different user");
  }
} else {
  console.log("   ⚠️  Not logged in");
}

console.log("\n=== END TEST ===");
console.log("\n💡 Available commands:");
console.log("   - regeneratePayslips() - Regenerate all payslips");
console.log("   - resetMockData() - Clear all data and reinitialize");
