// Quick Fix Script - Run this in browser console (F12)

console.log("=== PAYSLIP DEBUG & FIX ===");

// 1. Check current user
const user = JSON.parse(localStorage.getItem('hrms_current_user') || 'null');
console.log("👤 Current User:", user);

// 2. Check employees
const employees = JSON.parse(localStorage.getItem('hrms_mock_employees') || '[]');
console.log("👥 Employees in storage:", employees.length);
employees.forEach(emp => {
  console.log(`  - ${emp.name} (${emp.email}) - ID: ${emp.id}`);
});

// 3. Check payslips
const payslips = JSON.parse(localStorage.getItem('hrms_mock_payslips') || '[]');
console.log("📋 Payslips in storage:", payslips.length);
console.log("📋 Payslip employee IDs:", [...new Set(payslips.map(p => p.employeeId))]);

// 4. Find mismatch
if (user) {
  const employee = employees.find(e => e.email === user.email);
  if (employee) {
    console.log("✓ Employee found:", employee.name, "ID:", employee.id);
    const userPayslips = payslips.filter(p => p.employeeId === employee.id);
    console.log(`✓ Payslips for this employee: ${userPayslips.length}`);
    if (userPayslips.length === 0) {
      console.error("❌ PROBLEM: No payslips found for employee ID:", employee.id);
      console.log("🔧 Running fix...");
      
      // Clear and regenerate
      localStorage.removeItem('hrms_mock_payslips');
      console.log("✅ Cleared old payslips");
      console.log("🔄 Refresh the page to regenerate payslips");
    }
  } else {
    console.error("❌ No employee record found for:", user.email);
  }
}

console.log("\n=== FIX COMPLETE ===");
console.log("If you saw 'PROBLEM' above, refresh the page now (F5)");
