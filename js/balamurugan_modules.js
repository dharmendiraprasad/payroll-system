/**
 * Module created by: Balamurugan D (24MIS0096)
 * Contains functionalities for:
 * - Use Case 2: Generate Payslip
 * - Use Case 3: Manage Employee Leave and Attendance Deductions
 * - Use Case 6: Manage User Roles and Access Permissions
 */

window.BalamuruganModules = {
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

    const employees = window.PayrollApp.state.employees;

    const payslipCards = employees.map(emp => {
      const gross = emp.basicPay + emp.hra + emp.specialAllowance;
      const taxDeduction = Math.round(gross * 0.15 * 0.7);
      const unpaidDeduction = Math.round((gross / 30) * emp.unpaidLeaves);
      const totalDed = taxDeduction + emp.pfContribution + emp.insurance + unpaidDeduction;
      const netPay = gross - totalDed;

      return `
        <div class="card" style="background: rgba(30, 41, 59, 0.9);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <h4 style="font-size: 1.1rem; color: var(--text-main);">${emp.name}</h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${emp.id} • ${emp.rollNo}</span>
            </div>
            <span class="badge badge-success">Payslip Generated</span>
          </div>

          <div style="font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
            <div><strong>Department:</strong> ${emp.department}</div>
            <div><strong>Designation:</strong> ${emp.designation}</div>
            <div><strong>Pay Period:</strong> July 2026</div>
            <div style="color: var(--accent-emerald); font-weight: 700; margin-top: 0.5rem;">Net Pay: ₹${netPay.toLocaleString()}</div>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="BalamuruganModules.viewPayslipModal('${emp.id}')">
              👁️ View Payslip
            </button>
            <button class="btn btn-sm btn-secondary" onclick="BalamuruganModules.downloadPayslipPDF('${emp.name}')">
              📥 Print / PDF
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

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <label style="font-size: 0.85rem; color: var(--text-muted);">Filter Month:</label>
            <select class="form-control" style="width: auto; display: inline-block; margin-left: 0.5rem;">
              <option>July 2026</option>
              <option>June 2026</option>
            </select>
          </div>
          <button class="btn btn-success" onclick="BalamuruganModules.bulkExportPayslips()">
            📦 Bulk Export All Payslips (ZIP/PDF)
          </button>
        </div>

        <div class="grid-3">
          ${payslipCards}
        </div>
      </div>
    `;
  },

  viewPayslipModal(empId) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (!emp) return;

    const gross = emp.basicPay + emp.hra + emp.specialAllowance;
    const taxDeduction = Math.round(gross * 0.15 * 0.7);
    const unpaidDeduction = Math.round((gross / 30) * emp.unpaidLeaves);
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
            <p>Generated: 2026-07-29</p>
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
            <div class="payslip-row"><span>Unpaid Leave Deductions</span><span>₹${unpaidDeduction.toLocaleString()}</span></div>
            <div class="payslip-row" style="font-weight: bold; border-top: 1px solid #cbd5e1; margin-top: 0.5rem; padding-top: 0.5rem; color: #b91c1c;">
              <span>TOTAL DEDUCTIONS</span><span>₹${totalDed.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="payslip-summary">
          <span>NET AMOUNT PAYABLE:</span>
          <span style="color: #047857;">₹${netPay.toLocaleString()}</span>
        </div>

        <div style="margin-top: 1.5rem; text-align: center;">
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print Payslip Document</button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closePayslipModal() {
    document.getElementById('payslip-modal').classList.remove('active');
  },

  downloadPayslipPDF(empName) {
    window.PayrollApp.showToast(`Preparing official PDF payslip download for ${empName}...`);
  },

  bulkExportPayslips() {
    window.PayrollApp.showToast('Exported all monthly employee payslips to zip package!');
  },

  /* =========================================================
     UC3: MANAGE LEAVE AND ATTENDANCE DEDUCTIONS
     ========================================================= */
  renderLeaveAttendance() {
    const container = document.getElementById('uc3-leave-attendance');
    if (!container) return;

    const requests = window.PayrollApp.state.leaveRequests;

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
            <button class="btn btn-sm btn-success" onclick="BalamuruganModules.updateLeaveStatus('${req.id}', 'Approved')">Approve</button>
            <button class="btn btn-sm btn-danger" onclick="BalamuruganModules.updateLeaveStatus('${req.id}', 'Rejected')">Reject</button>
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
          Managers review employee leave requests, attendance exceptions, and calculate salary deductions for unpaid leave.
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3>Pending Leave Requests & Attendance Cutoff</h3>
          <button class="btn btn-primary" onclick="BalamuruganModules.submitNewLeaveModal()">+ Submit Leave Request</button>
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
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  updateLeaveStatus(reqId, status) {
    const req = window.PayrollApp.state.leaveRequests.find(r => r.id === reqId);
    if (req) {
      req.status = status;
      if (status === 'Approved' && req.leaveType.includes('Unpaid')) {
        const emp = window.PayrollApp.state.employees.find(e => e.id === req.empId);
        if (emp) emp.unpaidLeaves += req.days;
      }
      window.PayrollApp.showToast(`Leave request ${reqId} mark as ${status}`);
      this.renderLeaveAttendance();
    }
  },

  submitNewLeaveModal() {
    const empName = prompt("Enter Employee Name:", "Anita Sharma");
    if (!empName) return;
    const days = parseInt(prompt("Enter Number of Unpaid Leave Days:", "1")) || 1;

    const newReq = {
      id: `LR10${window.PayrollApp.state.leaveRequests.length + 1}`,
      empId: 'EMP003',
      empName: empName,
      leaveType: 'Unpaid Leave',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      days: days,
      reason: 'Personal leave',
      status: 'Pending'
    };

    window.PayrollApp.state.leaveRequests.push(newReq);
    window.PayrollApp.showToast('New leave request logged for manager review!');
    this.renderLeaveAttendance();
  },

  /* =========================================================
     UC6: MANAGE USER ROLES AND ACCESS PERMISSIONS
     ========================================================= */
  renderUserRoles() {
    const container = document.getElementById('uc6-user-roles');
    if (!container) return;

    const employees = window.PayrollApp.state.employees;
    const auditLogs = window.PayrollApp.state.roleAuditLogs;

    const roleRows = employees.map(emp => `
      <tr>
        <td><strong>${emp.id}</strong></td>
        <td>${emp.name}</td>
        <td><span class="badge badge-info">${emp.role}</span></td>
        <td>
          <select class="form-control" style="width: auto; padding: 0.35rem 0.5rem;" onchange="BalamuruganModules.changeUserRole('${emp.id}', this.value)">
            <option value="Employee" ${emp.role === 'Employee' ? 'selected' : ''}>Employee</option>
            <option value="Manager" ${emp.role === 'Manager' ? 'selected' : ''}>Manager</option>
            <option value="HR Administrator" ${emp.role === 'HR Administrator' ? 'selected' : ''}>HR Administrator</option>
            <option value="System Administrator" ${emp.role === 'System Administrator' ? 'selected' : ''}>System Administrator</option>
          </select>
        </td>
        <td><span class="badge badge-success">Active Permissions</span></td>
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
            <span style="color: var(--accent-rose);">🔐 Use Case 6:</span> Manage User Roles & Access Permissions
          </div>
          <div>
            <span class="badge badge-info">Author: Balamurugan D (24MIS0096)</span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Control system access permissions for Employees, Managers, HR Administrators, and System Administrators with full security audit logging.
        </p>

        <h3 style="margin-bottom: 1rem;">Role Assignment Matrix</h3>
        <div class="table-responsive" style="margin-bottom: 2rem;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Assigned Role</th>
                <th>Modify Access Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${roleRows}
            </tbody>
          </table>
        </div>

        <h3 style="margin-bottom: 1rem;">Role Change Audit Logs</h3>
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
              ${logRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  changeUserRole(empId, newRole) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (emp) {
      const oldRole = emp.role;
      emp.role = newRole;

      window.PayrollApp.state.roleAuditLogs.unshift({
        id: `LOG00${window.PayrollApp.state.roleAuditLogs.length + 1}`,
        timestamp: new Date().toLocaleString(),
        action: 'Role Updated',
        performedBy: 'System Administrator',
        details: `Changed role of ${emp.name} from ${oldRole} to ${newRole}`
      });

      window.PayrollApp.showToast(`Updated role for ${emp.name} to ${newRole}`);
      this.renderUserRoles();
    }
  }
};
