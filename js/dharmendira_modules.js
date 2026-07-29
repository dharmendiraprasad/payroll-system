/**
 * Module created by: Dharmendira Prasad P (24MIS0073)
 * Contains functionalities for:
 * - Use Case 1: Calculate Employee Salary
 * - Use Case 4: Maintain Employee Master Data and Salary Structure
 * - Use Case 5: Compute Statutory Deductions and Tax
 */

window.DharmendiraModules = {
  searchQueryUC1: '',
  filterDeptUC1: 'All',

  searchQueryUC4: '',
  filterDeptUC4: 'All',

  render(activeTab) {
    if (activeTab === 'uc1-calculate-salary') {
      this.renderCalculateSalary();
    } else if (activeTab === 'uc4-master-data') {
      this.renderMasterData();
    } else if (activeTab === 'uc5-statutory-tax') {
      this.renderStatutoryTax();
    }
  },

  /* =========================================================
     UC1: CALCULATE EMPLOYEE SALARY
     ========================================================= */
  renderCalculateSalary() {
    const container = document.getElementById('uc1-calculate-salary');
    if (!container) return;

    // Single Source of Truth State
    const employees = window.PayrollApp.state.employees || [];

    // Filter employees based on search & dept
    const filteredEmployees = employees.filter(emp => {
      const matchesSearch = !this.searchQueryUC1 || 
        emp.name.toLowerCase().includes(this.searchQueryUC1.toLowerCase()) ||
        emp.id.toLowerCase().includes(this.searchQueryUC1.toLowerCase()) ||
        emp.rollNo.toLowerCase().includes(this.searchQueryUC1.toLowerCase());
      
      const matchesDept = this.filterDeptUC1 === 'All' || emp.department === this.filterDeptUC1;
      return matchesSearch && matchesDept;
    });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const calculatedRows = filteredEmployees.map(emp => {
      const gross = emp.basicPay + emp.hra + emp.specialAllowance;
      
      // Tax calculation simulation (15% new regime, 20% old regime)
      const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
      const taxDeduction = Math.round(gross * taxRate * 0.7); 
      const pfDeduction = emp.pfContribution;
      const insuranceDeduction = emp.insurance;
      
      // Loss of Pay (LOP) / Unpaid leave deduction computation: per day = gross / 30
      const unpaidDeduction = Math.round((gross / 30) * (emp.unpaidLeaves || 0));
      
      const totDed = taxDeduction + pfDeduction + insuranceDeduction + unpaidDeduction;
      const netPay = gross - totDed;

      totalGross += gross;
      totalDeductions += totDed;
      totalNet += netPay;

      const canRun = window.PayrollApp.canPerform('canRunPayroll');

      return `
        <tr>
          <td><strong>${emp.id}</strong></td>
          <td>
            <div style="font-weight: 600;">${emp.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.department} • ${emp.designation}</div>
          </td>
          <td>₹${gross.toLocaleString()}</td>
          <td style="color: var(--accent-rose);">
            ₹${totDed.toLocaleString()}
            ${emp.unpaidLeaves > 0 ? `<div style="font-size: 0.7rem; color: var(--accent-amber);">Includes LOP (${emp.unpaidLeaves}d)</div>` : ''}
          </td>
          <td style="color: var(--accent-emerald); font-weight: 700;">₹${netPay.toLocaleString()}</td>
          <td>
            <span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}">Calculated</span>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="DharmendiraModules.openSalaryModal('${emp.id}')">
              🔍 Inspect Breakdown
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const departments = Array.from(new Set(employees.map(e => e.department)));
    const deptOptions = ['All', ...departments].map(d => 
      `<option value="${d}" ${this.filterDeptUC1 === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    const canRun = window.PayrollApp.canPerform('canRunPayroll');

    container.innerHTML = `
      <div class="card mb-4" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div class="card-title">
            <span style="color: var(--accent-blue);">⚡ Use Case 1:</span> Calculate Employee Salary
          </div>
          <div>
            <span class="badge badge-info">Author: Dharmendira Prasad P (24MIS0073)</span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Select payroll period and initiate automated salary calculations based on basic pay, allowances, loss of pay (LOP) leave deductions, and statutory tax rules.
        </p>

        <div class="form-row" style="align-items: flex-end; margin-bottom: 1.5rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label>Select Payroll Period</label>
            <select id="payroll-period-select" class="form-control">
              <option value="August 2026">August 2026 (Current Cycle)</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <button class="btn btn-primary" ${!canRun ? 'disabled title="Requires HR Admin permission"' : ''} onclick="DharmendiraModules.runBatchPayrollCalculation()">
              🔄 Run Batch Computation
            </button>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <button class="btn btn-success" ${!canRun ? 'disabled title="Requires HR Admin permission"' : ''} onclick="DharmendiraModules.approveBatchPayroll()">
              ✅ Approve Payroll Run
            </button>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <button class="btn btn-secondary" onclick="DharmendiraModules.exportSalaryRegister()">
              📥 Export Register (CSV)
            </button>
          </div>
        </div>

        <div class="grid-3" style="margin-bottom: 1.5rem;">
          <div class="stat-card">
            <span class="stat-label">Total Projected Gross Salary</span>
            <span class="stat-value" style="color: var(--accent-blue);">₹${totalGross.toLocaleString()}</span>
            <span class="stat-sub">Before statutory deductions</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Statutory & LOP Deductions</span>
            <span class="stat-value" style="color: var(--accent-rose);">₹${totalDeductions.toLocaleString()}</span>
            <span class="stat-sub">Tax + PF + Insurance + LOP</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Net Salary Payable</span>
            <span class="stat-value" style="color: var(--accent-emerald);">₹${totalNet.toLocaleString()}</span>
            <span class="stat-sub">${filteredEmployees.length} Active Records</span>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <input type="text" class="form-control" placeholder="🔍 Search employee name, ID, or roll number..." 
              value="${this.searchQueryUC1}" oninput="DharmendiraModules.handleSearchUC1(this.value)" />
          </div>
          <div style="width: 200px;">
            <select class="form-control" onchange="DharmendiraModules.handleDeptFilterUC1(this.value)">
              ${deptOptions}
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Details</th>
                <th>Gross Pay</th>
                <th>Total Deductions</th>
                <th>Net Pay</th>
                <th>Calculation Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${calculatedRows.length > 0 ? calculatedRows : `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No employee records found matching filter.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  handleSearchUC1(val) {
    this.searchQueryUC1 = val;
    this.renderCalculateSalary();
  },

  handleDeptFilterUC1(val) {
    this.filterDeptUC1 = val;
    this.renderCalculateSalary();
  },

  runBatchPayrollCalculation() {
    window.PayrollApp.addAuditLog('Batch Salary Calculation', 'Executed automated salary recalculation for all active employees.');
    window.PayrollApp.showToast('Initiated automated batch calculation for all active employees!');
    this.renderCalculateSalary();
  },

  approveBatchPayroll() {
    const period = document.getElementById('payroll-period-select') ? document.getElementById('payroll-period-select').value : 'August 2026';
    const employees = window.PayrollApp.state.employees || [];
    
    let totalGross = 0;
    let totalNet = 0;
    
    employees.forEach(emp => {
      const gross = emp.basicPay + emp.hra + emp.specialAllowance;
      const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
      const tax = Math.round(gross * taxRate * 0.7);
      const unpaid = Math.round((gross / 30) * (emp.unpaidLeaves || 0));
      const totDed = tax + emp.pfContribution + emp.insurance + unpaid;
      totalGross += gross;
      totalNet += (gross - totDed);
    });

    const newRun = {
      id: `PR-${Date.now().toString().slice(-6)}`,
      month: period,
      processedDate: new Date().toISOString().split('T')[0],
      totalEmployees: employees.length,
      totalGrossPay: totalGross,
      totalDeductions: totalGross - totalNet,
      totalNetPay: totalNet,
      status: 'Approved'
    };

    window.PayrollApp.state.payrollRuns.unshift(newRun);
    window.PayrollApp.addAuditLog('Batch Payroll Approved', `Approved payroll run for ${period} totaling ₹${totalNet.toLocaleString()} Net Pay.`);
    window.PayrollApp.saveState();

    window.PayrollApp.showToast(`Batch payroll for ${period} approved successfully!`);
    this.renderCalculateSalary();
  },

  openSalaryModal(empId) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (!emp) return;

    const gross = emp.basicPay + emp.hra + emp.specialAllowance;
    const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
    const taxDeduction = Math.round(gross * taxRate * 0.7);
    const pfDeduction = emp.pfContribution;
    const insuranceDeduction = emp.insurance;
    const unpaidDeduction = Math.round((gross / 30) * (emp.unpaidLeaves || 0));
    const totalDed = taxDeduction + pfDeduction + insuranceDeduction + unpaidDeduction;
    const netPay = gross - totalDed;

    const modalBody = document.getElementById('salary-modal-body');
    modalBody.innerHTML = `
      <h3 style="color: var(--accent-blue); margin-bottom: 0.5rem;">Itemized Salary Computation Breakdown</h3>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
        Employee: <strong>${emp.name}</strong> (${emp.id} • ${emp.rollNo}) | Dept: ${emp.department}
      </div>

      <div class="grid-2" style="margin-bottom: 1.5rem;">
        <div class="card" style="background: rgba(15, 23, 42, 0.6); padding: 1rem;">
          <h4 style="color: var(--accent-emerald); margin-bottom: 0.75rem; font-size: 0.95rem;">➕ Earnings Component</h4>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0;"><span>Basic Pay:</span><strong>₹${emp.basicPay.toLocaleString()}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0;"><span>House Rent Allowance (HRA):</span><strong>₹${emp.hra.toLocaleString()}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0;"><span>Special Allowance:</span><strong>₹${emp.specialAllowance.toLocaleString()}</strong></div>
          <div style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem; display: flex; justify-content: space-between; font-weight: bold; color: var(--accent-emerald);">
            <span>Gross Earnings:</span><span>₹${gross.toLocaleString()}</span>
          </div>
        </div>

        <div class="card" style="background: rgba(15, 23, 42, 0.6); padding: 1rem;">
          <h4 style="color: var(--accent-rose); margin-bottom: 0.75rem; font-size: 0.95rem;">➖ Deductions & Statutory</h4>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0;"><span>Income Tax TDS (${emp.taxSlab}):</span><strong>₹${taxDeduction.toLocaleString()}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0;"><span>Provident Fund (PF):</span><strong>₹${pfDeduction.toLocaleString()}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0;"><span>Medical Insurance:</span><strong>₹${insuranceDeduction.toLocaleString()}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0; color: var(--accent-amber);">
            <span>Loss of Pay (${emp.unpaidLeaves || 0} days):</span><strong>₹${unpaidDeduction.toLocaleString()}</strong>
          </div>
          <div style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem; display: flex; justify-content: space-between; font-weight: bold; color: var(--accent-rose);">
            <span>Total Deductions:</span><span>₹${totalDed.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.1)); border-color: rgba(16, 185, 129, 0.4); text-align: center; padding: 1.25rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted);">NET SALARY DISBURSED TO BANK ACCOUNT</span>
        <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-emerald); margin: 0.25rem 0;">₹${netPay.toLocaleString()}</div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">${emp.bankName} • ${emp.bankAccount}</span>
      </div>
    `;

    document.getElementById('salary-modal').classList.add('active');
  },

  closeSalaryModal() {
    document.getElementById('salary-modal').classList.remove('active');
  },

  exportSalaryRegister() {
    const employees = window.PayrollApp.state.employees || [];
    
    // Header row
    const rows = [
      ['Emp ID', 'Employee Name', 'Roll Number', 'Department', 'Designation', 'Basic Pay', 'HRA', 'Special Allowance', 'Gross Pay', 'TDS Tax', 'PF', 'Insurance', 'LOP Deductions', 'Total Deductions', 'Net Pay', 'Bank Name', 'Account Number']
    ];

    employees.forEach(emp => {
      const gross = emp.basicPay + emp.hra + emp.specialAllowance;
      const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
      const taxDeduction = Math.round(gross * taxRate * 0.7);
      const pfDeduction = emp.pfContribution;
      const insuranceDeduction = emp.insurance;
      const unpaidDeduction = Math.round((gross / 30) * (emp.unpaidLeaves || 0));
      const totDed = taxDeduction + pfDeduction + insuranceDeduction + unpaidDeduction;
      const netPay = gross - totDed;

      rows.push([
        emp.id,
        emp.name,
        emp.rollNo,
        emp.department,
        emp.designation,
        emp.basicPay,
        emp.hra,
        emp.specialAllowance,
        gross,
        taxDeduction,
        pfDeduction,
        insuranceDeduction,
        unpaidDeduction,
        totDed,
        netPay,
        emp.bankName,
        emp.bankAccount
      ]);
    });

    // Use RFC 4180 escaper from PayrollApp
    const csvContent = rows.map(r => window.PayrollApp.toCSVRow(r)).join('\n');
    window.PayrollApp.downloadCSV(`Payroll_Salary_Register_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  },

  /* =========================================================
     UC4: MAINTAIN EMPLOYEE MASTER DATA AND SALARY STRUCTURE
     ========================================================= */
  renderMasterData() {
    const container = document.getElementById('uc4-master-data');
    if (!container) return;

    const employees = window.PayrollApp.state.employees || [];

    const filteredEmployees = employees.filter(emp => {
      const matchesSearch = !this.searchQueryUC4 || 
        emp.name.toLowerCase().includes(this.searchQueryUC4.toLowerCase()) ||
        emp.id.toLowerCase().includes(this.searchQueryUC4.toLowerCase()) ||
        emp.rollNo.toLowerCase().includes(this.searchQueryUC4.toLowerCase());
      
      const matchesDept = this.filterDeptUC4 === 'All' || emp.department === this.filterDeptUC4;
      return matchesSearch && matchesDept;
    });

    const canEdit = window.PayrollApp.canPerform('canEditMasterData');

    const empRows = filteredEmployees.map(emp => `
      <tr>
        <td><strong>${emp.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${emp.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.rollNo}</div>
        </td>
        <td>${emp.department}</td>
        <td>${emp.designation}</td>
        <td>₹${(emp.basicPay + emp.hra + emp.specialAllowance).toLocaleString()} / mo</td>
        <td><span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-danger'}">${emp.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" ${!canEdit ? 'disabled title="Requires HR Admin permission"' : ''} onclick="DharmendiraModules.openEditEmployeeModal('${emp.id}')">
            ✏️ Edit
          </button>
          <button class="btn btn-sm ${emp.status === 'Active' ? 'btn-danger' : 'btn-success'}" ${!canEdit ? 'disabled title="Requires HR Admin permission"' : ''} onclick="DharmendiraModules.toggleEmployeeStatus('${emp.id}')">
            ${emp.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');

    const departments = Array.from(new Set(employees.map(e => e.department)));
    const deptOptions = ['All', ...departments].map(d => 
      `<option value="${d}" ${this.filterDeptUC4 === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span style="color: var(--accent-indigo);">📂 Use Case 4:</span> Maintain Employee Master Data & Salary Structure
          </div>
          <div>
            <span class="badge badge-info">Author: Dharmendira Prasad P (24MIS0073)</span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Create and maintain employee master records, employment status, bank details, and salary components (basic pay, HRA, special allowances).
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <h3>Active Employee Master Records (${employees.length} Total)</h3>
          <button class="btn btn-primary" ${!canEdit ? 'disabled title="Requires HR Admin permission"' : ''} onclick="DharmendiraModules.openAddEmployeeModal()">
            + Add New Employee Record
          </button>
        </div>

        <!-- Search & Filter Controls -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <input type="text" class="form-control" placeholder="🔍 Search employee name, ID, or roll number..." 
              value="${this.searchQueryUC4}" oninput="DharmendiraModules.handleSearchUC4(this.value)" />
          </div>
          <div style="width: 200px;">
            <select class="form-control" onchange="DharmendiraModules.handleDeptFilterUC4(this.value)">
              ${deptOptions}
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name & Roll</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Gross Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${empRows.length > 0 ? empRows : `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No employee records found matching filter.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  handleSearchUC4(val) {
    this.searchQueryUC4 = val;
    this.renderMasterData();
  },

  handleDeptFilterUC4(val) {
    this.filterDeptUC4 = val;
    this.renderMasterData();
  },

  openAddEmployeeModal() {
    const form = document.getElementById('employee-form');
    if (!form) return;
    form.reset();
    document.getElementById('emp-modal-title').textContent = 'Add New Employee Master Record';
    document.getElementById('emp-form-id').value = '';
    
    document.getElementById('employee-modal').classList.add('active');
  },

  openEditEmployeeModal(empId) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById('emp-modal-title').textContent = `Edit Employee Structure: ${emp.name}`;
    document.getElementById('emp-form-id').value = emp.id;
    document.getElementById('emp-form-name').value = emp.name;
    document.getElementById('emp-form-roll').value = emp.rollNo;
    document.getElementById('emp-form-dept').value = emp.department;
    document.getElementById('emp-form-designation').value = emp.designation;
    document.getElementById('emp-form-basic').value = emp.basicPay;
    document.getElementById('emp-form-allowance').value = emp.specialAllowance;
    document.getElementById('emp-form-bank').value = emp.bankName;
    document.getElementById('emp-form-account').value = emp.bankAccount;
    document.getElementById('emp-form-tax').value = emp.taxSlab;
    document.getElementById('emp-form-role').value = emp.role || 'Employee';

    document.getElementById('employee-modal').classList.add('active');
  },

  closeEmployeeModal() {
    document.getElementById('employee-modal').classList.remove('active');
  },

  saveEmployeeForm(e) {
    e.preventDefault();
    const id = document.getElementById('emp-form-id').value;
    const name = document.getElementById('emp-form-name').value.trim();
    const rollNo = document.getElementById('emp-form-roll').value.trim();
    const department = document.getElementById('emp-form-dept').value;
    const designation = document.getElementById('emp-form-designation').value.trim();
    const basicPay = parseInt(document.getElementById('emp-form-basic').value) || 50000;
    const specialAllowance = parseInt(document.getElementById('emp-form-allowance').value) || 0;
    const bankName = document.getElementById('emp-form-bank').value.trim();
    const bankAccount = document.getElementById('emp-form-account').value.trim();
    const taxSlab = document.getElementById('emp-form-tax').value;
    const role = document.getElementById('emp-form-role').value;

    const hra = Math.round(basicPay * 0.4);
    const pfContribution = Math.round(basicPay * 0.05);

    if (id) {
      // Edit existing
      const emp = window.PayrollApp.state.employees.find(e => e.id === id);
      if (emp) {
        emp.name = name;
        emp.rollNo = rollNo;
        emp.department = department;
        emp.designation = designation;
        emp.basicPay = basicPay;
        emp.hra = hra;
        emp.specialAllowance = specialAllowance;
        emp.bankName = bankName;
        emp.bankAccount = bankAccount;
        emp.taxSlab = taxSlab;
        emp.role = role;
        emp.pfContribution = pfContribution;

        window.PayrollApp.addAuditLog('Employee Updated', `Updated master data for employee ${name} (${id})`);
        window.PayrollApp.showToast(`Employee record for ${name} updated!`);
      }
    } else {
      // Add new
      const newId = `EMP00${window.PayrollApp.state.employees.length + 1}`;
      const newEmp = {
        id: newId,
        name: name,
        rollNo: rollNo,
        department: department,
        designation: designation,
        role: role,
        basicPay: basicPay,
        hra: hra,
        specialAllowance: specialAllowance,
        bankAccount: bankAccount,
        bankName: bankName,
        status: 'Active',
        taxSlab: taxSlab,
        pfContribution: pfContribution,
        insurance: 1500,
        leavesTaken: 0,
        leaveQuota: 18,
        unpaidLeaves: 0
      };

      window.PayrollApp.state.employees.push(newEmp);
      window.PayrollApp.addAuditLog('Employee Created', `Added new employee master record ${name} (${newId})`);
      window.PayrollApp.showToast(`Added new employee ${name} (${newId})`);
    }

    window.PayrollApp.saveState();
    this.closeEmployeeModal();
    this.renderMasterData();
  },

  toggleEmployeeStatus(empId) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (emp) {
      emp.status = emp.status === 'Active' ? 'Inactive' : 'Active';
      window.PayrollApp.addAuditLog('Employee Status Toggled', `Changed status of ${emp.name} to ${emp.status}`);
      window.PayrollApp.saveState();
      window.PayrollApp.showToast(`Updated status of ${emp.name} to ${emp.status}`);
      this.renderMasterData();
    }
  },

  /* =========================================================
     UC5: COMPUTE STATUTORY DEDUCTIONS AND TAX
     ========================================================= */
  renderStatutoryTax() {
    const container = document.getElementById('uc5-statutory-tax');
    if (!container) return;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span style="color: var(--accent-purple);">🏛️ Use Case 5:</span> Compute Statutory Deductions & Tax Slabs
          </div>
          <div>
            <span class="badge badge-info">Author: Dharmendira Prasad P (24MIS0073)</span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Configure statutory income tax slabs, Provident Fund (PF) rules, and employee insurance deductions per financial regulations.
        </p>

        <div class="grid-2" style="margin-bottom: 1.5rem;">
          <div class="card" style="background: rgba(15, 23, 42, 0.5);">
            <h4 style="margin-bottom: 1rem; color: var(--accent-blue);">Income Tax Slabs Configuration (FY 2026-27)</h4>
            <ul style="line-height: 1.8; font-size: 0.875rem; color: var(--text-muted); padding-left: 1.25rem;">
              <li><strong>Up to ₹3,00,000:</strong> 0% Tax (Exempt)</li>
              <li><strong>₹3,00,001 - ₹6,00,000:</strong> 5% Tax</li>
              <li><strong>₹6,00,001 - ₹9,00,000:</strong> 10% Tax</li>
              <li><strong>₹9,00,001 - ₹12,00,000:</strong> 15% Tax</li>
              <li><strong>Above ₹12,00,000:</strong> 20% - 30% Tax Slabs</li>
            </ul>
          </div>

          <div class="card" style="background: rgba(15, 23, 42, 0.5);">
            <h4 style="margin-bottom: 1rem; color: var(--accent-emerald);">Statutory Provident Fund & Benefits Policy</h4>
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Employee PF Contribution Rate</label>
              <input type="text" class="form-control" value="12% of Basic Pay (or 5% total gross)" readonly />
            </div>
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Employer PF Matching Rate</label>
              <input type="text" class="form-control" value="12% of Basic Pay" readonly />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>Medical Insurance Deduction Policy</label>
              <input type="text" class="form-control" value="Fixed ₹1,000 - ₹1,500 based on tier" readonly />
            </div>
          </div>
        </div>

        <h3 style="margin-bottom: 0.5rem;">Live Old vs. New Tax Regime Statutory Simulator</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">Compare tax liability and net take-home salary across tax regimes:</p>
        
        <div class="form-row" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label>Monthly Gross Salary (₹)</label>
            <input type="number" id="sim-gross-salary" class="form-control" value="100000" min="10000" step="5000" />
          </div>
          <div class="form-group" style="display: flex; align-items: flex-end;">
            <button class="btn btn-primary" onclick="DharmendiraModules.calculateSimulatedTax()">
              ⚡ Compute Comparative Breakdown
            </button>
          </div>
        </div>

        <div id="sim-tax-result" class="card" style="display: none; background: rgba(56, 189, 248, 0.08); border-color: rgba(56, 189, 248, 0.3);">
          <!-- Results injected via JS -->
        </div>
      </div>
    `;
    this.calculateSimulatedTax();
  },

  calculateSimulatedTax() {
    const input = document.getElementById('sim-gross-salary');
    if (!input) return;
    const gross = parseFloat(input.value) || 0;
    
    // New Tax Regime (15% effective on taxable)
    const newTax = Math.round(gross * 0.15 * 0.7);
    const newPf = Math.round(gross * 0.05);
    const newIns = 1500;
    const newTotalDed = newTax + newPf + newIns;
    const newNet = gross - newTotalDed;

    // Old Tax Regime (20% effective on taxable)
    const oldTax = Math.round(gross * 0.20 * 0.7);
    const oldPf = Math.round(gross * 0.05);
    const oldIns = 1500;
    const oldTotalDed = oldTax + oldPf + oldIns;
    const oldNet = gross - oldTotalDed;

    const resDiv = document.getElementById('sim-tax-result');
    resDiv.style.display = 'block';
    resDiv.innerHTML = `
      <h4 style="color: var(--accent-blue); margin-bottom: 1rem;">Statutory Breakdown Comparison for Monthly Gross of ₹${gross.toLocaleString()}:</h4>
      <div class="grid-2">
        <div class="card" style="background: rgba(30, 41, 59, 0.8);">
          <h5 style="color: var(--accent-indigo); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem;">New Tax Regime (15% Tax Rate)</h5>
          <div style="font-size: 0.85rem; line-height: 1.8;">
            <div><strong>TDS Tax Deduction:</strong> ₹${newTax.toLocaleString()}</div>
            <div><strong>Provident Fund (PF):</strong> ₹${newPf.toLocaleString()}</div>
            <div><strong>Health Insurance:</strong> ₹${newIns.toLocaleString()}</div>
            <div style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem; color: var(--accent-emerald); font-weight: bold; font-size: 1rem;">
              Net Take Home: ₹${newNet.toLocaleString()} / month
            </div>
          </div>
        </div>

        <div class="card" style="background: rgba(30, 41, 59, 0.8);">
          <h5 style="color: var(--accent-amber); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem;">Old Tax Regime (20% Tax Rate)</h5>
          <div style="font-size: 0.85rem; line-height: 1.8;">
            <div><strong>TDS Tax Deduction:</strong> ₹${oldTax.toLocaleString()}</div>
            <div><strong>Provident Fund (PF):</strong> ₹${oldPf.toLocaleString()}</div>
            <div><strong>Health Insurance:</strong> ₹${oldIns.toLocaleString()}</div>
            <div style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem; color: var(--accent-amber); font-weight: bold; font-size: 1rem;">
              Net Take Home: ₹${oldNet.toLocaleString()} / month
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
