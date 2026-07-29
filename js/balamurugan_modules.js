/**
 * Module created by: Balamurugan D (24MIS0096)
 * Contains functionalities for:
 * - Use Case 2: Generate & View Employee Payslip
 * - Use Case 3: Manage Employee Leave & Attendance Deductions
 * - Use Case 6: Manage User Roles and Access Permissions
 */

window.BalamuruganModules = {
  searchQueryUC2: '',
  searchQueryUC6: '',

  render(activeTab) {
    if (activeTab === 'uc2-generate-payslip') {
      this.renderGeneratePayslip();
    } else if (activeTab === 'uc3-leave-attendance') {
      this.renderLeaveAttendance();
    } else if (activeTab === 'uc6-user-roles') {
      this.renderUserRoles();
    }
  },

  /* =========================================================
     UC2: GENERATE PAYSLIP
     ========================================================= */
  renderGeneratePayslip() {
    const container = document.getElementById('uc2-generate-payslip');
    if (!container) return;

    // Single Source of Truth
    const employees = window.PayrollApp.state.employees || [];
    const currentRole = window.PayrollApp.state.currentUserRole;

    // Self-service RBAC filter: If 'Employee', limit view to current user
    let visibleEmployees = employees;
    if (currentRole === 'Employee') {
      visibleEmployees = employees.filter(e => e.id === window.PayrollApp.state.currentUserId || e.role === 'Employee');
    }

    if (this.searchQueryUC2) {
      visibleEmployees = visibleEmployees.filter(emp => 
        emp.name.toLowerCase().includes(this.searchQueryUC2.toLowerCase()) ||
        emp.id.toLowerCase().includes(this.searchQueryUC2.toLowerCase()) ||
        emp.department.toLowerCase().includes(this.searchQueryUC2.toLowerCase())
      );
    }

    const payslipCards = visibleEmployees.map(emp => {
      const gross = emp.basicPay + emp.hra + emp.specialAllowance;
      const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
      const taxDeduction = Math.round(gross * taxRate * 0.7);
      const unpaidDeduction = Math.round((gross / 30) * (emp.unpaidLeaves || 0));
      const totalDed = taxDeduction + emp.pfContribution + emp.insurance + unpaidDeduction;
      const netPay = gross - totalDed;

      return `
        <div class="card" style="background: rgba(30, 41, 59, 0.9); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div>
                <h4 style="font-size: 1.1rem; color: var(--text-main);">${emp.name}</h4>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${emp.id} • ${emp.rollNo}</span>
              </div>
              <span class="badge badge-success">Generated</span>
            </div>

            <div style="font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              <div><strong>Department:</strong> ${emp.department}</div>
              <div><strong>Designation:</strong> ${emp.designation}</div>
              <div><strong>Pay Period:</strong> July 2026</div>
              ${emp.unpaidLeaves > 0 ? `<div style="color: var(--accent-amber); font-size: 0.75rem;">Loss of Pay (LOP): ${emp.unpaidLeaves} day(s)</div>` : ''}
              <div style="color: var(--accent-emerald); font-weight: 700; margin-top: 0.5rem; font-size: 1.05rem;">Net Pay: ₹${netPay.toLocaleString()}</div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="BalamuruganModules.viewPayslipModal('${emp.id}')">
              👁️ View Payslip
            </button>
            <button class="btn btn-sm btn-secondary" onclick="BalamuruganModules.sendPayslipEmail('${emp.name}')">
              📧 Email
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">
            <span style="color: var(--accent-emerald);">📄 Use Case 2:</span> Generate & View Employee Payslip
          </div>
          <div>
            <span class="badge badge-info">Author: Balamurugan D (24MIS0096)</span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Generate detailed monthly payslips showing earnings, statutory deductions, and net salary. Self-service viewing and bulk export supported.
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
            <input type="text" class="form-control" style="max-width: 320px;" 
              placeholder="🔍 Search employee payslips..." 
              value="${this.searchQueryUC2}" 
              oninput="BalamuruganModules.handleSearchUC2(this.value)" />
          </div>
          <button class="btn btn-success" onclick="BalamuruganModules.bulkExportPayslips()">
            📦 Bulk Export Summary Report
          </button>
        </div>

        <div class="grid-3">
          ${payslipCards.length > 0 ? payslipCards : `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No payslips found matching search query.</div>`}
        </div>
      </div>
    `;
  },

  handleSearchUC2(val) {
    this.searchQueryUC2 = val;
    this.renderGeneratePayslip();
  },

  viewPayslipModal(empId) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (!emp) return;

    const gross = emp.basicPay + emp.hra + emp.specialAllowance;
    const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
    const taxDeduction = Math.round(gross * taxRate * 0.7);
    const unpaidDeduction = Math.round((gross / 30) * (emp.unpaidLeaves || 0));
    const totalDed = taxDeduction + emp.pfContribution + emp.insurance + unpaidDeduction;
    const netPay = gross - totalDed;

    const modalOverlay = document.getElementById('payslip-modal');
    const modalContent = document.getElementById('payslip-modal-body');

    modalContent.innerHTML = `
      <div class="payslip-paper">
        <div class="payslip-header">
          <div class="company-details">
            <h2>PAYROLL SYSTEM CORP</h2>
            <p>100 Enterprise Boulevard, Tech Park, Chennai</p>
            <p>Official Monthly Employee Payslip</p>
          </div>
          <div class="payslip-meta">
            <h3>PAYSLIP: JULY 2026</h3>
            <p>Generated: ${new Date().toISOString().split('T')[0]}</p>
            <p>Status: APPROVED</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
          <div>
            <div><strong>Employee Name:</strong> ${emp.name}</div>
            <div><strong>Employee ID / Roll:</strong> ${emp.id} / ${emp.rollNo}</div>
            <div><strong>Designation:</strong> ${emp.designation}</div>
          </div>
          <div>
            <div><strong>Department:</strong> ${emp.department}</div>
            <div><strong>Bank Name:</strong> ${emp.bankName}</div>
            <div><strong>Bank Account:</strong> ${emp.bankAccount}</div>
          </div>
        </div>

        <div class="payslip-grid">
          <div class="payslip-box">
            <h4>EARNINGS (₹)</h4>
            <div class="payslip-row"><span>Basic Pay</span><span>₹${emp.basicPay.toLocaleString()}</span></div>
            <div class="payslip-row"><span>House Rent Allowance (HRA)</span><span>₹${emp.hra.toLocaleString()}</span></div>
            <div class="payslip-row"><span>Special Allowance</span><span>₹${emp.specialAllowance.toLocaleString()}</span></div>
            <div class="payslip-row" style="font-weight: bold; border-top: 1px solid #cbd5e1; margin-top: 0.5rem; padding-top: 0.5rem;">
              <span>TOTAL GROSS EARNINGS</span><span>₹${gross.toLocaleString()}</span>
            </div>
          </div>

          <div class="payslip-box">
            <h4>DEDUCTIONS (₹)</h4>
            <div class="payslip-row"><span>Income Tax (TDS)</span><span>₹${taxDeduction.toLocaleString()}</span></div>
            <div class="payslip-row"><span>Provident Fund (PF)</span><span>₹${emp.pfContribution.toLocaleString()}</span></div>
            <div class="payslip-row"><span>Health Insurance</span><span>₹${emp.insurance.toLocaleString()}</span></div>
            <div class="payslip-row" style="color: #b91c1c;"><span>Unpaid Loss of Pay (${emp.unpaidLeaves || 0} days)</span><span>₹${unpaidDeduction.toLocaleString()}</span></div>
            <div class="payslip-row" style="font-weight: bold; border-top: 1px solid #cbd5e1; margin-top: 0.5rem; padding-top: 0.5rem; color: #b91c1c;">
              <span>TOTAL DEDUCTIONS</span><span>₹${totalDed.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="payslip-summary">
          <span>NET AMOUNT PAYABLE:</span>
          <span style="color: #047857;">₹${netPay.toLocaleString()}</span>
        </div>

        <div class="no-print" style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print Payslip Document</button>
          <button class="btn btn-secondary" onclick="BalamuruganModules.closePayslipModal()">Close</button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closePayslipModal() {
    document.getElementById('payslip-modal').classList.remove('active');
  },

  sendPayslipEmail(empName) {
    window.PayrollApp.showToast(`📧 Sent monthly payslip notification email to ${empName}!`);
  },

  bulkExportPayslips() {
    const employees = window.PayrollApp.state.employees || [];
    const rows = [
      ['Emp ID', 'Employee Name', 'Pay Period', 'Gross Pay', 'Total Deductions', 'Net Pay', 'Status']
    ];

    employees.forEach(emp => {
      const gross = emp.basicPay + emp.hra + emp.specialAllowance;
      const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
      const tax = Math.round(gross * taxRate * 0.7);
      const unpaid = Math.round((gross / 30) * (emp.unpaidLeaves || 0));
      const totDed = tax + emp.pfContribution + emp.insurance + unpaid;
      rows.push([
        emp.id,
        emp.name,
        'July 2026',
        gross,
        totDed,
        gross - totDed,
        'Approved'
      ]);
    });

    const csvContent = rows.map(r => window.PayrollApp.toCSVRow(r)).join('\n');
    window.PayrollApp.downloadCSV(`Payslip_Summary_Report_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  },

  /* =========================================================
     UC3: MANAGE LEAVE AND ATTENDANCE DEDUCTIONS
     ========================================================= */
  renderLeaveAttendance() {
    const container = document.getElementById('uc3-leave-attendance');
    if (!container) return;

    const requests = window.PayrollApp.state.leaveRequests || [];
    const employees = window.PayrollApp.state.employees || [];

    // Render Employee Leave Quota Summary Cards
    const quotaCards = employees.map(emp => {
      const quota = emp.leaveQuota || 18;
      const taken = emp.leavesTaken || 0;
      const remaining = Math.max(0, quota - taken);
      const unpaid = emp.unpaidLeaves || 0;

      return `
        <div class="card" style="background: rgba(15, 23, 42, 0.6); padding: 1rem;">
          <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">${emp.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem;">${emp.id} • ${emp.department}</div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
            <div>Quota: <strong>${quota} d</strong></div>
            <div>Used: <strong>${taken} d</strong></div>
            <div style="color: var(--accent-emerald);">Paid Left: <strong>${remaining} d</strong></div>
            <div style="color: var(--accent-rose);">LOP Unpaid: <strong>${unpaid} d</strong></div>
          </div>
        </div>
      `;
    }).join('');

    const canApprove = window.PayrollApp.canPerform('canApproveLeaves');

    const rows = requests.map(req => `
      <tr>
        <td><strong>${req.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${req.empName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${req.empId}</div>
        </td>
        <td><span class="badge ${req.leaveType.includes('Unpaid') ? 'badge-danger' : 'badge-info'}">${req.leaveType}</span></td>
        <td>${req.startDate} to ${req.endDate} (${req.days} days)</td>
        <td>${req.reason}</td>
        <td>
          <span class="badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}">
            ${req.status}
          </span>
        </td>
        <td>
          ${req.status === 'Pending' ? `
            <button class="btn btn-sm btn-success" ${!canApprove ? 'disabled title="Requires Manager approval clearance"' : ''} onclick="BalamuruganModules.updateLeaveStatus('${req.id}', 'Approved')">Approve</button>
            <button class="btn btn-sm btn-danger" ${!canApprove ? 'disabled title="Requires Manager approval clearance"' : ''} onclick="BalamuruganModules.updateLeaveStatus('${req.id}', 'Rejected')">Reject</button>
          ` : `
            <span style="font-size: 0.8rem; color: var(--text-muted);">Processed</span>
          `}
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span style="color: var(--accent-amber);">📅 Use Case 3:</span> Manage Leave & Attendance Deductions
          </div>
          <div>
            <span class="badge badge-info">Author: Balamurugan D (24MIS0096)</span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Managers review employee leave requests, attendance exceptions, and calculate salary deductions for unpaid loss of pay (LOP) leave.
        </p>

        <h4 style="margin-bottom: 0.75rem; color: var(--accent-blue);">Employee Annual Leave Quota Balances</h4>
        <div class="grid-3" style="margin-bottom: 1.5rem;">
          ${quotaCards}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <h3>Leave Applications & Manager Approvals</h3>
          <button class="btn btn-primary" onclick="BalamuruganModules.openSubmitLeaveModal()">+ Submit Leave Application</button>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Manager Action</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No leave requests logged.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openSubmitLeaveModal() {
    const employees = window.PayrollApp.state.employees || [];
    const select = document.getElementById('leave-form-emp');
    if (!select) return;

    select.innerHTML = employees.map(e => 
      `<option value="${e.id}">${e.name} (${e.id} • ${e.department})</option>`
    ).join('');

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('leave-form-start').value = today;
    document.getElementById('leave-form-end').value = today;
    document.getElementById('leave-form-reason').value = '';

    document.getElementById('leave-modal').classList.add('active');
  },

  closeLeaveModal() {
    document.getElementById('leave-modal').classList.remove('active');
  },

  saveLeaveForm(e) {
    e.preventDefault();
    const empId = document.getElementById('leave-form-emp').value;
    const leaveType = document.getElementById('leave-form-type').value;
    const startDate = document.getElementById('leave-form-start').value;
    const endDate = document.getElementById('leave-form-end').value;
    const reason = document.getElementById('leave-form-reason').value.trim();

    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (!emp) return;

    // Calculate calendar days
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const timeDiff = Math.max(0, d2.getTime() - d1.getTime());
    const days = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

    const newReq = {
      id: `LR10${window.PayrollApp.state.leaveRequests.length + 1}`,
      empId: emp.id,
      empName: emp.name,
      leaveType: leaveType,
      startDate: startDate,
      endDate: endDate,
      days: days,
      reason: reason,
      status: 'Pending'
    };

    window.PayrollApp.state.leaveRequests.unshift(newReq);
    window.PayrollApp.addAuditLog('Leave Submitted', `Submitted ${leaveType} (${days} days) for ${emp.name}`);
    window.PayrollApp.saveState();

    window.PayrollApp.showToast(`Leave application submitted for ${emp.name}!`);
    this.closeLeaveModal();
    this.renderLeaveAttendance();
  },

  /**
   * DIRECT STATE MUTATION: Syncing Leave Approval with UC1 Loss of Pay (LOP) Salary Deductions
   */
  updateLeaveStatus(reqId, newStatus) {
    const req = window.PayrollApp.state.leaveRequests.find(r => r.id === reqId);
    if (!req) return;

    req.status = newStatus;

    if (newStatus === 'Approved') {
      const emp = window.PayrollApp.state.employees.find(e => e.id === req.empId);
      if (emp) {
        if (req.leaveType.includes('Unpaid')) {
          emp.unpaidLeaves = (emp.unpaidLeaves || 0) + req.days;
          window.PayrollApp.showToast(`Approved unpaid leave! Added ${req.days} day(s) Loss of Pay (LOP) deduction for ${emp.name}.`);
        } else {
          emp.leavesTaken = (emp.leavesTaken || 0) + req.days;
          window.PayrollApp.showToast(`Approved paid leave for ${emp.name}!`);
        }
      }
    } else {
      window.PayrollApp.showToast(`Leave request ${reqId} marked as ${newStatus}`);
    }

    window.PayrollApp.addAuditLog('Leave Status Updated', `Marked leave request ${reqId} for ${req.empName} as ${newStatus}`);
    window.PayrollApp.saveState();
    this.renderLeaveAttendance();
  },

  /* =========================================================
     UC6: MANAGE USER ROLES AND ACCESS PERMISSIONS
     ========================================================= */
  renderUserRoles() {
    const container = document.getElementById('uc6-user-roles');
    if (!container) return;

    const employees = window.PayrollApp.state.employees || [];
    let auditLogs = window.PayrollApp.state.roleAuditLogs || [];

    if (this.searchQueryUC6) {
      auditLogs = auditLogs.filter(log => 
        log.action.toLowerCase().includes(this.searchQueryUC6.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(this.searchQueryUC6.toLowerCase()) ||
        log.details.toLowerCase().includes(this.searchQueryUC6.toLowerCase())
      );
    }

    const canManage = window.PayrollApp.canPerform('canManageRoles');

    const roleRows = employees.map(emp => `
      <tr>
        <td><strong>${emp.id}</strong></td>
        <td>${emp.name}</td>
        <td><span class="badge badge-info">${emp.role}</span></td>
        <td>
          <select class="form-control" style="width: auto; padding: 0.35rem 0.5rem;" ${!canManage ? 'disabled title="Requires System Admin clearance"' : ''} onchange="BalamuruganModules.changeUserRole('${emp.id}', this.value)">
            <option value="Employee" ${emp.role === 'Employee' ? 'selected' : ''}>Employee</option>
            <option value="Manager" ${emp.role === 'Manager' ? 'selected' : ''}>Manager</option>
            <option value="HR Administrator" ${emp.role === 'HR Administrator' ? 'selected' : ''}>HR Administrator</option>
            <option value="System Administrator" ${emp.role === 'System Administrator' ? 'selected' : ''}>System Administrator</option>
          </select>
        </td>
        <td><span class="badge badge-success">Active</span></td>
      </tr>
    `).join('');

    const logRows = auditLogs.map(log => `
      <tr>
        <td style="font-size: 0.75rem; color: var(--text-muted);">${log.timestamp}</td>
        <td><strong>${log.action}</strong></td>
        <td>${log.performedBy}</td>
        <td style="font-size: 0.85rem;">${log.details}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">
            <span style="color: var(--accent-rose);">🔐 Use Case 6:</span> Manage User Roles & Security Audit Logs
          </div>
          <div>
            <span class="badge badge-info">Author: Balamurugan D (24MIS0096)</span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Control system access permissions for Employees, Managers, HR Administrators, and System Administrators with full security audit logging.
        </p>

        <h4 style="margin-bottom: 0.75rem; color: var(--accent-blue);">System Access Permission Matrix (RBAC Simulator Configuration)</h4>
        <div class="table-responsive" style="margin-bottom: 1.5rem;">
          <table class="custom-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Module / Feature</th>
                <th>Employee</th>
                <th>Manager</th>
                <th>HR Administrator</th>
                <th>System Administrator</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>UC1: Calculate Salary</strong></td>
                <td><span style="color: var(--accent-rose);">❌ No Access</span></td>
                <td><span style="color: var(--accent-emerald);">👁️ Read-only</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Full Control</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Full Control</span></td>
              </tr>
              <tr>
                <td><strong>UC4: Master Data & Salary Structure</strong></td>
                <td><span style="color: var(--accent-rose);">❌ No Access</span></td>
                <td><span style="color: var(--accent-rose);">❌ No Access</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Full Control</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Full Control</span></td>
              </tr>
              <tr>
                <td><strong>UC5: Statutory Tax Rules</strong></td>
                <td><span style="color: var(--accent-rose);">❌ No Access</span></td>
                <td><span style="color: var(--accent-emerald);">👁️ View Simulator</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Full Control</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Full Control</span></td>
              </tr>
              <tr>
                <td><strong>UC2: Generate Payslips</strong></td>
                <td><span style="color: var(--accent-emerald);">👁️ Own Payslip</span></td>
                <td><span style="color: var(--accent-emerald);">👁️ Team Payslips</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Bulk Export</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Bulk Export</span></td>
              </tr>
              <tr>
                <td><strong>UC3: Leave & Attendance</strong></td>
                <td><span style="color: var(--accent-emerald);">📝 Submit Request</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Approve/Reject</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Approve/Reject</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Full Admin</span></td>
              </tr>
              <tr>
                <td><strong>UC6: User Roles & Security Audit</strong></td>
                <td><span style="color: var(--accent-rose);">❌ No Access</span></td>
                <td><span style="color: var(--accent-rose);">❌ No Access</span></td>
                <td><span style="color: var(--accent-rose);">❌ No Access</span></td>
                <td><span style="color: var(--accent-emerald);">✅ Manage Roles & Audit</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style="margin-bottom: 1rem;">Employee System Role Assignment</h3>
        <div class="table-responsive" style="margin-bottom: 2rem;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Current Role</th>
                <th>Modify Role Assignment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${roleRows}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
          <h3>Security & Audit Event Logs</h3>
          <input type="text" class="form-control" style="max-width: 300px;" 
            placeholder="🔍 Filter audit logs..." 
            value="${this.searchQueryUC6}" 
            oninput="BalamuruganModules.handleSearchUC6(this.value)" />
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Event Description</th>
              </tr>
            </thead>
            <tbody>
              ${logRows.length > 0 ? logRows : `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No audit logs found matching filter.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  handleSearchUC6(val) {
    this.searchQueryUC6 = val;
    this.renderUserRoles();
  },

  changeUserRole(empId, newRole) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (emp) {
      const oldRole = emp.role;
      emp.role = newRole;

      window.PayrollApp.addAuditLog('Role Assignment Updated', `Changed assigned system role of ${emp.name} from ${oldRole} to ${newRole}`);
      window.PayrollApp.saveState();
      
      window.PayrollApp.showToast(`Updated role for ${emp.name} to ${newRole}`);
      this.renderUserRoles();
    }
  }
};
