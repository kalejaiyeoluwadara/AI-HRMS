# Reset Payslips - Quick Fix

## Problem
You logged in as `employee@hrms.com` but don't see any payslips (or only see 2 old ones).

## Root Cause
Your browser's localStorage has old cached payslip data from before the enhancement was made.

## Solution 1: Use the Reset Button (Easiest)
1. Logout or navigate to `/login`
2. Scroll down to find the **"Reset Mock Data & Payslips"** button
3. Click it and confirm
4. Login again as `employee@hrms.com`

## Solution 2: Browser Console (Quickest)
Open your browser console (Press `F12`) and paste this:

```javascript
// Clear just the payslips
localStorage.removeItem('hrms_mock_payslips');
console.log('✅ Payslips cleared!');

// Reload the page
location.reload();
```

## Solution 3: Clear All Mock Data
If you want to reset everything (users, employees, payroll runs, payslips):

```javascript
// Clear all mock data
localStorage.removeItem('hrms_mock_users');
localStorage.removeItem('hrms_mock_employees');
localStorage.removeItem('hrms_mock_payroll_runs');
localStorage.removeItem('hrms_mock_payslips');
console.log('✅ All mock data cleared!');

// Reload the page
location.reload();
```

## Solution 4: Using DevTools UI
1. Open DevTools (F12)
2. Go to **Application** tab
3. In the left sidebar, expand **Local Storage**
4. Click on your domain (e.g., `http://localhost:3000`)
5. Find and delete the key: `hrms_mock_payslips`
6. Refresh the page (F5)

## Verify It Worked
After resetting:
1. Login as `employee@hrms.com`
2. Go to "My Payslips" from the sidebar
3. You should now see **7 payslips** (July 2024 - January 2025)

## Still Not Working?
If you still don't see payslips after resetting, check:
1. Make sure you're logged in as `employee@hrms.com` (not another account)
2. Check the browser console for any errors
3. Try clearing ALL mock data using Solution 3 above
