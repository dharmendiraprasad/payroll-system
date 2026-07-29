/**
 * Module created by: Dharmendira Prasad P (24MIS0073)
 * Contains functionalities for:
 * - Use Case 1: Calculate Employee Salary
 * - Use Case 4: Maintain Employee Master Data and Salary Structure
 * - Use Case 5: Compute Statutory Deductions and Tax
 */

window.DharmendiraModules = {
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

    const employees = window.PayrollApp.state.employees;
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const calculatedRows = employees.map(emp => {
      const gross = emp.basicPay + emp.hra + emp.specialAllowance;
      
      // Tax calculation simulation (15% new regime, 20% old regime)
      const taxRate = emp.taxSlab.includes('20%') ? 0.20 : 0.15;
      const taxDeduction = Math.round(gross * taxRate * 0.7); // simplified taxable base after standard deductions
      const pfDeduction = emp.pfContribution;
      const insuranceDeduction = emp.insurance;
      
      // Unpaid leave deduction computation: per day = gross / 30
      const unpaidDeduction = Math.round((gross / 30) * emp.unpaidLeaves);
      
      const totDed = taxDeduction + pfDeduction + insuranceDeduction + unpaidDeduction;
      const netPay = gross - totDed;

      totalGross += gross;
      totalDeductions += totDed;
      totalNet += netPay;

      return `
        <tr>
          <td><strong>${emp.id}</strong></td>
          <td>
            <div style="font-weight: 600;">${emp.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.department} • ${emp.designation}</div>
          </td>
          <td>₹${gross.toLocaleString()}</td>
          <td style="color: var(--accent-rose);">₹${totDed.toLocaleString()}</td>
          <td style="color: var(--accent-emerald); font-weight: 700;">₹${netPay.toLocaleString()}</td>
          <td><span class="badge badge-warning">Pending Review</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="DharmendiraModules.recalculateIndividual('${emp.id}')">
              Recalculate
            </button>
          </td>
        </tr>
      `;
    }).join('');

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
          Select payroll period and initiate automated salary calculations based on basic pay, allowances, attendance exceptions, and tax rules.
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
            <button class="btn btn-primary" onclick="DharmendiraModules.runBatchPayrollCalculation()">
              🔄 Run Batch Salary Computation
            </button>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <button class="btn btn-success" onclick="DharmendiraModules.approveBatchPayroll()">
              ✅ Approve Payroll Run
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
            <span class="stat-label">Total Statutory & Absence Deductions</span>
            <span class="stat-value" style="color: var(--accent-rose);">₹${totalDeductions.toLocaleString()}</span>
            <span class="stat-sub">Tax + PF + Insurance + Leave</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Net Salary Payable</span>
            <span class="stat-value" style="color: var(--accent-emerald);">₹${totalNet.toLocaleString()}</span>
            <span class="stat-sub">3 Active Employee Records</span>
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
              ${calculatedRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  runBatchPayrollCalculation() {
    window.PayrollApp.showToast('Initiated automated batch calculation for all active employees!');
    this.renderCalculateSalary();
  },

  approveBatchPayroll() {
    window.PayrollApp.showToast('Batch payroll approved successfully! Ready for payslip generation.');
  },

  recalculateIndividual(empId) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (emp) {
      window.PayrollApp.showToast(`Recalculated salary parameters for ${emp.name}`);
    }
  },

  /* =========================================================
     UC4: MAINTAIN EMPLOYEE MASTER DATA AND SALARY STRUCTURE
     ========================================================= */
  renderMasterData() {
    const container = document.getElementById('uc4-master-data');
    if (!container) return;

    const employees = window.PayrollApp.state.employees;

    const empRows = employees.map(emp => `
      <tr>
        <td><strong>${emp.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${emp.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.rollNo}</div>
        </td>
        <td>${emp.department}</td>
        <td>${emp.designation}</td>
        <td>₹${(emp.basicPay + emp.hra + emp.specialAllowance).toLocaleString()} / month</td>
        <td><span class="badge badge-success">${emp.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="DharmendiraModules.editEmployeeModal('${emp.id}')">✏️ Edit Structure</button>
        </td>
      </tr>
    `).join('');

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

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3>Active Employee Master Records</h3>
          <button class="btn btn-primary" onclick="DharmendiraModules.addNewEmployeeModal()">+ Add New Employee Record</button>
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
              ${empRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  addNewEmployeeModal() {
    const name = prompt("Enter New Employee Full Name:");
    if (!name) return;
    const basicPay = parseInt(prompt("Enter Monthly Basic Pay (₹):", "50000")) || 50000;
    
    const newEmp = {
      id: `EMP00${window.PayrollApp.state.employees.length + 1}`,
      name: name,
      rollNo: `24MIS00${Math.floor(100 + Math.random() * 900)}`,
      department: 'Software Engineering',
      designation: 'Software Developer',
      role: 'Employee',
      basicPay: basicPay,
      hra: Math.round(basicPay * 0.4),
      specialAllowance: 10000,
      bankAccount: `ACC${Math.floor(100000000 + Math.random() * 900000000)}`,
      bankName: 'HDFC Bank',
      status: 'Active',
      taxSlab: 'New Tax Regime (15%)',
      pfContribution: 3000,
      insurance: 1000,
      leavesTaken: 0,
      leaveQuota: 18,
      unpaidLeaves: 0
    };

    window.PayrollApp.state.employees.push(newEmp);
    window.PayrollApp.showToast(`Employee ${name} added successfully!`);
    this.renderMasterData();
  },

  editEmployeeModal(empId) {
    const emp = window.PayrollApp.state.employees.find(e => e.id === empId);
    if (!emp) return;

    const newBasic = prompt(`Update Basic Pay for ${emp.name} (Current: ₹${emp.basicPay}):`, emp.basicPay);
    if (newBasic !== null) {
      emp.basicPay = parseInt(newBasic) || emp.basicPay;
      emp.hra = Math.round(emp.basicPay * 0.4);
      window.PayrollApp.showToast(`Updated salary structure for ${emp.name}`);
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
            <span style="color: var(--accent-purple);">🏛️ Use Case 5:</span> Compute Statutory Deductions and Tax
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
              <li><strong>Up to ₹3,000,00:</strong> 0% Tax (Exempt)</li>
              <li><strong>₹3,00,001 - ₹6,00,000:</strong> 5% Tax</li>
              <li><strong>₹6,00,001 - ₹9,00,000:</strong> 10% Tax</li>
              <li><strong>₹9,00,001 - ₹12,00,000:</strong> 15% Tax</li>
              <li><strong>Above ₹12,00,000:</strong> 20% - 30% Tax Slabs</li>
            </ul>
          </div>

          <div class="card" style="background: rgba(15, 23, 42, 0.5);">
            <h4 style="margin-bottom: 1rem; color: var(--accent-emerald);">Statutory Provident Fund & Benefits</h4>
            <div class="form-group">
              <label>Employee PF Contribution Rate</label>
              <input type="text" class="form-control" value="12% of Basic Pay" readonly />
            </div>
            <div class="form-group">
              <label>Employer PF Matching Rate</label>
              <input type="text" class="form-control" value="12% of Basic Pay" readonly />
            </div>
            <div class="form-group">
              <label>Medical Insurance Deduction Policy</label>
              <input type="text" class="form-control" value="Fixed ₹1,000 - ₹1,500 based on tier" readonly />
            </div>
          </div>
        </div>

        <h3>Live Tax & Statutory Deduction Simulator</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Test statutory calculation rules for any salary scale:</p>
        
        <div class="form-row" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label>Monthly Gross Salary (₹)</label>
            <input type="number" id="sim-gross-salary" class="form-control" value="100000" />
          </div>
          <div class="form-group">
            <label>Tax Regime Selection</label>
            <select id="sim-tax-regime" class="form-control">
              <option value="15">New Tax Regime (Configured 15% Slab)</option>
              <option value="20">Old Tax Regime (Configured 20% Slab)</option>
            </select>
          </div>
          <div class="form-group" style="display: flex; align-items: flex-end;">
            <button class="btn btn-primary" onclick="DharmendiraModules.calculateSimulatedTax()">
              Calculate Statutory Breakup
            </button>
          </div>
        </div>

        <div id="sim-tax-result" class="card" style="display: none; background: rgba(56, 189, 248, 0.08); border-color: rgba(56, 189, 248, 0.3);">
          <!-- Results injected via JS -->
        </div>
      </div>
    `;
  },

  calculateSimulatedTax() {
    const gross = parseFloat(document.getElementById('sim-gross-salary').value) || 0;
    const rate = parseFloat(document.getElementById('sim-tax-regime').value) || 15;
    
    const tax = Math.round(gross * (rate / 100) * 0.7);
    const pf = Math.round(gross * 0.05);
    const ins = 1500;
    const totalDed = tax + pf + ins;
    const net = gross - totalDed;

    const resDiv = document.getElementById('sim-tax-result');
    resDiv.style.display = 'block';
    resDiv.innerHTML = `
      <h4 style="color: var(--accent-blue); margin-bottom: 0.75rem;">Calculated Monthly Statutory Breakdown:</h4>
      <div class="grid-4">
        <div><strong>Income Tax (TDS):</strong><br>₹${tax.toLocaleString()}</div>
        <div><strong>Provident Fund (PF):</strong><br>₹${pf.toLocaleString()}</div>
        <div><strong>Insurance Premium:</strong><br>₹${ins.toLocaleString()}</div>
        <div style="color: var(--accent-emerald);"><strong>Net Take Home:</strong><br><strong>₹${net.toLocaleString()}</strong></div>
      </div>
    `;
  }
};
