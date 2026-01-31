# Employee Payslip Mock Data

## Overview
Mock payslip data has been enhanced to provide a realistic multi-month payment history for all employees.

## What Was Added

### 1. Extended Historical Data
- **7 months of payslips** per employee (July 2024 - January 2025)
- Each employee now has 35 total payslips (5 employees × 7 months)

### 2. Realistic Data Variations
To simulate real-world scenarios, each payslip includes small random variations:
- **Salary**: ±$500 (20% chance) - simulates bonuses/adjustments
- **Allowances**: ±$250 (30% chance) - simulates variable allowances
- **Deductions**: ±$150 (20% chance) - simulates tax/benefit changes

### 3. Data Sorting
Payslips are now sorted by **most recent first** (January 2025 at the top)

## Test Accounts with Payslips

All these accounts will have 7 months of payslip history:

1. **employee@hrms.com** (John Employee)
   - Job Role: Software Engineer
   - Base Salary: $75,000
   - Has 7 months of payslips

2. **jane.smith@hrms.com** (Jane Smith)
   - Job Role: Product Manager
   - Base Salary: $90,000
   - Has 7 months of payslips

3. **bob.johnson@hrms.com** (Bob Johnson)
   - Job Role: UX Designer
   - Base Salary: $70,000
   - Has 7 months of payslips

4. **alice.williams@hrms.com** (Alice Williams)
   - Job Role: HR Manager
   - Base Salary: $85,000
   - Has 7 months of payslips

5. **charlie.brown@hrms.com** (Charlie Brown)
   - Job Role: DevOps Engineer
   - Base Salary: $80,000
   - Has 7 months of payslips

## How to Reset and View New Data

### Option 1: Using Login Page Button (Easiest)
1. Go to the login page (`/login`)
2. Click the **"Reset Mock Data & Payslips"** button at the bottom
3. Confirm the action
4. Page will refresh with fresh data

### Option 2: Browser Console
Open browser console (F12) and run:
```javascript
// Reset all mock data
resetMockData()

// Or just regenerate payslips
regeneratePayslips()

// Then refresh the page
location.reload()
```

### Option 3: Clear localStorage Manually
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete these keys:
   - `hrms_mock_users`
   - `hrms_mock_employees`
   - `hrms_mock_payroll_runs`
   - `hrms_mock_payslips`
4. Refresh the page

## Files Modified

1. **lib/mockData.ts**
   - Enhanced payslip generation logic
   - Added `regeneratePayslips()` function
   - Added `resetMockData()` function
   - Exposed functions to `window` object for console access

2. **app/payslips/my/page.tsx**
   - Added sorting by most recent date
   - Payslips now display newest first

3. **app/login/page.tsx**
   - Added "Reset Mock Data" button
   - Added test account information display
   - Improved developer experience

## Viewing Payslips

1. **As an Employee**:
   - Login with `employee@hrms.com` (any password)
   - Navigate to "My Payslips" from the sidebar
   - You'll see 7 months of payslips

2. **As Admin/Superadmin**:
   - Can view all payslips across all employees
   - Access through employee details pages

## Technical Details

### Payslip Structure
```typescript
interface Payslip {
  id: string                    // Format: "payslip-{empId}-{year}-{month}"
  employeeId: string
  employeeName: string
  month: string                 // "1" to "12"
  year: number                  // e.g., 2024, 2025
  basicSalary: number
  allowances: number
  deductions: number
  netPay: number               // basicSalary + allowances - deductions
  generatedAt: string          // ISO date string
}
```

### Data Generation Logic
- Payslips are generated on first app load
- Stored in localStorage under key `hrms_mock_payslips`
- Variations ensure no two months are exactly identical
- All calculations maintain data integrity (no negative values)

## Troubleshooting

**Q: I don't see any payslips**
- Make sure you're logged in as an employee account
- Try resetting mock data using the login page button

**Q: I only see 2 payslips instead of 7**
- Your localStorage has old cached data
- Click "Reset Mock Data & Payslips" on the login page

**Q: Can I add more months?**
- Yes! Edit the `months` array in `lib/mockData.ts` (lines 172-219)
- Add more month entries to the array
- Reset the data to regenerate

## Next Steps

To integrate with a real backend:
1. Replace `payslipApi.getMyPayslips()` with actual API call
2. Update the backend to generate/store payslips
3. Keep the same data structure for compatibility
