import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-advance-salary-report',
  templateUrl: './advance-salary-report.component.html',
  styleUrls: ['./advance-salary-report.component.css']
})
export class AdvanceSalaryReportComponent {
  searchValue: string = '';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  today: string = new Date().toISOString().split('T')[0];
  displayApprovedData!: FormGroup;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  selectedEmployee: any;
  employees: any = [];
  EditAdvancePaymentData!: any;
  isLoading: boolean = false;
  gridApi: any;
  selectedCompanyId: any = 1;
  CompanyNames: any = [];

  data = [
      {
        "adv_pay_id": 23,
        "employee_id": 14,
        "advance_amount": 2000,
        "tenure": 3,
        "emi": 667,
        "emi_status": null,
        "remaining_balance": 2000,
        "status": "Approved",
        "remarks": "test",
        "apply_date": "2025-07-16",
        "updated_on": "2025-07-16",
        "employee_code": "SEE2025051314",
        "emp_name": "Ms Ankita Patel",
        "department_name": "Accounts",
        "designation_name": "Sr.Accountant"
      },
      {
        "adv_pay_id": 14,
        "employee_id": 14,
        "advance_amount": 10000,
        "tenure": 3,
        "emi": 3333,
        "emi_status": null,
        "remaining_balance": 0,
        "status": "Completed",
        "remarks": "test",
        "apply_date": "2025-02-16",
        "updated_on": "2025-07-16",
        "employee_code": "SEE2025051314",
        "emp_name": "Ms Ankita Patel",
        "department_name": "Accounts",
        "designation_name": "Sr.Accountant"
      },
  ]
selectedAdvpayid: number | null = null;
tabledata: { [key: number]: { date: string; EMI: string; status: string }[] } = {
  23: [
    { date: '2025-10-07', EMI: '666', status: 'Pending' },
    { date: '2025-09-07', EMI: '666', status: 'Pending' },
    { date: '2025-08-07', EMI: '666', status: 'Pending' },
  ],
  14: [
    { date: '2025-05-07', EMI: '3333', status: 'Paid' },
    { date: '2025-04-07', EMI: '3333', status: 'Paid' },
    { date: '2025-03-07', EMI: '3333', status: 'Paid' },
  ]
};



  years = [2023, 2024, 2025];
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

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    this.getCompanyNames();
    this.initializeColumns()
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.displayApprovedData = this.fb.group({
      id: [{ value: '', disabled: true }],
      employeeName: [{ value: '', disabled: true }],
      company: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      requestData: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }],
      tenure: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      reason: [{ value: '', disabled: true }],
      EMIStartDate: [{ value: '', disabled: true }],
      installmentAmount: [{ value: '', disabled: true }],
    })
  }

  onYearMonthChange() {
    this.searchEmployeeAdvanceSalary();
  }

  searchEmployeeAdvanceSalary() {
    this.rowData = this.data
    // this.rowData = [];
    // const code = this.searchValue?.trim();
    // if (!code) {
    //   this.rowData = [];
    //   this.toastr.error('Please Enter Employee Code');
    //   return;
    // }

    // const payload = {
    //   employee_code: code,
    //   year: this.selectedYear,
    //   month: this.selectedMonth,
    // };

    // this.service.post('emp/advancesaraly/report', payload).subscribe(
    //   (res: any) => {
    //     if (res.status === 'success' && res.data.length > 0) {
    //       this.rowData = res.data;
    //     } else {
    //       this.rowData = [];
    //       this.toastr.warning('Data Not Found');
    //     }
    //   },
    //   (error) => {
    //     this.rowData = [];
    //   if (error.status === 404) {
    //     this.toastr.warning('Data Not Found');
    //   } else {
    //     this.toastr.error(error);
    //   }
    //   }
    // );
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  // getemployees () {
  //    this.service.post('all/employee', {}).subscribe((res: any) => {
  //     console.log(res)
  //     if (res.status == "success") {
  //       this.employees = res.data
  //     }
  //   },
  //     (error) => {
  //       console.error('Error fetching companies:', error);
  //     }
  //   );
  // }

  emptyInput() {
    this.searchValue = '';
    window.location.reload();
  }

  public defaultColDef: ColDef = {
    editable: true,
    resizable: true,
  };

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
    }

    return button;
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, maxWidth: 150 },
      { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true, maxWidth: 180 },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true, maxWidth: 150 },
      { headerName: 'Adv. Amount', field: 'advance_amount', sortable: true, filter: true, maxWidth: 150 },
      { headerName: 'Remaining Amount', field: 'remaining_balance', sortable: true, filter: true, maxWidth: 190 },
      { headerName: 'EMI', field: 'emi', sortable: true, filter: true, maxWidth: 100 },
      {
        headerName: 'Status', field: 'status', sortable: true, filter: true, maxWidth: 150,
        cellRenderer: this.statusButtonRenderer,
      },
    ];
    this.columnDefs.push({
      headerName: 'Actions',
      maxWidth: 120,
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-sm mb-1" data-bs-toggle="modal" data-bs-target="#salaryReport" style="background-color:#C8E3FF">
          <i class="bi bi-eye "></i>
        </button>`;
      },
      onCellClicked: (event: any) => {
        this.getSingleAdvanceSalary(event.data.adv_pay_id);
      },
    });
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
  }

  getSingleAdvanceSalary(data: any) {
    this.selectedAdvpayid = data
    this.service.post('single/advancesaraly', { adv_pay_id: data }).subscribe((res: any) => {
      if (res.status === 'success') {
        const singleAdvanceSalary = res.data[0];
        this.EditAdvancePaymentData = {
          id: singleAdvanceSalary?.employee_code,
          employeeName: singleAdvanceSalary?.emp_name,
          company: singleAdvanceSalary?.company_name,
          department: singleAdvanceSalary?.department_name,
          role: singleAdvanceSalary?.designation_name,
          requestData: singleAdvanceSalary?.apply_date,
          status: singleAdvanceSalary?.status,
          tenure: singleAdvanceSalary?.tenure,
          amount: singleAdvanceSalary?.advance_amount,
          reason: singleAdvanceSalary?.remarks,
          EMIStartDate: singleAdvanceSalary?.updated_on,
          installmentAmount: singleAdvanceSalary?.emi,
        }
        this.displayApprovedData.patchValue(this.EditAdvancePaymentData);
      }
    })
  }

  calculatePaidAmount(): number {
    const total = +this.displayApprovedData.get('amount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    return total - remaining;
  }

}
