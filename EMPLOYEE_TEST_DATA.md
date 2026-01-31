# Employee Test Data

## Employee Login Credentials

**Email:** `employee@hrms.com`  
**Password:** Any password (mock authentication accepts any password)  
**Name:** John Employee  
**Role:** employee

## Employee Details

- **Employee ID:** `emp1`
- **Job Role:** Software Engineer
- **Basic Salary:** ₦75,000
- **Allowances:** ₦5,000
- **Deductions:** ₦2,000
- **Net Pay:** ₦78,000 per month
- **Employment Status:** Active
- **Hire Date:** January 15, 2025

## Available Payslips

When logging in as `employee@hrms.com`, the employee will see **9 months** of payslip history:

| Month | Year | Basic Salary | Allowances | Deductions | Net Pay |
|-------|------|-------------|------------|------------|---------|
| May 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| June 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| July 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| August 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| September 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| October 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| November 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| December 2025 | 2025 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |
| January 2026 | 2026 | ₦75,000 | ₦5,000 | ₦2,000 | ₦78,000 |

*Note: Slight variations may occur due to mock data randomization to simulate realistic payroll data.*

## How to Test

1. **Login:**
   - Navigate to `/login`
   - Enter email: `employee@hrms.com`
   - Enter any password
   - Click Login

2. **View Payslips:**
   - After login, you'll be redirected to the employee dashboard
   - Navigate to "My Payslips" from the sidebar
   - You should see all 9 payslips displayed in a grid

3. **Download Payslip:**
   - Click the "Download PDF" button on any payslip
   - A mock PDF file will be downloaded

4. **Regenerate Payslips (if needed):**
   - If no payslips appear, click the "Generate Payslips" button
   - This will regenerate all mock payslips for all employees

## Other Test Users

For testing other roles:

- **Superadmin:** `superadmin@hrms.com` (full access)
- **Admin:** `admin@hrms.com` (user management, employee management)
- **Payroll Officer:** `payroll@hrms.com` (payroll and payslip management)

## Console Commands

You can also use these commands in the browser console:

```javascript
// View all payslips
localStorage.getItem('hrms_mock_payslips')

// Regenerate payslips
regeneratePayslips()

// Reset all data
resetMockData()
```

## API Endpoints Being Used

The employee payslips page uses:
- `payslipApi.getMyPayslips()` - Fetches payslips for the logged-in employee
- `payslipApi.download(id)` - Downloads a payslip as PDF

The API automatically:
1. Gets the current logged-in user from session storage
2. Finds the employee record matching the user's email
3. Filters payslips by employee ID
4. Returns sorted payslips (most recent first)
