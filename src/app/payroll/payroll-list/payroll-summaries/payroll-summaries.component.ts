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
import { AdvanceSalaryBtnComponent } from './advance-salary-btn/advance-salary-btn.component';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-payroll-summaries',
  templateUrl: './payroll-summaries.component.html',
  styleUrls: ['./payroll-summaries.component.css'],
})
export class PayrollSummariesComponent {
  payrollDetails!: FormGroup;
  employee_id : any;
  employeeDetails : any;
  attendanceDetails : any;
  selectedYear: any;
  selectedMonth: any;
  today: string = new Date().toISOString().split('T')[0];

  constructor(private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private service: HrmserviceService) {
    this.payrollDetails = this.formBuilder.group({
      id: ['', [Validators.required]],
      employeeName: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      date: ['', [Validators.required]],
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

  ngOnInit() {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];

    this.route.queryParams.subscribe(params => {
      this.employee_id = params['id'];
      console.log('Received employee  payroll:', params['id']);
    });
    this.getSinglePayroll()

    this.columnDefs2= this.generateColumns(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep','oct','nov','dec']);
  }

  getMonthName(monthId: number): string {
    const month = this.months.find(m => m.id === monthId);
    return month ? month.value : '';
  }

  getSinglePayroll() {
    this.service.post('get/single/payroll_list', { employee_id : this.employee_id }).subscribe((res: any) => {
      if(res.status == 'success'){
        this.employeeDetails = res.data.payroll_summary[0];
        this.rowData = res.data.attendance_summary[0];

        this.payrollDetails.patchValue({
          id: this.employeeDetails.employee_code,
          employeeName: this.employeeDetails.emp_name,
          companyName: this.employeeDetails.company_name,
      });
      }
      console.log(this.attendanceDetails)
    })
  }


  backtoPayroll() {
    this.router.navigate(['/authPanal/payrollList']);
  }
  deduct = [
    {
      Compound: 'provident found (PF)',
      deduction: 'lorem',
      amount: 'Rs. 1000',
    },
    {
      Compound: 'Professional Tax (PT)',
      deduction: 'lorem',
      amount: 'Rs. 1000',
    },

    {
      Compound: 'ESIC Employee 0.75%',
      deduction: 'lorem',
      amount: 'Rs.0',
    },
    {
      Compound: 'Provident Fund(Employer) (EPF)',
      deduction: 'lorem',
      amount: 'Rs. 1000',
    },
    {
      Compound: 'Advance Salary',
      deduction: 'lorem',
      amount: 'Rs. 0',
    },
    {
      Compound: 'Other',
      deduction: 'lorem',
      amount: 'Rs. 0',
    },
  ];

  columnDefs: ColDef[] = [
    {
      headerName: 'First Installment Date',
      field: 'date',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Installment End Date',
      field: 'employeeName',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Tenure',
      field: 'companyName',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Amount',
      field: 'grossAmount',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Actions',
      // field: 'inquiry_id',
      cellStyle: { border: '1px solid #ddd' },
      maxWidth: 100,
      cellRenderer: AdvanceSalaryBtnComponent,
      cellRendererParams: {
        // clickedEdit: (field: any) => this.getqutation(field),
        // clickedView: (field: any) => this.viewqutation(field),
        // quotationEdit: (field: any) => this.editqutation(field),
      },
      flex: 1,
    },
  ];
  columnDefs2 = [
    {
      // headerName: 'Athlete Details',
    },
  ];
  generateColumns(fields: string[]) {
    return fields.map((field) => ({
      headerName: field.charAt(0).toUpperCase() + field.slice(1),
      children: [
        {  field:'p', headerName: 'P', maxWidth:50},
        {  field:'a', headerName: 'A', maxWidth:50 },
        {  field:'w', headerName: 'W', maxWidth:50 },
        {  field:'wod', headerName: 'W/od', maxWidth:80 },
        {  field:'h', headerName: 'H', maxWidth:50 },
        {  field:'wfh2', headerName: 'WFH/2', maxWidth:80 },
        {  field:'hd', headerName: 'HD', maxWidth:70 },
        {  field:'hr', headerName: 'HR', maxWidth:70 },
        {  field:'ot', headerName: 'OT', maxWidth:70 },
        {  field:'lt', headerName: 'LT', maxWidth:70 },
        {  field:'th', headerName: 'TH', maxWidth:70 },
      ]
    }));
  }

  onSelectionChanged(event: any): void {
    const selectedRows = event.api.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }
  gridApi!: GridApi;
  selectedColumn: string = '';

  rowData = [
    {
      employeeName: 'Shivani',
      companyName: 'Developer',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      employeeName: 'Hrishikesh',
      companyName: 'Developer',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      employeeName: 'onkar',
      companyName: 'Developer',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
  ];
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
}
