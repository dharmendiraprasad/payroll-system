# PAYROLL SYSTEM — Front-End Web Application

A front-end automated payroll management web application built for seamless payroll processing, statutory deductions computation, employee master data management, leave & attendance tracking, payslip generation, and role-based access control.

---

## 👥 Authors & Task Division

### 🟢 Dharmendira Prasad P (24MIS0073)
* **Use Case 1:** Calculate Employee Salary (`js/dharmendira_modules.js`)
* **Use Case 4:** Maintain Employee Master Data and Salary Structure (`js/dharmendira_modules.js`)
* **Use Case 5:** Compute Statutory Deductions and Tax (`js/dharmendira_modules.js`)
* **Branch:** `feature/dharmendira-payroll`

### 🔵 Balamurugan D (24MIS0096)
* **Use Case 2:** Generate & View Payslip (`js/balamurugan_modules.js`)
* **Use Case 3:** Manage Employee Leave and Attendance Deductions (`js/balamurugan_modules.js`)
* **Use Case 6:** Manage User Roles and Access Permissions (`js/balamurugan_modules.js`)
* **Branch:** `feature/balamurugan-payslip`

---

## 🚀 How to Run Locally

1. Open `index.html` directly in any web browser (or use Live Server / VS Code / Antigravity preview).
2. Use the **Role Simulator** dropdown in the bottom-left sidebar to test permissions for:
   - **HR Administrator**
   - **Manager**
   - **Employee**
   - **System Administrator**

---

## 🛠️ GitHub Setup & Collaboration Guide

### 1. How to Invite Your Friend on GitHub
1. Open [GitHub.com](https://github.com) and navigate to your repository `payroll-system`.
2. Click **Settings** (top tabs of the repository).
3. Select **Collaborators** from the left sidebar menu.
4. Click **Add people**.
5. Type your friend's GitHub username or email address and click **Add to this repository**.
6. Your friend will receive an invitation email or a notification on GitHub to accept.

---

### 2. Git Terminal Commands for Setup & Branching

#### Step A: Initialize Git locally & commit initial codebase
```bash
git init
git add .
git commit -m "Initial commit: Complete Front-End Payroll System setup"
git branch -M main
```

#### Step B: Link local project to GitHub repository & push main branch
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/payroll-system.git
git push -u origin main
```

#### Step C: Create feature branches for each partner
```bash
# Create and push Dharmendira's branch
git checkout -b feature/dharmendira-payroll
git push -u origin feature/dharmendira-payroll

# Create and push Balamurugan's branch
git checkout -b feature/balamurugan-payslip
git push -u origin feature/balamurugan-payslip
```

#### Step D: How your friend works on their branch
Your friend clones the repo, switches to their branch, makes edits, and pushes:
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/payroll-system.git
cd payroll-system
git checkout feature/balamurugan-payslip
# (Make edits or additions)
git add .
git commit -m "Updated payslip viewer and leave approval logic"
git push origin feature/balamurugan-payslip
```

---

## 🌟 Key Features
- **Statutory Tax & PF Calculator:** Interactive tax slab test simulator.
- **Automated Salary Calculation:** Computes gross pay, tax, PF, insurance, and unpaid leave penalties.
- **Printable Payslip Modal:** Pixel-perfect printable document formatted with printable CSS (`@media print`).
- **Leave Approval Workflow:** Instant unpaid leave deduction calculation.
- **Audit Logging:** System administrative logs for security role changes.
