import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payroll-process',
  templateUrl: './payroll-process.component.html',
  styleUrls: ['./payroll-process.component.css'],
})
export class PayrollProcessComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  CompanyNames: any = [];
  selectedCompanyId: any = 1;
  selectedYear: any;
  selectedMonth: any;
  rowData: any = [];
  selectedRowData: any[] = [];
  tempRowData: any[] = [];
  gridApiActive!: GridApi;
  gridApiTemp!: GridApi;
  activeTab: string = 'tab1';
  isProcess: any = false;
  columnDefs: ColDef[] = [];
  tempColumnDefs: ColDef[] = [];
  selectedEmployee: any = null;

  today: string = new Date().toISOString().split('T')[0];
  constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) { }

  rowSelection: string = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

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
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    this.getCompanyNames();
    this.getPayrollProcess();
    this.initializeColumns();
    this.initializeColumnsforProcess();
    this.getTempPayroll();
  }

  getMonthName(monthId: number): string {
    const month = this.months.find(m => m.id === monthId);
    return month ? month.value : '';
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data;
      }
    }, (error) => {
      console.error('Error fetching companies:', error);
    });
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.getPayrollProcess();
    this.getTempPayroll();
  }

  onYearMonthChange() {
    this.getPayrollProcess();
    this.getTempPayroll();
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  onTempGridReady(params: { api: any }) {
    this.gridApiTemp = params.api;
  }

  getPayrollProcess() {
    this.rowData = [];
    this.service.post('fetch/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
    }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.rowData = res.data.map((item: any) => ({
          employeeName: item.emp_name,
          department: item.department_name,
          role: item.role_name,
          presentDays: item.present_days,
          absentDays: item.absent_days,
          hours: item.total_hours,
          overTime: item.total_overtime,
          employe_id: item.employe_id,
        }));
      }
    });
  }

  getTempPayroll() {
    const payload = {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth
    };

    this.service.post('fetch/temp/payroll', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data && res.data.length > 0) {
          this.isProcess = true;
          this.tempRowData = res.data.map((item: any) => ({
            emp_name: item.emp_name,
            department_name: item.department_name,
            present_days: item.present_days,
            absent_days: item.absent_days,
            total_hours: item.total_hours,
            total_overtime: item.total_overtime ?? '-',
            employe_id: item.employe_id,
            bonus_incentive_amount: item.bonus_incentive_amount ?? '-',
            advance_salary: item.advance_salary ?? '-',
            net_salary: item.net_salary,
          }));
        }
        else {
          this.isProcess = false;
          this.tempRowData = [];
        }
      },
      error: () => {
        this.isProcess = false;
        this.tempRowData = [];
      }
    });
  }

  generatePayroll() {
    const payrolls = this.rowData.map((emp: any) => ({
      employee_id: emp.employe_id,
      year: this.selectedYear,
      month: this.selectedMonth
    }));

    const payload = { payrolls };

    this.service.post('craete/temp/payroll', payload).subscribe({
      next: () => {
        this.toastr.success('Temporary payroll created.');
        this.getTempPayroll();
      },
      error: () => {
        this.toastr.error('Failed to create temp payroll.');
      }
    });
  }

  processPayroll() {
    if (!this.tempRowData || this.tempRowData.length === 0) {
      this.toastr.warning('No employee data available.');
      return;
    }

    const payrolls = this.tempRowData.map((emp: any) => ({
      employee_id: emp.employe_id,
      year: this.selectedYear,
      month: this.selectedMonth
    }));

    const payload = { payrolls };

    this.service.post('craete/payroll', payload).subscribe({
      next: () => {
        this.toastr.success('Payroll processed successfully.');
        this.getPayrollProcess();
        this.getTempPayroll();
      },
      error: () => {
        this.toastr.error('Failed to process payroll.');
      }
    });
  }


  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Name', field: 'employeeName', sortable: true, filter: true },
      { headerName: 'Department', field: 'department', sortable: true, filter: true },
      { headerName: 'Role', field: 'role', sortable: true, filter: true },
      { headerName: 'Present Days', field: 'presentDays', sortable: true, filter: true },
      { headerName: 'Absent', field: 'absentDays', sortable: true, filter: true },
      { headerName: 'hours', field: 'hours', sortable: true, filter: true },
      { headerName: 'OT', field: 'overTime', sortable: true, filter: true },
    ];
  }

  initializeColumnsforProcess() {
    this.tempColumnDefs = [
      { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true },
      { headerName: 'Department', field: 'department_name', sortable: true, filter: true },
      { headerName: 'PD', field: 'present_days', sortable: true, filter: true },
      { headerName: 'A', field: 'absent_days', sortable: true, filter: true },
      { headerName: 'Hrs', field: 'total_hours', sortable: true, filter: true },
      { headerName: 'OT', field: 'total_overtime', sortable: true, filter: true },
      { headerName: 'B&I', field: 'bonus_incentive_amount', sortable: true, filter: true },
      { headerName: 'Adv Salary', field: 'advance_salary', sortable: true, filter: true },
      { headerName: 'Net Salary', field: 'net_salary', sortable: true, filter: true },
      {
        headerName: 'Action',
        minWidth: 100,
        cellStyle: { border: '1px solid #ddd' },
        cellRenderer: () => {
          return `<button type="button" class="btn btn-sm mb-1 import-btn" style="background-color:#C8E3FF">
                    <i class="bi bi-pencil"></i>
                  </button>`;
        },
        onCellClicked: (params: any) => {
          this.selectedEmployee = params.data;
          this.fileInput.nativeElement.click(); 
        }
      }
    ];
  }

  gridOptions = {
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
  };
  tempGridOptions = {
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
  };



  onSelectionChanged(event: any): void {
    this.selectedRowData = event.api.getSelectedRows();
  }

  create_user() {
    this.router.navigate(['/authPanal/CreateEmployee']);
  }

  exportExcel() {
    if (this.gridApiActive) {
      this.gridApiActive.exportDataAsCsv();
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('upload_file', file);

    this.service.post('import-attendance', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success(res.data);
        this.getPayrollProcess();
      } else {
        console.log(res.error);
      }
    });

    this.fileInput.nativeElement.value = '';
  }
}
