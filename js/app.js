/**
 * Core Application State and Router
 * Handles role-based access control, global data store, and page transitions
 */

const PayrollApp = {
  // Application Data Store
  state: {
    currentUserRole: 'HR Administrator', // Roles: Employee, Manager, HR Administrator, System Administrator
    currentUserId: 'EMP001',
    activeTab: 'uc1-calculate-salary',
    
    // Employee Master Data
    employees: [
      {
        id: 'EMP001',
        name: 'Dharmendira Prasad P',
        rollNo: '24MIS0073',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        role: 'HR Administrator',
        basicPay: 75000,
        hra: 25000,
        specialAllowance: 15000,
        bankAccount: 'ACC987654321',
        bankName: 'HDFC Bank',
        status: 'Active',
        taxSlab: 'New Tax Regime (15%)',
        pfContribution: 3600,
        insurance: 1500,
        leavesTaken: 2,
        leaveQuota: 18,
        unpaidLeaves: 0
      },
      {
        id: 'EMP002',
        name: 'Balamurugan D',
        rollNo: '24MIS0096',
        department: 'Human Resources',
        designation: 'Payroll & Compliance Specialist',
        role: 'Manager',
        basicPay: 68000,
        hra: 22000,
        specialAllowance: 12000,
        bankAccount: 'ACC123456789',
        bankName: 'ICICI Bank',
        status: 'Active',
        taxSlab: 'New Tax Regime (15%)',
        pfContribution: 3200,
        insurance: 1200,
        leavesTaken: 4,
        leaveQuota: 18,
        unpaidLeaves: 1
      },
      {
        id: 'EMP003',
        name: 'Anita Sharma',
        rollNo: '24MIS0105',
        department: 'Finance',
        designation: 'Financial Analyst',
        role: 'Employee',
        basicPay: 55000,
        hra: 18000,
        specialAllowance: 10000,
        bankAccount: 'ACC456789123',
        bankName: 'State Bank of India',
        status: 'Active',
        taxSlab: 'Old Tax Regime (20%)',
        pfContribution: 2600,
        insurance: 1000,
        leavesTaken: 1,
        leaveQuota: 18,
        unpaidLeaves: 0
      }
    ],

    // Attendance & Leave Requests (UC3)
    leaveRequests: [
      {
        id: 'LR101',
        empId: 'EMP002',
        empName: 'Balamurugan D',
        leaveType: 'Casual Leave',
        startDate: '2026-07-10',
        endDate: '2026-07-11',
        days: 2,
        reason: 'Personal emergency',
        status: 'Approved'
      },
      {
        id: 'LR102',
        empId: 'EMP003',
        empName: 'Anita Sharma',
        leaveType: 'Unpaid Leave',
        startDate: '2026-07-22',
        endDate: '2026-07-23',
        days: 2,
        reason: 'Extended travel',
        status: 'Pending'
      }
    ],

    // Calculated Payroll History (UC1 & UC2)
    payrollRuns: [
      {
        id: 'PR-2026-07',
        month: 'July 2026',
        processedDate: '2026-07-28',
        totalEmployees: 3,
        totalGrossPay: 300000,
        totalDeductions: 42500,
        totalNetPay: 257500,
        status: 'Approved',
        records: [
          {
            empId: 'EMP001',
            empName: 'Dharmendira Prasad P',
            basicPay: 75000,
            hra: 25000,
            specialAllowance: 15000,
            grossPay: 115000,
            taxDeduction: 11250,
            pfDeduction: 3600,
            insuranceDeduction: 1500,
            unpaidLeaveDeduction: 0,
            totalDeductions: 16350,
            netPay: 98650,
            status: 'Approved'
          },
          {
            empId: 'EMP002',
            empName: 'Balamurugan D',
            basicPay: 68000,
            hra: 22000,
            specialAllowance: 12000,
            grossPay: 102000,
            taxDeduction: 9500,
            pfDeduction: 3200,
            insuranceDeduction: 1200,
            unpaidLeaveDeduction: 2266,
            totalDeductions: 16166,
            netPay: 85834,
            status: 'Approved'
          },
          {
            empId: 'EMP003',
            empName: 'Anita Sharma',
            basicPay: 55000,
            hra: 18000,
            specialAllowance: 10000,
            grossPay: 83000,
            taxDeduction: 6400,
            pfDeduction: 2600,
            insuranceDeduction: 1000,
            unpaidLeaveDeduction: 0,
            totalDeductions: 10000,
            netPay: 73000,
            status: 'Approved'
          }
        ]
      }
    ],

    // User Roles & Access Log (UC6)
    roleAuditLogs: [
      {
        id: 'LOG001',
        timestamp: '2026-07-19 10:30 AM',
        action: 'Role Created',
        performedBy: 'System Administrator',
        details: 'Assigned HR Administrator role to Dharmendira Prasad P'
      },
      {
        id: 'LOG002',
        timestamp: '2026-07-19 11:15 AM',
        action: 'Role Updated',
        performedBy: 'System Administrator',
        details: 'Assigned Manager role to Balamurugan D'
      }
    ]
  },

  init() {
    this.bindEvents();
    this.updateRoleView();
    this.renderActiveTab();
  },

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-item button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Role Switcher
    const roleSelect = document.getElementById('global-role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        this.state.currentUserRole = e.target.value;
        this.updateRoleView();
        this.renderActiveTab();
        this.showToast(`Switched active role to: ${e.target.value}`);
      });
    }
  },

  switchTab(tabId) {
    this.state.activeTab = tabId;
    
    document.querySelectorAll('.nav-item').forEach(item => {
      const btn = item.querySelector('button');
      if (btn && btn.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.view-panel').forEach(panel => {
      if (panel.id === tabId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    this.renderActiveTab();
  },

  updateRoleView() {
    const roleBadge = document.getElementById('current-role-badge');
    if (roleBadge) {
      roleBadge.textContent = this.state.currentUserRole;
    }
  },

  renderActiveTab() {
    // Call specific renders based on active tab
    if (window.DharmendiraModules && typeof window.DharmendiraModules.render === 'function') {
      window.DharmendiraModules.render(this.state.activeTab);
    }
    if (window.BalamuruganModules && typeof window.BalamuruganModules.render === 'function') {
      window.BalamuruganModules.render(this.state.activeTab);
    }
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PayrollApp.init();
});

window.PayrollApp = PayrollApp;
