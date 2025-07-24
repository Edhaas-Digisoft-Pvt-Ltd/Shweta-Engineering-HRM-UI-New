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
declare var bootstrap: any;

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

  // rejectreasons=[
  //   {value:1, name:'leaves'},
  //   {value:2, name:'OverTime'},
  // ];
  selectedRejectedReason: string = '';
  otherReason: string = '';

  showReasonError: boolean = false;
  showOtherReasonError: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) {
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
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];

    this.route.queryParams.subscribe(params => {
      this.employee_id = params['id'];
      this.tempPayrollId = params['temp_payroll_id']
      console.log('Received employee  payroll:', this.employee_id );
      console.log('tempPayrollId:', this.tempPayrollId );
    });
    this.getSinglePayroll()
    this.setMonthGroupHeader();
    // this.columnDefs2= this.generateColumns(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep','oct','nov','dec']);
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
    this.service.post('get/single/payroll_list', { employee_id: this.employee_id }).subscribe((res: any) => {
      if (res.status == 'success') {
        this.employeeDetails = res.data.payroll_summary[0];
        const attendanceData = res.data.attendance_summary[0];
        this.AdvanceSalaryDetails = res.data.advance_salary.length > 0 ? res.data.advance_salary[0] : null;
        this.hasAdvanceSalary = !!this.AdvanceSalaryDetails;
        this.calculationData = res.data.calculation[0];

        this.payrollDetails.patchValue({
          id: this.employeeDetails.employee_code,
          employeeName: this.employeeDetails.emp_name,
          companyName: this.employeeDetails.company_name,
        });

        this.attendanceDetails = [
          {
            P: parseInt(attendanceData.present_days),
            A: parseInt(attendanceData.absent_days),
            W: parseInt(attendanceData.weekend),
            W_Od: parseInt(attendanceData.weekend_od),
            H: parseInt(attendanceData.holiday_days),
            WFH_2: parseInt(attendanceData.work_from_home_half_day),
            HD: parseInt(attendanceData.half_day),
            HR: parseInt(attendanceData.total_days),
            OT: parseInt(attendanceData.total_overtime),
            LT: parseInt(attendanceData.late),
            TH: parseInt(attendanceData.total_days),
          }
        ]

        if (res.data.prvadvancesalary.length > 0) {
          this.prevAdvanceSalaryDetails = res.data.prvadvancesalary[0];
          this.rowData = [{
            emp_name: this.prevAdvanceSalaryDetails.emp_name,
            first_InstallmentDate: this.prevAdvanceSalaryDetails.first_InstallmentDate,
            last_InstallmentDate: this.prevAdvanceSalaryDetails.last_InstallmentDate || '-',
            tenure: this.prevAdvanceSalaryDetails.tenure,
            advance_amount: this.prevAdvanceSalaryDetails.advance_amount,
            status: this.prevAdvanceSalaryDetails.status,
          }];
        } else {
          this.rowData = [];
        }

        this.deduct = [
          {
            Compound: 'Provident Fund (PF)',
            deduction: 'Fixed %',
            amount: '₹. 0'
          },

          {
            Compound: 'Professional Tax (PT)',
            deduction: 'Tax Deduction',
            amount: `₹. ${this.calculationData.total_tax_deduction ?? 0}`
          },

          {
            Compound: 'ESIC',
            deduction: 'Fixed %',
            amount: '₹. 0'
          },
          {
            Compound: 'Advance Salary',
            deduction: 'Advance Deduction',
            amount: `₹. ${this.calculationData.advance_amount ?? 0}`
          },
          {
            Compound: 'Other',
            deduction: 'lorem',
            amount: '₹. 0',
          },
        ];

      }
    })
  }

  formatted(value: number): string {
    return value.toLocaleString('en-IN');
  }

  calculateProgress(): number {
    if (!this.AdvanceSalaryDetails) return 0;
    const paid = this.AdvanceSalaryDetails.advance_amount - this.AdvanceSalaryDetails.remaining_balance;
    return Math.round((paid / this.AdvanceSalaryDetails.advance_amount) * 100);
  }

  backtoPayroll() {
    this.router.navigate(['/authPanal/payrollList']);
  }
  // deduct = [
  //   {
  //     Compound: 'provident found (PF)',
  //     deduction: 'lorem',
  //     amount: 'Rs. 1000',
  //   },
  //   {
  //     Compound: 'Professional Tax (PT)',
  //     deduction: 'lorem',
  //     amount: 'Rs. 1000',
  //   },

  //   {
  //     Compound: 'ESIC Employee 0.75%',
  //     deduction: 'lorem',
  //     amount: 'Rs.0',
  //   },
  //   {
  //     Compound: 'Provident Fund(Employer) (EPF)',
  //     deduction: 'lorem',
  //     amount: 'Rs. 1000',
  //   },
  //   {
  //     Compound: 'Advance Salary',
  //     deduction: 'lorem',
  //     amount: 'Rs. 0',
  //   },
  //   {
  //     Compound: 'Other',
  //     deduction: 'lorem',
  //     amount: 'Rs. 0',
  //   },
  // ];

  columnDefs: ColDef[] = [
    //  {
    //   headerName: 'Employee Id',
    //   field: 'employee_id',
    //   sortable: true,
    //   filter: true,
    //   flex: 1,
    //   maxWidth:250,
    // },
    {
      headerName: 'First Installment Date',
      field: 'first_InstallmentDate',
      sortable: true,
      filter: true,
      flex: 1,
      maxWidth: 260,
    },
    {
      headerName: 'Installment End Date',
      field: 'last_InstallmentDate',
      sortable: true,
      filter: true,
      flex: 1,
      maxWidth: 280,
    },
    {
      headerName: 'Tenure',
      field: 'tenure',
      sortable: true,
      filter: true,
      flex: 1,
      maxWidth: 130,
    },
    {
      headerName: 'Amount',
      field: 'advance_amount',
      sortable: true,
      filter: true,
      flex: 1,
      maxWidth: 130,
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      flex: 1,
      maxWidth: 120,
    },
    {
      headerName: 'Actions',
      // field: 'inquiry_id',
      cellStyle: { border: '1px solid #ddd' },
      maxWidth: 120,
      cellRenderer: PayrollSummariesBtnComponent,
      cellRendererParams: {
        // clickedEdit: (field: any) => this.getqutation(field),
        // clickedView: (field: any) => this.viewqutation(field),
        // quotationEdit: (field: any) => this.editqutation(field),
      },
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
          { headerName: 'W', field: 'W' },
          { headerName: 'W/Od', field: 'W_Od' },
          { headerName: 'H', field: 'H' },
          { headerName: 'WFH/2', field: 'WFH_2' },
          { headerName: 'HD', field: 'HD' },
          { headerName: 'HR', field: 'HR' },
          { headerName: 'OT', field: 'OT' },
          { headerName: 'LT', field: 'LT' },
          { headerName: 'TH', field: 'TH' },
        ],
      },
    ];
  }

  defaultColDef: ColDef = {
    width: 100,
    resizable: true,
    cellStyle: { textAlign: 'center' }
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

    if (!this.selectedRejectedReason) {
      this.showReasonError = true;
      return;
    }

    if (this.selectedRejectedReason === 'Other' && (!this.otherReason || this.otherReason.trim() === '')) {
      this.showOtherReasonError = true;
      return;
    }

    this.service.post('rejected/payroll',  {temp_payroll_id: this.tempPayrollId, rejection_id: this.selectedRejectedReason}).subscribe((res: any) => {
      if(res.status == 'success'){
        this.toastr.success('Payroll rejected successfully');
        this.closeAllModals();
        this.router.navigate(['/authPanal/payrollList']);
      }
      else{
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
}
