import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ColGroupDef,
} from 'ag-grid-community';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { PayrollSummariesBtnComponent } from './Payroll-summaries-btn/Payroll-summaries-btn.component';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ModalServiceService } from 'src/app/modal-service.service';
declare var bootstrap: any;
declare const html2canvas: any;
declare const jspdf: any;

@Component({
  selector: 'app-payroll-summaries',
  templateUrl: './payroll-summaries.component.html',
  styleUrls: ['./payroll-summaries.component.css'],
})
export class PayrollSummariesComponent {
  payrollDetails!: FormGroup;
  employee_id: any;
  employeeDetails: any;
  attendanceDetails: any;
  selectedYear: any;
  selectedMonth: any;
  columnDefs2: any;
  rowData: any;
  AdvanceSalaryDetails: any;
  hasAdvanceSalary: any;
  prevAdvanceSalaryDetails: any;
  tempPayrollId: any;
  calculationData: any;
  deduct: any[] = [];
  today: string = new Date().toISOString().split('T')[0];
  rejectreasons: any;
  selectedRejectedReason: any = '';
  otherReason: string = '';
  expenseForm: FormGroup;
  isSubmitted: boolean = false;
  expensesList: any[] = [];

  showReasonError: boolean = false;
  showOtherReasonError: boolean = false;
  isLoading: boolean = false;
  isConfirmingExpense: boolean = false;
  expenseAmountInWords: string = '';
  pendingExpensePayload: any = null;
  source: string = 'list';

  constructor(private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private modalService: ModalServiceService, private service: HrmserviceService, private toastr: ToastrService) {
    this.payrollDetails = this.formBuilder.group({
      id: ['', [Validators.required]],
      employeeName: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      date: ['', [Validators.required]],
    });

    this.expenseForm = this.formBuilder.group({
      expenseType: ['add', [Validators.required]], // 'add' | 'deduct'
      expenseDescription: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s]+$/)]],
      expenseAmount: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)]]
    });
  }

  months = [
    { id: 1, value: 'January' },
    { id: 2, value: 'February' },
    { id: 3, value: 'March' },
    { id: 4, value: 'April' },
    { id: 5, value: 'May' },
    { id: 6, value: 'June' },
    { id: 7, value: 'July' },
    { id: 8, value: 'August' },
    { id: 9, value: 'September' },
    { id: 10, value: 'October' },
    { id: 11, value: 'November' },
    { id: 12, value: 'December' }
  ];

  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modalElement: any) => {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  }

  ngOnInit() {
    // this.selectedYear = new Date().getFullYear();
    // this.selectedMonth = new Date().getMonth();
    // const currentDate = new Date();
    // this.today = currentDate.toISOString().split('T')[0];
    const today = new Date();
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    this.selectedYear = lastMonthDate.getFullYear();
    this.selectedMonth = lastMonthDate.getMonth() + 1;

    this.today = today.toISOString().split('T')[0];

    this.route.queryParams.subscribe(params => {
      this.source = params['source'] || 'list';
      this.employee_id = params['id'];
      this.tempPayrollId = params['temp_payroll_id']
      // console.log('Received employee  payroll:', this.employee_id);
      // console.log('tempPayrollId:', this.tempPayrollId);
    });
    this.getSinglePayroll()
    this.setMonthGroupHeader();
    // this.columnDefs2= this.generateColumns(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep','oct','nov','dec']);
  }

  hasAccess(module: string, permission: string): boolean {
    return this.service.hasPermission(module, permission);
  }

  openModal() {
    this.modalService.openModal('RejectPayrollModal')
    this.getRejectReasons();
  }

  getMonthName(monthId: number): string {
    const month = this.months.find(m => m.id === monthId);
    return month ? month.value : '';
  }

  getRejectReasons() {
    this.service.post('fetch/rejection/reason', { employee_id: this.employee_id }).subscribe((res: any) => {
      if (res.status == 'success') {
        this.rejectreasons = res.data
      }
    });
  }

  getSinglePayroll() {
    this.isLoading = true;
    this.service.post('get/single/payroll_list', { employee_id: this.employee_id }).subscribe((res: any) => {
      if (res.status == 'success') {
        this.employeeDetails = res.data.payroll_summary[0];
        const attendanceData = res.data.attendance_summary[0];
        this.AdvanceSalaryDetails = res.data.advance_salary || [];;
        this.hasAdvanceSalary = this.AdvanceSalaryDetails.length > 0;;
        this.calculationData = res.data.calculation;
        this.expensesList = res.data.expenses || [];
        console.log(this.calculationData);


        this.payrollDetails.patchValue({
          id: this.employeeDetails.employee_code,
          employeeName: this.employeeDetails.emp_name,
          companyName: this.employeeDetails.company_name,
        });

        this.attendanceDetails = [
          {
            P: (attendanceData.present_days),
            A: (attendanceData.absent_days),
            H: (attendanceData.holiday_days),
            HD: (attendanceData.half_day),
            OT: (attendanceData.total_overtime),
            LT: (attendanceData.late_mark),
            TD: (attendanceData.total_days),
            W: (attendanceData.weekend),
          }
        ]

        // if (res.data.prvadvancesalary.length > 0) {
        //   this.prevAdvanceSalaryDetails = res.data.prvadvancesalary[0];
        //   this.rowData = [{
        //     apply_date: this.prevAdvanceSalaryDetails.apply_date,
        //     tenure: this.prevAdvanceSalaryDetails.tenure,
        //     advance_amount: this.prevAdvanceSalaryDetails.advance_amount || '-',
        //     emi: this.prevAdvanceSalaryDetails.emi,
        //     emi_status: this.prevAdvanceSalaryDetails.emi_status,
        //   }];
        // } else {
        //   this.rowData = [];
        // }

        this.deduct = [
          {
            Compound: 'Employee PF Contribution',
            deduction: 'PF',
            amount: this.calculationData.pf_employee_deduction ?? 0
          },
          {
            Compound: 'Employer PF Contribution',
            deduction: 'PF',
            amount: this.calculationData.pf_employer_contribution ?? 0
          },
          {
            Compound: 'Professional Tax (PT)',
            deduction: 'Tax Deduction',
            amount: this.calculationData.total_tax_deduction ?? 0
          },
          {
            Compound: 'ESIC',
            deduction: 'ESIC',
            amount: this.calculationData.esic_deduction ?? 0
          },
          {
            Compound: 'Advance Salary',
            deduction: 'Advance Deduction',
            amount: this.calculationData.advance_amount ?? 0
          },
          // {
          //   Compound: 'Other',
          //   deduction: '-',
          //   amount:0,
          // },
        ];
        if (this.calculationData.leave_without_pay_days != 'Null' && this.calculationData.leave_without_pay_days > 0) {
          this.deduct.push(
            {
              Compound: 'Leave w/o Pay',
              deduction: this.calculationData.leave_without_pay_days + ' - days',
              amount: this.calculationData.leave_without_pay_amount
            }
          )
        }
        this.isLoading = false;
      }
    })
  }

  addExpenseInSalary() {
    this.isSubmitted = true;
    if (this.expenseForm.invalid) {
      this.toastr.error("Please enter required fields");
      return;
    }

    const type = this.expenseForm.value.expenseType; // 'add' | 'deduct'
    const rawAmount = Number(this.expenseForm.value.expenseAmount);
    const signedAmount = type === 'deduct' ? -rawAmount : rawAmount;

    // Words always shown for the positive/absolute value
    this.expenseAmountInWords = this.numberToWords(Math.abs(rawAmount));

    this.pendingExpensePayload = {
      employee_id: this.employee_id,
      year_month: `${this.selectedYear}-${(this.selectedMonth)
        .toString().padStart(2, '0')}`,
      expense_description: this.expenseForm.value.expenseDescription,
      expense_amount: signedAmount // stored with sign in DB
    };

    this.modalService.openModal('ConfirmExpenseModal');
  }

  confirmAddExpense() {
    if (!this.pendingExpensePayload || this.isConfirmingExpense) return;   // guard added

    this.isConfirmingExpense = true;   // ADD
    this.isLoading = true;
    this.service.post('add/expense-in-salary', this.pendingExpensePayload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success("Expense added successfully");
          this.getSinglePayroll();
          this.expenseForm.reset({ expenseType: 'add' });
          this.isSubmitted = false;
        } else {
          this.toastr.error("Something went wrong");
        }
        this.isLoading = false;
        this.isConfirmingExpense = false;   // ADD
        this.cancelAddExpense();
      },
      error: () => {
        this.isLoading = false;
        this.isConfirmingExpense = false;   // ADD — reset on error too
        this.toastr.error("Something went wrong");
      }
    });
  }

  cancelAddExpense() {
    this.pendingExpensePayload = null;
    this.expenseAmountInWords = '';
    this.modalService.closeModal();
  }

  deleteExpense(expense_id: number) {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    this.isLoading = true;
    const payload = {
      expense_id: expense_id
    };
    this.service.post('delete/expense', payload).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success("Expense deleted successfully");
        this.getSinglePayroll();
        this.isLoading = false;
      } else {
        this.toastr.error("Something went wrong");
        this.isLoading = false;
      }
    });
  }

  formatted(value: number | null | undefined): string {
    if (value == null) return '0';

    const parts = value.toString().split('.');
    const intPart = Number(parts[0]).toLocaleString('en-IN');
    const decPart = parts[1] ? '.' + parts[1] : '';

    return intPart + decPart;
  }

  getExpenseType(amount: number): string {
    return amount < 0 ? 'Deduct' : 'Add';
  }

  getAbsAmount(amount: number): number {
    return Math.abs(amount ?? 0);
  }

  // calculateProgress(): number {
  //   if (!this.AdvanceSalaryDetails) return 0;
  //   const paid = this.AdvanceSalaryDetails.advance_amount - this.AdvanceSalaryDetails.remaining_balance;
  //   return Math.round((paid / this.AdvanceSalaryDetails.advance_amount) * 100);
  // }

  calculateProgress(adv: any): number {
    if (!adv || adv.advance_amount === 0) return 0;
    const paid = adv.advance_amount - adv.remaining_balance;
    return Math.round((paid / adv.advance_amount) * 100);
  }

  backtoPayroll() {
    if (this.source === 'process') {
      this.router.navigate(['/authPanal/payrollProcess']);
    } else {
      this.router.navigate(['/authPanal/payrollList']);
    }
  }

  columnDefs: ColDef[] = [
    {
      headerName: 'Apply Date',
      field: 'apply_date',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Tenure',
      field: 'tenure',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Amount',
      field: 'advance_amount',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Emi',
      field: 'emi',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Emi Status',
      field: 'emi_status',
      sortable: true,
      filter: true,
      flex: 1,
    },
  ];

  setMonthGroupHeader(): void {
    const monthName = this.getMonthName(this.selectedMonth);
    this.columnDefs2 = [
      {
        headerName: monthName,
        children: [
          { headerName: 'P', field: 'P' },
          { headerName: 'A', field: 'A' },
          { headerName: 'H', field: 'H' },
          { headerName: 'W/O', field: 'W' },
          { headerName: 'OT(hrs)', field: 'OT' },
          { headerName: 'LT', field: 'LT' },
          { headerName: 'TD', field: 'TD' },
        ],
      },
    ];
  }

  defaultColDef: ColDef = {
    resizable: true,
    cellStyle: { textAlign: 'center' },
    flex: 1
  };

  onMonthChange() {
    this.columnDefs[0]['headerName'] = this.selectedMonth;
    this.columnDefs = [...this.columnDefs]; // Trigger change detection
  }
  // generateColumns(fields: string[]) {
  //   return fields.map((field) => ({
  //     headerName: field.charAt(0).toUpperCase() + field.slice(1),
  //     children: [
  //       {  field:'p', headerName: 'P', maxWidth:50},
  //       {  field:'a', headerName: 'A', maxWidth:50 },
  //       {  field:'w', headerName: 'W', maxWidth:50 },
  //       {  field:'wod', headerName: 'W/od', maxWidth:80 },
  //       {  field:'h', headerName: 'H', maxWidth:50 },
  //       {  field:'wfh2', headerName: 'WFH/2', maxWidth:80 },
  //       {  field:'hd', headerName: 'HD', maxWidth:70 },
  //       {  field:'hr', headerName: 'HR', maxWidth:70 },
  //       {  field:'ot', headerName: 'OT', maxWidth:70 },
  //       {  field:'lt', headerName: 'LT', maxWidth:70 },
  //       {  field:'th', headerName: 'TH', maxWidth:70 },
  //     ]
  //   }));
  // }

  onSelectionChanged(event: any): void {
    const selectedRows = event.api.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }
  gridApi!: GridApi;
  selectedColumn: string = '';

  attandanceDetails = [
    {
      p: '1',
      a: 2,
      w: '3',
      wod: '4',
      h: 8,
      wfh2: 0,
      hd: 0,
      hr: 8,
      ot: 8,
      lt: 8,
      th: 8,
    },
  ];
  onColumnSelectChange() {
    if (this.gridApi && this.selectedColumn) {
      this.gridApi.ensureColumnVisible(this.selectedColumn);
    }
  }

  rejectPayroll() {
    this.showReasonError = false;
    this.showOtherReasonError = false;

    if (!this.selectedRejectedReason?.rejection_id) {
      this.showReasonError = true;
      return;
    }

    if (this.selectedRejectedReason?.rejection_reason === 'Other' && (!this.otherReason || this.otherReason.trim() === '')) {
      this.showOtherReasonError = true;
      return;
    }

    const payload: any = {
      temp_payroll_id: Array.isArray(this.tempPayrollId)
        ? this.tempPayrollId
        : [this.tempPayrollId],
      rejection_id: this.selectedRejectedReason?.rejection_id,
    };

    if (this.selectedRejectedReason?.rejection_reason === 'Other') {
      payload.other_reason = this.otherReason.trim();
    }

    this.service.post('rejected/payroll', payload).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success('Payroll rejected successfully');
        this.modalService.closeModal();
        this.router.navigate(['/authPanal/payrollList']);
      }
      else {
        this.toastr.error('Something went wrong');
      }
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  create_user() {
    // alert("Create User");
    this.router.navigate(['/authPanal/CreateEmployee']);
  }
  gridOptions = {
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: false,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
  };

  numberToWords(num: number): string {
    if (num == null || isNaN(num)) return '';
    num = Math.floor(num);
    if (num === 0) return 'Zero Rupees';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const twoDigits = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      return tens[Math.floor(n / 10)] + ' ' + (n % 10 !== 0 ? ones[n % 10] + ' ' : '');
    };

    const threeDigits = (n: number): string => {
      let str = '';
      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      str += twoDigits(n);
      return str;
    };

    let result = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = num;

    if (crore > 0) result += threeDigits(crore) + 'Crore ';
    if (lakh > 0) result += threeDigits(lakh) + 'Lakh ';
    if (thousand > 0) result += threeDigits(thousand) + 'Thousand ';
    if (hundred > 0) result += threeDigits(hundred);

    return result.trim() + ' Rupees Only';
  }

  downloadPayslip() {
    if (!this.employeeDetails || !this.calculationData || !this.attendanceDetails) {
      this.toastr.error('Missing payslip data.');
      return;
    }

    const temp = document.createElement('div');
    temp.style.position = 'fixed';
    temp.style.top = '-9999px';
    temp.style.left = '-9999px';
    temp.style.width = '210mm';
    temp.style.background = '#fff';
    temp.style.padding = '20px';
    temp.style.fontFamily = 'Arial, sans-serif';

    temp.innerHTML = `
    <div style="font-family: Arial, sans-serif; width: 100%; padding: 20px;">
      <h3 style="text-align:center; margin-bottom: 10px;">
        ${this.employeeDetails.company_name || ''}
      </h3>
      <p style="text-align:center; margin-top: -5px;">
        <strong>Payslip for ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}</strong>
      </p>
      <hr />

      <p><strong>Employee Name:</strong> ${this.employeeDetails.emp_name}</p>
      <p><strong>Employee Code:</strong> ${this.employeeDetails.employee_code}</p>
      <p><strong>Worked Days:</strong> ${this.attendanceDetails[0]?.P ?? 0}</p>
      <p><strong>Absent Days:</strong> ${this.attendanceDetails[0]?.A ?? 0}</p>

      <table border="1" cellspacing="0" cellpadding="6"
        style="width:100%; margin-top:15px; text-align:left; border-collapse:collapse;">
        <thead style="background:#efefef;">
          <tr>
            <th style="width:25%; border-right:none;">Earnings</th>
            <th style="width:25%; border-left:none; border-right:none;">Amount</th>
            <th style="width:25%; border-left:none; border-right:none;">Deductions</th>
            <th style="width:25%; border-left:none;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border-right:none;">Basic Pay</td>
            <td style="border-left:none; border-right:none;">${this.calculationData?.basic_salary ?? 0}</td>
            <td style="border-left:1px solid #000; border-right:none;">Tax</td>
            <td style="border-left:none;">${this.calculationData?.total_tax_deduction ?? 0}</td>
          </tr>
          <tr>
            <td style="border-right:none;">Present Day Hours Salary</td>
            <td style="border-left:none; border-right:none;">${this.calculationData?.present_day_hrs_salary ?? 0}</td>
            <td style="border-left:1px solid #000; border-right:none;">PF Employee</td>
            <td style="border-left:none;">${this.calculationData?.pf_employee_deduction ?? 0}</td>
          </tr>
          <tr>
            <td style="border-right:none;">Overtime</td>
            <td style="border-left:none; border-right:none;">${this.calculationData?.overtime_amount ?? 0}</td>
            <td style="border-left:1px solid #000; border-right:none;">PF Employer</td>
            <td style="border-left:none;">${this.calculationData?.pf_employer_contribution ?? 0}</td>
          </tr>
          <tr>
            <td style="border-right:none;">Incentive</td>
            <td style="border-left:none; border-right:none;">${this.calculationData?.incentive_amount ?? 0}</td>
            <td style="border-left:1px solid #000; border-right:none;">ESIC</td>
            <td style="border-left:none;">${this.calculationData?.esic_deduction ?? 0}</td>
          </tr>
          <tr>
            <td style="border-right:none;">Total Miscellaneous Expenses</td>
            <td style="border-left:none; border-right:none;">${this.calculationData?.extra_expenses ?? 0}</td>
            <td style="border-left:1px solid #000; border-right:none;">Advance EMI</td>
            <td style="border-left:none;">${this.calculationData?.advance_amount ?? 0}</td>
          </tr>
          <tr>
            <td style="border-right:none;"></td>
            <td style="border-left:none; border-right:none;"></td>
            <td style="border-left:1px solid #000; border-right:none;">Total Miscellaneous Deductions</td>
            <td style="border-left:none;">${this.calculationData?.extra_deductions ?? 0}</td>
          </tr>
          <tr style="font-weight:bold; background:#f5f5f5;">
            <td colspan="2" style="border-right:none;">Net Salary</td>
            <td colspan="2" style="border-left:none;">₹${this.calculationData?.net_salary ?? 0}</td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top: 20px; font-size: 12px;">This salary statement is issued for information purposes only and shall not be treated as an official document or legal proof of employment, income, or eligibility for any financial facility.</p>
    </div>
  `;

    document.body.appendChild(temp);

    html2canvas(temp, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      .then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');

        const pageWidth = 210;
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);

        const signatureY = margin + imgHeight + 12;
        pdf.setFontSize(12);
        pdf.text('Employer Signature:', margin, signatureY);
        pdf.text('Employee Signature:', pageWidth / 2 + 10, signatureY);

        pdf.setLineWidth(0.5);
        pdf.line(margin, signatureY + 6, margin + 60, signatureY + 6);
        pdf.line(pageWidth / 2 + 10, signatureY + 6, pageWidth / 2 + 70, signatureY + 6);

        const employeeName = this.employeeDetails.emp_name || 'Employee';
        pdf.save(`${employeeName}_Payslip.pdf`);

        document.body.removeChild(temp);
      })
      .catch((err: any) => {
        console.error('Error generating payslip:', err);
        document.body.removeChild(temp);
      });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[0-9]*$/;

    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

}
