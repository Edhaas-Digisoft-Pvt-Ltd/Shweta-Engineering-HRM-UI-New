import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
// import { EmployeeActionComponent } from '../employee-action/employee-action.component';
import { PayrollActionBtnComponent } from './payroll-action-btn/payroll-action-btn.component';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.css'],
})
export class PayrollListComponent {
  CompanyNames: any = [];
  selectedCompanyId: any;
  selectedYear: any;
  selectedMonth: any;
  rowData: any = [];
  selectedRowData: any[] = [];
  activeTab: string = 'tab1';
  isRejectConfirmed: boolean = false;
  randomText: string = '';
  codeInput: string = '';
  gridApi: any;
  gridColumnApi: any;
  isLoading: boolean = false;

  today: string = new Date().toISOString().split('T')[0];
  constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) { }

  rowSelection: string = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  // financialYears = [2022, 2023, 2024, 2025];
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

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnInit() {
    this.selectedCompanyId = this.service.selectedCompanyId();

    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.getCompanyNames();
    this.getpayrollList();
  }

  getMonthName(monthId: number): string {
    const month = this.months.find(m => m.id === monthId);
    return month ? month.value : '';
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
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.getpayrollList();
  }

  onYearMonthChange() {
    this.getpayrollList();
  }

  getpayrollList() {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('get/payroll_list', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
    }).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data?.length > 0) {
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            employeeName: item.emp_name,
            grossAmount: item.gross_salary ? `₹ ${item.gross_salary}` : 'NA',
            overTime: item.total_overtime,
            netAmount: item.net_salary ? `₹ ${item.net_salary}` : 'NA',
            deduction: item.deduction ? `₹ ${item.deduction}` : 'NA',
            employe_id: item.employe_id,
            temp_payroll_id: item.temp_payroll_id
          }));
        } else {
          this.rowData = [];
          this.toastr.warning('Data Not Found');
        }
      } catch (error) {
        console.log(error);
        this.rowData = [];
      }
    },
      (error) => {
        this.isLoading = false;
        this.rowData = [];
        if (error.status === 404) {
          this.toastr.warning('Data Not Found');
        } else {
          console.error(error);
        }
      });
    this.isLoading = false;
  }


  columnDefs: ColDef[] = [
    {
      headerName: '',
      maxWidth: 50,
      checkboxSelection: true, // Enables checkbox selection on rows
      headerCheckboxSelection: true, // Optional: if you want to select/unselect all
    },
    {
      headerName: 'Employee Code',
      field: 'employee_code',
      sortable: true,
      filter: true,
      maxWidth: 180,
    },
    {
      headerName: 'Employee Name',
      field: 'employeeName',
      sortable: true,
      filter: true,
      maxWidth: 230,
    },

    {
      headerName: 'Gross Amount',
      field: 'grossAmount',
      sortable: true,
      filter: true,
      maxWidth: 170
    },
    {
      headerName: 'OT(hrs)',
      field: 'overTime',
      sortable: true,
      filter: true,
      maxWidth: 130

    },
    {
      headerName: 'Deductions',
      field: 'deduction',
      sortable: true,
      filter: true,
      maxWidth: 140
    },
    {
      headerName: 'Net Amount',
      field: 'netAmount',
      sortable: true,
      filter: true,
      maxWidth: 140,
      // flex:1
    },

    {
      headerName: 'Actions',
      // field: 'inquiry_id',
      cellStyle: { border: '1px solid #ddd' },
      maxWidth: 100,
      cellRenderer: PayrollActionBtnComponent,
      cellRendererParams: {
        viewEmployee: (field: any) => this.editApp(field),
        // clickedEdit: (field: any) => this.getqutation(field),
        // clickedView: (field: any) => this.viewqutation(field),
        // quotationEdit: (field: any) => this.editqutation(field),
      },
      flex: 1

    },
  ];

  editApp(params: any) {
    console.log("editApp", params);
  }

  // onSelectionChanged(event: any): void {
  //   const selectedRows = event.api.getSelectedRows();
  //   console.log('Selected rows:', selectedRows);
  // }

  onSelectionChanged(event: any): void {
    this.selectedRowData = event.api.getSelectedRows();
    console.log('Selected rows:', this.selectedRowData);
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

  approvePayrollList() {
    if (this.selectedRowData.length === 0) {
      this.toastr.warning('Please select at least one employee.');
      return;
    }

    const temp_payroll_ids = this.selectedRowData.map((emp: any) => ({
      temp_payroll_id: emp.temp_payroll_id

    }));
    const payload = { temp_payroll_ids };
    console.log('payloadArray', payload)
    this.service.post("approved/payroll", payload).subscribe({
      next: (res) => {
        console.log(res);
        this.toastr.success('Payrolls approved successfully.');
        this.getpayrollList();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to update status.');
      }
    });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }


  onRejectAllClick() {
    this.gridApi.selectAll();
    this.selectedRowData = this.gridApi.getSelectedRows();



    this.isRejectConfirmed = false;
    this.codeInput = '';
    this.randomText = this.generaterandomText();


  }

  generaterandomText(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }


  canSubmitRejectAll(): boolean {
    return this.isRejectConfirmed && this.codeInput === this.randomText;
  }

  submitRejectAll() {
    const payrolls = this.selectedRowData.map(emp => ({
      employee_id: emp.employe_id,
      year: this.selectedYear,
      month: this.selectedMonth,
      payroll_status: 'Rejected'
    }));

    const payload = { payrolls };
    console.log(payload)

    this.service.post('reject/all', payload).subscribe({
      next: (res) => {
        this.toastr.success('All payroll rejected successfully.');
        this.getpayrollList();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to reject payroll.');
      }
    });
  }

  exportExcel() {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        columnKeys: ['employee_code', 'employeeName', 'grossAmount', 'overTime', 'deduction', 'netAmount'],
        fileName: 'payrollList.csv',
      });
    }

  }
}


