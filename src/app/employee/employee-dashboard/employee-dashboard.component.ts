import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { ChartData, ChartOptions } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ModalServiceService } from 'src/app/modal-service.service';
declare var bootstrap: any;
declare const html2canvas: any;
declare const jspdf: any;
@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent {
  @ViewChild('advanceSalaryModal') advanceSalaryModalRef!: ElementRef;
  @ViewChild('leaveRequestModal') leaveRequestModalRef!: ElementRef;

  editForm!: FormGroup;
  leaveForm!: FormGroup;
  changePasswordForm!: FormGroup;

  advanceSalaryForm!: FormGroup;
  tenures: string[] = [];
  installmentAmount: number = 0;
  years: number[] = [];
  selectedMonth: string = '';
  selectedYear: number = 0;
  canDownload: boolean = false;
  userName: string = "John Doe";
  billAmount: number = 0;
  // EmployeeID!: number;
  currentDateTime: Date = new Date();
  searchValue: any = "";
  Companydata: any;
  CompanyDetails: any;
  gridApiActive: any;
  isSubmitted: any = false;
  isLeaveSubmitted: any = false;
  isAdvanceSalary: any = false;
  employee_id!: any;
  company_id: any;
  Employee_Data: any;
  role: string = '';
  leaveTypes: any;
  isLoading: boolean = false;
  employeeDetails: any;
  calculationData: any;
  attendanceDetails: any;
  totalAttendanceValue: number = 0;
  financialYearId: any;
  latestRowData: any[] = [];
  miniColumnDefs: ColDef[] = [];
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  bonusData: any = null;
  attendanceRowData: any[] = [];
  attendanceColumnDefs: ColDef[] = [];
  attendanceGridApi: any;
  attendancePagination: any;
  selectedMonthAttendance: any;
  selectedYearAttendance: any;
  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private toastr: ToastrService, private service: HrmserviceService, private modalService: ModalServiceService,) {
    // Generate last 20 years dynamically
    let currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 20; i--) {
      this.years.push(i);
    }
    setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);
    for (let i = 1; i <= 12; i++) {
      this.tenures.push(`${i} Month${i > 1 ? 's' : ''}`);
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    const today = new Date();
    const currentYear = today.getFullYear();
    let previousMonth = today.getMonth();
    this.getRunningFinancialYear();

    if (previousMonth === 0) {
      this.selectedMonth = '12';
      this.selectedYear = currentYear - 1;
    } else {
      this.selectedMonth = (previousMonth < 10 ? '0' : '') + previousMonth;
      this.selectedYear = currentYear;
    }

    this.selectedMonthAttendance = (today.getMonth() + 1).toString().padStart(2, '0');
    this.selectedYearAttendance = today.getFullYear();

    this.role = this.service.getRole();

    // this.route.queryParams.subscribe(params => {
    //   this.employee_id = params['id'];
    //   console.log('Received employee code:', params['id']);
    // });

    let role_name = sessionStorage.getItem('roleName');

    if (role_name == 'Operator' || role_name == 'Supervisor' || role_name === 'Manager' || role_name === 'Maintenance Manager'
      || role_name === 'Production Manager' || role_name === 'Quality Manager' || role_name === 'Data-Entry Operator'
      || role_name === 'Production Incharge' || role_name === 'Plant Incharge' || role_name === 'Accountant' || role_name === 'Helper' || role_name === 'Driver') {
      const signalEmpId = this.service.EmployeeId();
      if (signalEmpId != null) {
        this.employee_id = this.service.EmployeeId();
        console.log('from signal', this.employee_id);
      } else {
        this.employee_id = sessionStorage.getItem('employeeId');
        console.log('session storage', this.employee_id);
      }

      this.searchEmployeeAdvanceSalary();
    }

    if (sessionStorage.getItem('roleName') == 'Admin') {
      this.route.queryParams.subscribe(params => {
        this.employee_id = params['id'];
      });

      this.searchEmployeeAdvanceSalary();
    }

    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      contact: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      status: ['', Validators.required],
      address: ['', [Validators.required, this.NoWhitespaceValidator, Validators.pattern(/^[A-Za-z0-9 ,.-]+$/), Validators.minLength(3)]]
    });

    this.leaveForm = this.fb.group({
      leave_id: [null, Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      is_half_day: [0],
      leave_reason: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/), this.NoWhitespaceValidator]
      ],
    });

    this.advanceSalaryForm = this.fb.group({
      tenure: [null, Validators.required],
      advance_amount: [null, [Validators.required, Validators.min(1), this.amountNotStartWithZero]],
      remarks: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/), this.NoWhitespaceValidator]]
    });

    this.advanceSalaryForm.valueChanges.subscribe(() => this.calculateInstallment());
    this.fetchEmployee(this.employee_id);

    this.isLoading = false;

    // const roleName = sessionStorage.getItem('roleName')
    // if (roleName == 'admin' || roleName == 'employee') {
    //   this.router.navigate(['/authPanal/EmployeeInDetail'], {
    //     queryParams: { id: this.employee_id }
    //   });
    //   return;
    // } else {
    //   alert('Please Login To Proceed');
    //   sessionStorage.clear();
    //   this.router.navigate(['']);
    //   return;
    // }
    this.initializeMiniColumns();

    this.changePasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
        ]
      ],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.initializeAttendanceColumns();
    this.fetchAttendance();
  }

  hasAccess(module: string, permission: string): boolean {
    return this.service.hasPermission(module, permission);
  }

  ngAfterViewInit(): void {
    document.querySelectorAll('.modal').forEach(modalEl => {
      modalEl.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      });
    });
  }

  openLeaveModal() {
    this.modalService.openModal('applyLeaveModal')
  }

  openAdvanceSalaryModal() {
    this.modalService.openModal('advanceSalaryModal')
  }

  amountNotStartWithZero(control: AbstractControl) {
    const value = control.value?.toString();
    if (value && value.length > 1 && value.startsWith('0')) {
      return { leadingZero: true };
    }
    return null;
  }

  leaveStatus = {
    accept: 1,
    pending: 1,
    reject: 0
  };

  salaryTracking = {
    totalAmount: 10000,
    paidAmount: 5000,
    installmentAmount: 1666.67,
    tenure: '6 Month',
    firstInstallmentDate: '07/11/25',
    nextInstallmentDueDate: '07/11/25',
    lastInstallmentPaidDate: '07/11/25',
    installmentEndDate: '07/11/25'
  };

  months = [
    { name: 'January', value: '01' },
    { name: 'February', value: '02' },
    { name: 'March', value: '03' },
    { name: 'April', value: '04' },
    { name: 'May', value: '05' },
    { name: 'June', value: '06' },
    { name: 'July', value: '07' },
    { name: 'August', value: '08' },
    { name: 'September', value: '09' },
    { name: 'October', value: '10' },
    { name: 'November', value: '11' },
    { name: 'December', value: '12' }
  ];

  onFilterBoxChange() {
    this.gridApiActive.setQuickFilter(this.searchValue);
  }

  fetchEmployee(id: any) {
    console.log(id);

    this.service.post(`single/employee`, { "employe_id": id }).subscribe((res: any) => {
      this.Employee_Data = res.data;
      this.company_id = res.data.employee.company_id;
      this.bonusData = res.data.bonus;
      this.getLeaveTypes();
      this.updateAttendanceChart();
    });
  }

  getPayrollData() {
    this.isLoading = true;
    this.service.post('fetch/payrolldata/payslip', {
      employee_id: this.employee_id,
      year: this.selectedYear,
      month: this.selectedMonth
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.status === 'success' && res.data) {
          this.generatePayslip(res.data);
        } else {
          this.toastr.error(res.message || 'Payslip data not found');
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message || 'Error fetching payslip data';
        this.toastr.error(errorMessage);
      }
    });
  }

  initializeMiniColumns() {
    this.miniColumnDefs = [
      { headerName: 'Apply Date', field: 'apply_date', flex: 1 },
      { headerName: 'Amount', field: 'advance_amount', flex: 1 },
      { headerName: 'Remaining', field: 'remaining_balance', flex: 1 },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1,
        cellRenderer: this.statusButtonRenderer
      }
    ];
  }

  searchEmployeeAdvanceSalary() {
    this.latestRowData = [];

    const payload = {
      employee_id: this.employee_id,
      year: this.selectedYear,
    };
    this.service.post('emp/advancesaraly/report', payload).subscribe(
      (res: any) => {
        if (res.status === 'success' && res.data.length > 0) {
          this.latestRowData = [...res.data]
            .sort((a, b) => new Date(b.apply_date).getTime() - new Date(a.apply_date).getTime())
            .slice(0, 5);
        } else {
          this.latestRowData = [];
        }
      },
      () => {
        this.latestRowData = [];
      }
    );
  }

  viewAll() {
    this.router.navigate(['/authPanal/employee-report']);
  }

  viewLeave() {
    this.router.navigate(['/authPanal/employee-report'], {
      queryParams: { tab: 'tab2' }
    });
  }

  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');
    button.innerText = status;
    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '97%';
    button.style.marginTop = '6px';

    // Conditional styling
    if (status === 'pending') {
      button.style.backgroundColor = '#FFF291'; // light red
      button.style.color = '#721c24'; // dark red text
      button.style.border = '1px solid #f5c6cb';
      button.style.borderRadius = '20px';
    } else if (status === 'Approved') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
      button.style.borderRadius = '20px';
    } else if (status === 'Rejected') {
      button.style.backgroundColor = '#FFAFAF'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #FFAFAF';
      button.style.borderRadius = '20px';
    } else if (status === 'Ongoing') {
      button.style.backgroundColor = '#faffafff'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #f7ffafff';
      button.style.borderRadius = '20px';
    } else if (status === 'Completed') {
      button.style.backgroundColor = '#c2ffafff'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #bfffafff';
      button.style.borderRadius = '20px';
    }
    return button;
  }

  generatePayslip(data: any) {
    this.employeeDetails = data.employee_details;
    this.calculationData = data.payroll_details;

    this.attendanceDetails = [data.attendance];
    this.selectedYear = data.period.year;
    // this.selectedMonth = data.period.month;
    let payslipMonthName = data.period.month;

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
        <strong>Payslip for ${payslipMonthName} ${this.selectedYear}</strong>
      </p>
      <hr />

      <p><strong>Employee Name:</strong> ${this.employeeDetails.emp_name}</p>
      <p><strong>Employee Code:</strong> ${this.employeeDetails.employee_code}</p>
      <p><strong>Worked Days:</strong> ${this.attendanceDetails[0]?.present_days ?? 0}</p>
      <p><strong>Absent Days:</strong> ${this.attendanceDetails[0]?.absent_days ?? 0}</p>

      <table border="1" cellspacing="0" cellpadding="6" style="width:100%; margin-top:15px; text-align:left; border-collapse:collapse;">
        <thead style="background:#efefef;">
          <tr>
            <th style="width:25%;">Earnings</th>
            <th style="width:25%;">Amount</th>
            <th style="width:25%;">Deductions</th>
            <th style="width:25%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Pay</td>
            <td>${this.calculationData?.basic_salary ?? 0}</td>
            <td>Tax</td>
            <td>${this.calculationData?.total_tax_deduction ?? 0}</td>
          </tr>
          <tr>
            <td>Present Day Hours Salary</td>
            <td>${this.calculationData?.present_day_hrs_salary ?? 0}</td>
            <td>PF Employee</td>
            <td>${this.calculationData?.pf_employee_deduction ?? 0}</td>
          </tr>
          <tr>
            <td>Overtime amount</td>
            <td>${this.calculationData?.overtime_amount ?? 0}</td>
            <td>ESIC</td>
            <td>${this.calculationData?.esic_deduction ?? 0}</td>
          </tr>
          <tr>
           <td>Incentive amount</td>
            <td>${this.calculationData?.incentive_amount ?? 0}</td>
            <td>Advance EMI</td>
            <td>${this.calculationData?.advance_amount ?? 0}</td>
          </tr>
          <tr>
           <td>Extra Expense</td>
            <td>${this.calculationData?.total_expense ?? 0}</td>
            <td></td>
            <td></td>
          </tr>
          <tr style="font-weight:bold;">
            <td>Total Earnings</td>
            <td>${this.calculationData?.total_salary ?? 0}</td>
            <td>Total Deductions</td>
            <td>${this.calculationData?.total_tax_deduction ?? 0}</td>
          </tr>
          <tr style="font-weight:bold; background:#f5f5f5;">
            <td colspan="2">Net Salary</td>
            <td colspan="2">₹${this.calculationData?.net_salary ?? 0}</td>
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

  getLeaveTypes() {
    this.service.post(`fetch/companyleave`, { "company_id": this.company_id }).subscribe((res: any) => {
      this.leaveTypes = res.data;
    });
  }

  NoWhitespaceValidator(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  calculateInstallment() {
    const amount = this.advanceSalaryForm.get('advance_amount')?.value;
    const tenureString = this.advanceSalaryForm.get('tenure')?.value;
    const months = parseInt(tenureString?.split(' ')[0] || '1', 10);

    if (amount > 0 && months > 0) {
      this.installmentAmount = Math.round(amount / months);
    } else {
      this.installmentAmount = 0;
    }
  }

  checkSelection() {
    if (this.selectedMonth !== '' && this.selectedYear !== 0) {
      console.log(`User selected: ${this.selectedMonth}-${this.selectedYear}`);
    }
  }

  public doughnutChartLabels: string[] = ['Present Days', 'Absent Days', 'Late Marks'];

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#3A79D1', '#7C0A02', '#F5A623'],
        hoverOffset: 10,
      },
    ],
  };

  updateAttendanceChart(): void {
    const attendance = this.Employee_Data?.lastMonthAttendance;

    if (!attendance) return;

    const present = Number(attendance.present_days) || 0;
    const absent = Number(attendance.absent_days) || 0;
    const late = Number(attendance.late_marks) || 0;

    this.doughnutChartData = {
      labels: this.doughnutChartLabels,
      datasets: [
        {
          data: [present, absent, late],
          backgroundColor: ['#3A79D1', '#7C0A02', '#F5A623'],
          hoverOffset: 10,
        },
      ],
    };
  }

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '80%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
  };

  // ✅ Total attendance getter
  get totalAttendance(): number {
    const a = this.Employee_Data?.lastMonthAttendance;
    return (Number(a?.present_days));
    // return (Number(a?.present_days) || 0) + (Number(a?.absent_days) || 0) + (Number(a?.late_marks) || 0);
  }

  updateData() {
    this.modalService.openModal('editProfileModal')
    this.editForm.patchValue({
      email: this.Employee_Data.employee.emp_email,
      contact: this.Employee_Data.employee.emp_contact,
      status: this.Employee_Data.employee.status,
      address: this.Employee_Data.employee.emp_address
    });

  }
  editEmployee() {
    this.isSubmitted = true;
    let current_data = {
      "employe_id": this.Employee_Data.employee.employe_id,
      "emp_email": this.editForm.value.email,
      "emp_contact": this.editForm.value.contact,
      "status": this.editForm.value.status,
      "emp_address": this.editForm.value.address
    }

    if (this.editForm.valid) {

      this.service.post(`update/employee`, current_data).subscribe((res: any) => {
        this.Employee_Data = res.data;
        if (res.status == 'success') {
          console.log('Updated Profile:', this.editForm.value);
          this.toastr.success('Updated Sucessfully !!!');
          this.fetchEmployee(this.employee_id);
          // location.reload();
          this.modalService.closeModal();
          this.editForm.reset();
        }
        else {
          this.toastr.error(' Check Again !');
        }

      });


    }
    else {
      this.editForm.markAllAsTouched();
      this.toastr.error('Invalid Credentials !');
      console.log('Update5d Profile:', this.editForm.value);
    }
  }

  //apply leave 
  addLeaveRequest() {
    this.isLeaveSubmitted = true;

    if (!this.leaveForm.valid) {
      this.toastr.error('Please fill in all required details.');
      this.leaveForm.markAllAsTouched();
      return;
    }

    const leaveData = {
      employe_id: this.employee_id,
      company_id: this.company_id,
      leave_id: this.leaveForm.value.leave_id,
      start_date: this.leaveForm.value.start_date,
      end_date: this.leaveForm.value.end_date,
      is_half_day: this.leaveForm.value.is_half_day ? 1 : 0,
      leave_reason: this.leaveForm.value.leave_reason,
    };

    console.log('Submitting leave request:', leaveData);

    this.service.post("apply/leave", leaveData).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Leave applied successfully!');
          // this.router.navigate(['/authPanal/EmployeeInDetail'], {
          //   queryParams: { id: this.employee_id }
          // });
          this.fetchEmployee(this.employee_id);
          this.router.navigate(['/authPanal/EmployeeInDetail']);
        } else {
          this.toastr.error(res.data || 'Failed to apply leave.');
        }

        this.resetLeaveForm();
      },
      error: (err: any) => {
        this.toastr.error(err.error?.data || 'Server error occurred.');
        this.resetLeaveForm();
      }
    });
  }

  resetLeaveForm() {
    this.leaveForm.reset({
      leave_id: null,
      noOfDays: 1,
      start_date: '',
      end_date: '',
      leave_reason: ''
    });
    this.leaveForm.markAsUntouched();
    this.leaveForm.markAsPristine();
    this.isLeaveSubmitted = false;
    this.modalService.closeModal();
  }

  // advance salary request 
  addAdvanceSalary() {
    this.isAdvanceSalary = true;

    if (!this.advanceSalaryForm.valid) {
      this.toastr.error('Please fill in all required details.');
      this.advanceSalaryForm.markAllAsTouched();
      return;
    }

    const tenureValue = this.advanceSalaryForm.value.tenure?.match(/\d+/)?.[0] || '0';

    const formData = {
      ...this.advanceSalaryForm.value,
      emi: this.installmentAmount,
      employee_id: this.employee_id,
      tenure: tenureValue
    };

    this.service.post("apply/advancesaraly", formData).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Advance salary applied successfully!');
          // this.router.navigate(['/authPanal/EmployeeInDetail'], {
          //   queryParams: { id: this.employee_id }
          // });
          this.fetchEmployee(this.employee_id);
          this.searchEmployeeAdvanceSalary();
          this.router.navigate(['/authPanal/EmployeeInDetail']);
        } else {
          this.toastr.error(res.data || 'Request failed.');
        }

        this.resetAdvanceSalaryForm();
      },
      error: (err: any) => {
        this.toastr.error(err.error?.data || 'Server error.');
        this.resetAdvanceSalaryForm();
      }
    });
  }

  resetAdvanceSalaryForm() {
    this.advanceSalaryForm.reset();
    this.advanceSalaryForm.markAsUntouched();
    this.advanceSalaryForm.markAsPristine();
    this.isAdvanceSalary = false;
    this.modalService.closeModal();
  }

  backtoEmployeeList() {
    this.router.navigate(['/authPanal/Employee']);
  }

  goToUpdateEmployee() {
    this.router.navigate(['/authPanal/UpdateEmployee'], {
      queryParams: { id: this.employee_id }
    });
  }

  onHalfDayChange() {
    const isHalfDay = this.leaveForm.get('is_half_day')?.value;

    if (isHalfDay) {
      const startDate = this.leaveForm.get('start_date')?.value;
      if (startDate) {
        this.leaveForm.patchValue({ end_date: startDate });
      }
    }
  }

  getRunningFinancialYear() {
    this.service.post('fetch/financialyear', {}).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.financialYearId = res.data.fy_id;
        }
      },
      (error) => {
        console.error('Failed to fetch financial year', error);
        this.toastr.error('Unable to fetch financial year');
      }
    );
  }

  //password change
  get f() {
    return this.changePasswordForm.controls;
  }
  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirm_password')?.value;

    return pass === confirm ? null : { mismatch: true };
  }
  openChangePasswordModal() {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
  }
  changePassword() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      this.toastr.error('Please fix validation errors');
      return;
    }

    // Confirm dialog
    if (!confirm('Are you sure you want to change password?')) {
      return;
    }

    const payload = {
      emp_id: this.employee_id,
      new_password: this.changePasswordForm.value.password
    };

    this.service.post('update/password', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Password updated successfully');

          this.changePasswordForm.reset();
          this.submitted = false;

          this.modalService.closeModal(); // or bootstrap close
        } else {
          this.toastr.error(res.message || 'Failed to update password');
        }
      },
      error: () => {
        this.toastr.error('Server error');
      }
    });
  }

  //live attendnace
  initializeAttendanceColumns() {
    this.attendanceColumnDefs = [
      { headerName: 'Date', field: 'date', flex: 1 },
      { headerName: 'Check In', field: 'check_in', flex: 1 },
      { headerName: 'Check Out', field: 'check_out', flex: 1 },
      { headerName: 'Shift', field: 'shift', flex: 1 },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1,
        cellRenderer: (params: any) => {
          const span = document.createElement('span');
          span.innerText = params.value;

          span.style.padding = '5px 10px';
          span.style.borderRadius = '15px';
          span.style.fontWeight = 'bold';

          if (params.value === 'P') {
            span.style.backgroundColor = '#B2FFE1';
          } else {
            span.style.backgroundColor = '#feffafe7';
          }

          return span;
        }
      }
    ];
  }

  fetchAttendance(page: number = 1): void {
    const payload = {
      employee_id: this.employee_id,
      month: Number(this.selectedMonthAttendance),
      year: this.selectedYearAttendance,
      page: page,
      isexport: false
    };

    this.service.post('fetch/live/attendnace', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.attendanceRowData = res.data;
        } else {
          this.attendanceRowData = [];
          this.totalRows = 0;
          this.pagesToShow = [];
        }
      },
      error: () => {
        this.attendanceRowData = [];
      }
    });
  }

  onAttendanceGridReady(params: any) {
    this.attendanceGridApi = params.api;
  }

  onMonthYearChange() {
    if (this.selectedMonthAttendance && this.selectedYearAttendance) {
      this.fetchAttendance(1); // reset to page 1
    }
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
    this.fetchAttendance();
  }
}
