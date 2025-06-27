import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
declare var bootstrap: any;
@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent {
 @ViewChild('advanceSalaryModal') advanceSalaryModalRef!: ElementRef;
  @ViewChild('leaveRequestModal') leaveRequestModalRef!: ElementRef;

  editForm!: FormGroup;
  leaveForm!: FormGroup; // apply leave
  // leaveTypes: string[] = ['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity'];
  leaveTypes:any[] = [
    { id: 1, value: 'Casual' },
    { id: 2, value: 'Sick' },
    { id: 3, value: 'Earned' },
    { id: 4, value: 'Maternity' },
    { id: 5, value: 'Paternity' },
  ];
  advanceSalaryForm!: FormGroup;  // apply advance salary
  tenures: string[] = ['3 Month', '6 Month'];
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
  employee_id!: number;
  Employee_Data: any;
  role: string = '';

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private toastr: ToastrService, private service: HrmserviceService,) {
    // Generate last 20 years dynamically
    let currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 20; i--) {
      this.years.push(i);
    }
    setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);

  }

  ngOnInit(): void {
    this.role = this.service.getRole();

    this.route.queryParams.subscribe(params => {
      this.employee_id = params['id'];
      console.log('Received employee code:', params['id']);
    });


    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      contact: ['', [Validators.required, this.NoWhitespaceValidator, Validators.pattern('^[0-9]*$')]],
      status: ['', Validators.required],
      address: ['', [Validators.required, this.NoWhitespaceValidator, Validators.pattern(/^[A-Za-z0-9 ,.-]+$/), Validators.minLength(3)]]
    });

    this.leaveForm = this.fb.group({
      leave_id: ['', Validators.required],
      noOfDays: [1, [Validators.required, Validators.min(1)]],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      leave_reason: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/), this.NoWhitespaceValidator]]
    });

    this.advanceSalaryForm = this.fb.group({
      tenure: ['', Validators.required],
      advance_amount: [0, [Validators.required, Validators.min(1)]],
      remarks: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/), this.NoWhitespaceValidator]]
    });

    this.advanceSalaryForm.valueChanges.subscribe(() => this.calculateInstallment());
    this.fetchEmployee(this.employee_id);

  }
  
  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modalElement: any) => {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
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
    // alert(id);
    this.service.post(`single/employee`, { "employe_id": id }).subscribe((res: any) => {
      this.Employee_Data = res.data;
    });
  }

  // No spaces only, no leading/trailing spaces
  NoWhitespaceValidator(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  // for installment calculation : 
  calculateInstallment() {
    const amount = this.advanceSalaryForm.get('advance_amount')?.value;
    const tenureString = this.advanceSalaryForm.get('tenure')?.value;
    const months = parseInt(tenureString?.split(' ')[0] || '1', 10);

    if (amount > 0 && months > 0) {
      // this.installmentAmount = +(amount / months).toFixed(2);
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

  // chart for the attendance system :
  public doughnutChartLabels: string[] = ['Present', 'Absent', 'Sick Leave', 'Casual Leave'];

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [300, 40, 20, 5],
        backgroundColor: ['#3A79D1', '#7C0A02', '#016A43', '#02DBA9'],
        hoverOffset: 10,
      }
    ]
  };

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
          }
        }
      },
      datalabels: {
        display: false
      }
    }
  };

  updateData() {

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
      "employe_id": this.Employee_Data.employe_id,
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
          location.reload();
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
    if (this.leaveForm.valid) {
      const leaveData = {
        employe_id: this.employee_id,
        company_id: 1,
        leave_id: this.leaveForm.value.leave_id,
        start_date: this.leaveForm.value.start_date,
        end_date: this.leaveForm.value.end_date,
        leave_reason: this.leaveForm.value.leave_reason,
      };
      console.log('Leave Request Submitted:', leaveData);
      this.service.post("apply/leave", leaveData).subscribe((res) => {
      this.toastr.success(' Request Added !!!');
      this.router.navigate(['/authPanal/EmployeeInDetail']);
      this.leaveForm.reset();
        this.closeAllModals();
      });
    }
    else {
      // alert("Check Again !!!")
      const leaveData = this.leaveForm.value;
      // this.leaveForm.markAllAsTouched();
      this.toastr.error('Invalid Credentials !');
      // console.log('Leave Request Submitted:', leaveData);
    }
  }

  // advance salary request 
  addAdvanceSalary() {
    this.isAdvanceSalary = true;
    if (this.advanceSalaryForm.valid) {
      const formData = {
        ...this.advanceSalaryForm.value,
        emi: this.installmentAmount,
        employee_id: this.employee_id,
        tenure:(this.advanceSalaryForm.value.tenure).match(/\d+/)[0],
      };
      this.service.post("apply/advancesaraly", formData).subscribe((res) => {
       this.toastr.success(' Request Added !!!');
        this.router.navigate(['/authPanal/EmployeeInDetail']);
        this.advanceSalaryForm.reset();
        this.closeAllModals();
      });
    }
    else {
      // this.advanceSalaryForm.markAllAsTouched();
      this.toastr.error(' Invalid credentials !');
    }
  }



}
