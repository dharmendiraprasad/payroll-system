/**
 * Core Application State and Router
 * Handles role-based access control simulation, global single source of truth data store, 
 * localStorage persistence, and page transitions.
 */

const DEFAULT_STATE = {
  currentUserRole: 'HR Administrator', // Roles: Employee, Manager, HR Administrator, System Administrator
  currentUserId: 'EMP001',
  activeTab: 'uc1-calculate-salary',
  
  // Single Source of Truth: Employee Master & Financial Data
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
      status: 'Approved'
    }
  ],

  // User Roles & Access Security Audit Logs (UC6)
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
};

// Role Permission Matrix (UX Role Simulator Mapping)
const ROLE_PERMISSIONS = {
  'Employee': {
    allowedTabs: ['uc2-generate-payslip', 'uc3-leave-attendance'],
    canEditMasterData: false,
    canRunPayroll: false,
    canApproveLeaves: false,
    canManageRoles: false,
    viewOwnOnly: true
  },
  'Manager': {
    allowedTabs: ['uc1-calculate-salary', 'uc2-generate-payslip', 'uc3-leave-attendance', 'uc5-statutory-tax'],
    canEditMasterData: false,
    canRunPayroll: false,
    canApproveLeaves: true,
    canManageRoles: false,
    viewOwnOnly: false
  },
  'HR Administrator': {
    allowedTabs: ['uc1-calculate-salary', 'uc4-master-data', 'uc5-statutory-tax', 'uc2-generate-payslip', 'uc3-leave-attendance'],
    canEditMasterData: true,
    canRunPayroll: true,
    canApproveLeaves: true,
    canManageRoles: false,
    viewOwnOnly: false
  },
  'System Administrator': {
    allowedTabs: ['uc1-calculate-salary', 'uc4-master-data', 'uc5-statutory-tax', 'uc2-generate-payslip', 'uc3-leave-attendance', 'uc6-user-roles'],
    canEditMasterData: true,
    canRunPayroll: true,
    canApproveLeaves: true,
    canManageRoles: true,
    viewOwnOnly: false
  }
};

const STORAGE_KEY = 'PAYROLL_SYSTEM_STATE_V2';

const PayrollApp = {
  state: null,

  init() {
    this.loadState();
    this.bindEvents();
    this.updateRoleView();
    this.renderActiveTab();
  },

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
        if (!this.state.employees || !this.state.leaveRequests) {
          throw new Error('State incomplete');
        }
      } else {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, restoring defaults:', e);
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  },

  resetDemoData() {
    if (confirm('Reset all employee records, leaves, and logs back to default demo data?')) {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.saveState();
      this.updateRoleView();
      this.renderActiveTab();
      this.showToast('Reset back to default demo dataset!');
    }
  },

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-item button').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Role Switcher Dropdown
    const roleSelect = document.getElementById('global-role-select');
    if (roleSelect) {
      roleSelect.value = this.state.currentUserRole;
      roleSelect.addEventListener('change', (e) => {
        const newRole = e.target.value;
        this.state.currentUserRole = newRole;
        this.saveState();
        this.updateRoleView();
        
        // Auto-switch to first allowed tab if current active tab is unauthorized
        const permissions = ROLE_PERMISSIONS[newRole] || ROLE_PERMISSIONS['Employee'];
        if (!permissions.allowedTabs.includes(this.state.activeTab)) {
          this.switchTab(permissions.allowedTabs[0]);
        } else {
          this.renderActiveTab();
        }

        this.showToast(`Active Role Simulator changed to: ${newRole}`);
      });
    }

    // Mobile nav toggle button
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('open');
      });
    }
  },

  hasPermission(tabId) {
    const role = this.state.currentUserRole || 'HR Administrator';
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['Employee'];
    return permissions.allowedTabs.includes(tabId);
  },

  canPerform(action) {
    const role = this.state.currentUserRole || 'HR Administrator';
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['Employee'];
    return !!permissions[action];
  },

  switchTab(tabId) {
    this.state.activeTab = tabId;
    this.saveState();

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

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');

    this.renderActiveTab();
  },

  updateRoleView() {
    const roleBadge = document.getElementById('current-role-badge');
    if (roleBadge) {
      roleBadge.textContent = this.state.currentUserRole;
    }
  },

  renderActiveTab() {
    const tabId = this.state.activeTab;
    const isAllowed = this.hasPermission(tabId);

    if (!isAllowed) {
      const container = document.getElementById(tabId);
      if (container) {
        container.innerHTML = `
          <div class="card" style="text-align: center; padding: 3rem 1.5rem; border-color: rgba(244, 63, 94, 0.4);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h2 style="color: var(--accent-rose); margin-bottom: 0.5rem;">Access Restricted (UX Role Simulation)</h2>
            <p style="color: var(--text-muted); max-width: 550px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
              In the active simulator mode, <strong>${this.state.currentUserRole}</strong> does not have clearance to view this module.
              Select <strong>HR Administrator</strong> or <strong>System Administrator</strong> in the bottom-left sidebar to test full access.
            </p>
            <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 8px; max-width: 500px; margin: 0 auto; line-height: 1.5;">
              ℹ️ <em>Notice for Stakeholders: Client-side Role Simulation for prototype demo purposes. Enterprise production deployments enforce RBAC via backend server APIs.</em>
            </div>
          </div>
        `;
      }
      return;
    }

    if (window.DharmendiraModules && typeof window.DharmendiraModules.render === 'function') {
      window.DharmendiraModules.render(tabId);
    }
    if (window.BalamuruganModules && typeof window.BalamuruganModules.render === 'function') {
      window.BalamuruganModules.render(tabId);
    }
  },

  /**
   * RFC 4180 compliant CSV Escaper
   */
  toCSVRow(fieldsArray) {
    return fieldsArray.map(val => {
      let str = (val === null || val === undefined) ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',');
  },

  downloadCSV(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(`Exported ${filename} successfully!`);
  },

  addAuditLog(action, details) {
    const newLog = {
      id: `LOG00${this.state.roleAuditLogs.length + 1}`,
      timestamp: new Date().toLocaleString(),
      action: action,
      performedBy: `${this.state.currentUserRole} (${this.state.currentUserId})`,
      details: details
    };
    this.state.roleAuditLogs.unshift(newLog);
    this.saveState();
  },

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? '#f43f5e' : type === 'info' ? '#38bdf8' : '#10b981';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${bgColor};
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3200);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PayrollApp.init();
});

window.PayrollApp = PayrollApp;
