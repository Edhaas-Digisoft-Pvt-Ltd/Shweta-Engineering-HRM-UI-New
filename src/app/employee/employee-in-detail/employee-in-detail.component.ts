import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ColDef } from 'ag-grid-community';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

declare var bootstrap: any;

@Component({
  selector: 'app-employee-in-detail',
  templateUrl: './employee-in-detail.component.html',
  styleUrls: ['./employee-in-detail.component.css']
})
export class EmployeeInDetailComponent {

  @ViewChild('advanceSalaryModal') advanceSalaryModalRef!: ElementRef;
  @ViewChild('leaveRequestModal') leaveRequestModalRef!: ElementRef;

  editForm!: FormGroup;
  leaveForm!: FormGroup; // apply leave
  // leaveTypes: string[] = ['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity'];
  leaveTypes = [
    { key: "1", value: "Casual" },
    { key: "2", value: "Sick" },
    { key: "3", value: "Earned" },
    { key: "4", value: "Maternity" },
    { key: "5", value: "Paternity" }
  ];
  advanceSalaryForm!: FormGroup;  // apply advance salary
  tenures = [
    {key:1, value:'3Month'},
    {key:2, value:'6Month'}
  ];
  installmentAmount: number = 0;
  years: number[] = [];
  selectedMonth: string = '';
  selectedYear: number = 0;
  canDownload: boolean = false;
  userName: string = "John Doe";
  billAmount: number = 0;
  employeeId!: number;
  companyId!: number;
  currentDateTime: Date = new Date();
  searchValue: any = "";
  Companydata: any;
  CompanyDetails: any;
  gridApiActive: any;
  isSubmitted: any = false;
  isLeaveSubmitted: any = false;
  isAdvanceSalary: any = false;
  employee_code: any;
  Employee_Data: any;
  

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

  role: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.employee_code = params['id'];
      console.log('Received employee code:', params['id']);
    });
    this.role = this.service.getRole();

    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      contact: ['', [Validators.required, this.NoWhitespaceValidator, Validators.pattern('^[0-9]*$')]],
      status: ['', Validators.required],
      address: ['', [Validators.required, this.NoWhitespaceValidator, Validators.pattern(/^[A-Za-z0-9 ,.-]+$/), Validators.minLength(3)]]
    });

    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      noOfDays: [1, [Validators.required, Validators.min(1)]],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/), this.NoWhitespaceValidator]]
    });

    this.advanceSalaryForm = this.fb.group({
      tenure: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/), this.NoWhitespaceValidator]]
    });

    this.advanceSalaryForm.valueChanges.subscribe(() => this.calculateInstallment());
    this.fetchEmployee(this.employee_code);
    this.fetchAttendance();
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
    this.service.post(`single/employee`, { "employe_id": id }).subscribe((res: any) => {
      this.Employee_Data = res.data;
      this.employeeId = this.Employee_Data.employee.employe_id
      this.companyId = this.Employee_Data.employee.company_id
    });
  }

  fetchAttendance(){
    this.service.post(`fetch/attendance`, {}).subscribe((res: any) => {
    });
  }

  // No spaces only, no leading/trailing spaces
  NoWhitespaceValidator(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  // for installment calculation :
  calculateInstallment() {
    const amount = this.advanceSalaryForm.get('amount')?.value;
    const tenureString = this.advanceSalaryForm.get('tenure')?.value;
    const months = parseInt(tenureString?.split(' ')[0] || '1', 10);

    if (amount > 0 && months > 0) {
      this.installmentAmount = +(amount / months).toFixed(2);
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
      ...this.Employee_Data.employee,
      // "employe_id": this.Employee_Data.employe_id,
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

  // getleaveTypes() {
  //   this.service.post(`fetch/companyleave`,{"company_id":this.companyId}).subscribe((res: any) => {
  //     console.log(res)
  //      if (res.status === 'success') {
  //       // leaveTypes
          
  //       };
  //   })
  // }

  //apply leave
  applyLeaveRequest() {
    this.isLeaveSubmitted = true;
    if (this.leaveForm.valid) {
      const leaveData = {
        employe_id: this.employeeId,
        company_id: this.companyId,
        leave_id: this.leaveForm.value.leaveType,
        start_date: this.leaveForm.value.fromDate,
        end_date: this.leaveForm.value.toDate,
        leave_reason: this.leaveForm.value.reason
      };
      this.service.post(`apply/leave`,leaveData).subscribe((res: any) => {
       if (res.status === 'success') {
        this.toastr.success('Leave Added !!!');
        this.leaveForm.reset();
        const modalElement = document.getElementById('applyLeaveModal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
          }
       }
       else {
        console.log(res.error)
       }
      });
    }
  }

  // advance salary request
  applyAdvanceSalaryRequest() {
    console.log('called')
    this.isAdvanceSalary = true;
    if (this.advanceSalaryForm.valid) {
      const advanceSalaryData = {
        employee_id: this.employeeId,
        advance_amount: this.advanceSalaryForm.value.amount,
        tenure: this.advanceSalaryForm.value.tenure,
        emi: this.installmentAmount,
        remarks: this.advanceSalaryForm.value.reason,
      };
      console.log('advanceSalaryData', advanceSalaryData);
      this.service.post(`apply/advancesaraly`,advanceSalaryData).subscribe((res: any) => {
       if (res.status === 'success') {
        this.toastr.success(' Request Added !!!');
        const modalElement = document.getElementById('advanceSalaryModal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
          }
       }
       else {
        console.log(res.error)
       }
      });
    }
    // if (this.advanceSalaryForm.valid) {
    //   const formData = {
    //     ...this.advanceSalaryForm.value,
    //     installmentAmount: this.installmentAmount
    //   };
    //   console.log('Advance Salary Request Submitted:', formData);
    //   this.router.navigate(['/authPanal/EmployeeInDetail']);
    //   //  API here
    // }
    // else {
    //   // this.advanceSalaryForm.markAllAsTouched();
    //   this.toastr.error(' Invalid credentials !');
    // }

  }


}
