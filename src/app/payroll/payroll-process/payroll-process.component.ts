import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { PayrollActionBtnComponent } from '../payroll-list/payroll-action-btn/payroll-action-btn.component';

@Component({
  selector: 'app-payroll-process',
  templateUrl: './payroll-process.component.html',
  styleUrls: ['./payroll-process.component.css'],
})
export class PayrollProcessComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  CompanyNames: any = [];
  selectedCompany: string = '';
  selectedCompanyId: any
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
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

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
    console.log(this.isProcess);

    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth();
    this.getCompanyNames();
    this.initializeColumns();
    this.initializeColumnsforProcess();
    // this.getTempPayroll();

    // this.getPagination();

    if (sessionStorage.getItem('roleName') == 'Accountant') {
      this.router.navigate(['/authPanal/payrollProcess']);
      return;
    } else {
      alert('Please Login To Proceed');
      sessionStorage.clear();
      this.router.navigate(['']);
      return;
    }
  }

  getMonthName(monthId: number): string {
    const month = this.months.find(m => m.id === monthId);
    return month ? month.value : '';
  }

  selectCompany(company: any) {
    this.selectedCompany = company.company_name;
    this.selectedCompanyId = company.company_id;
    this.service.setCompanyId(this.selectedCompanyId);
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.CompanyNames = res.data;

        // Always pick first company for accountant
        if (this.CompanyNames.length > 0) {
          const defaultCompany = this.CompanyNames[0];
          this.service.setCompanyId(defaultCompany.company_id);
          this.selectCompany(defaultCompany);

          this.getPayrollProcess();
          this.getTempPayroll();
        } else {
          this.toastr.warning('No companies found for this account.');
        }
      } else {
        this.toastr.error('Failed to load company list.');
      }
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
    this.getPayrollProcess();
    this.getTempPayroll();
  }

  onTempGridReady(params: { api: any }) {
    this.gridApiTemp = params.api;
  }

  //generatetab
  getPayrollProcess(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('fetch/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      // page: page,
      isexport: false,
    }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.rowData = res.data.map((item: any) => ({
          employee_code: item.employee_code,
          emp_name: item.emp_name,
          department: item.department_name,
          role: item.role_name,
          presentDays: item.present_days,
          absentDays: item.absent_days,
          total_hours: item.total_hours,
          overTime: item.total_overtime,
          employe_id: item.employe_id,
        }));
        // this.totalRows = res.pagination.total;
        // this.currentPage = res.pagination.page;
        // this.lastPage = res.pagination.last_page;
        // this.generatePageNumbers(this.paginationvalue);
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      if (error.status === 404) {
        // this.toastr.warning('Data Not Found');
        this.isLoading = false;
      } else {
        console.error(error);
        this.isLoading = false;
      }
    })
  }

  //processtab
  getTempPayroll(page: number = 1): void {
    this.isLoading = true;
    const payload = {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
    };

    this.service.post('fetch/temp/payroll', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data && res.data.length > 0) {
          this.isProcess = true;
          this.tempRowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            emp_name: item.emp_name,
            department_name: item.department_name,
            present_days: item.present_days,
            absent_days: item.absent_days,
            total_hours: item.total_hours,
            total_overtime: item.total_overtime ?? 'NA',
            employe_id: item.employe_id,
            bonus_amount: item.bonus_amount ? `₹ ${item.bonus_amount}` : 'NA',
            adv_deduction: item.adv_deduction ? `₹ ${item.adv_deduction}` : 'NA',
            net_salary: item.net_salary ? `₹ ${item.net_salary}` : 'NA',
          }));
          // this.totalRows = res.pagination.total;
          // this.currentPage = res.pagination.page;
          // this.lastPage = res.pagination.last_page;
          // this.generatePageNumbers(this.paginationvalue);
        }
        else {
          this.isProcess = false;
          this.tempRowData = [];
          this.getPayrollProcess();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isProcess = false;
        this.tempRowData = [];
        this.getPayrollProcess();
        this.isLoading = false;
      }
    });
  }

  generatePayroll() {
    this.isLoading = true;
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
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Invalid or empty payroll data submitted.');
        this.isLoading = false;
      }
    });
  }

  // processPayroll() {
  //   if (!this.tempRowData || this.tempRowData.length === 0) {
  //     this.toastr.warning('Data Not Available.');
  //     return;
  //   }

  //   const payrolls = this.tempRowData.map((emp: any) => ({
  //     employee_id: emp.employe_id,
  //     year: this.selectedYear,
  //     month: this.selectedMonth
  //   }));

  //   const payload = { payrolls };

  //   this.service.post('craete/payroll', payload).subscribe({
  //     next: () => {
  //       this.toastr.success('Payroll processed successfully.');
  //       this.getPayrollProcess();
  //       this.getTempPayroll();
  //     },
  //     error: () => {
  //       this.toastr.error('Failed to process payroll.');
  //     }
  //   });
  // }

  processPayroll() {
    this.isLoading = true;
    const payrolls = this.tempRowData.map((emp: any) => ({
      employee_id: emp.employe_id,
      year: this.selectedYear,
      month: this.selectedMonth
    }));
    const payload = { payrolls };
    this.service.post('craete/payroll', payload).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success('Payroll processed successfully.');
        this.getTempPayroll();
        this.isLoading = false;
      } else {
        this.toastr.error('Something went wrong');
        this.isLoading = false;
      }
    })
  }


  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true },
      { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true },
      { headerName: 'Role', field: 'role', sortable: true, filter: true },
      { headerName: 'Present Days', field: 'presentDays', sortable: true, filter: true },
      { headerName: 'Absent', field: 'absentDays', sortable: true, filter: true, },
      // { headerName: 'Total hrs', field: 'total_hours', sortable: true, filter: true, },
      { headerName: 'OT(hrs)', field: 'overTime', sortable: true, filter: true, },
    ];
  }

  initializeColumnsforProcess() {
    this.tempColumnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, minWidth: 160 },
      { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true, minWidth: 140 },
      { headerName: 'P', field: 'present_days', sortable: true, filter: true },
      { headerName: 'A', field: 'absent_days', sortable: true, filter: true },
      { headerName: 'OT(hrs)', field: 'total_overtime', sortable: true, filter: true },
      { headerName: 'Hrs', field: 'total_hours', sortable: true, filter: true },
      { headerName: 'Bonus', field: 'bonus_amount', sortable: true, filter: true },
      { headerName: 'Adv Salary', field: 'adv_deduction', sortable: true, filter: true },
      { headerName: 'Net Salary', field: 'net_salary', sortable: true, filter: true },
      // {
      //   headerName: 'Actions',
      //   minWidth: 100,
      //   cellStyle: { border: '1px solid #ddd' },
      //   cellRenderer: () => {
      //     return `<button type="button" class="btn btn-sm mb-1 import-btn" style="background-color:#C8E3FF">
      //               <i class="bi bi-pencil"></i>
      //             </button>`;
      //   },
      //   onCellClicked: (params: any) => {
      //     this.selectedEmployee = params.data;
      //     this.fileInput.nativeElement.click();
      //   }
      // }
      {
        headerName: 'Actions',
        // field: 'inquiry_id',
        cellStyle: { border: '1px solid #ddd' },
        cellRenderer: PayrollActionBtnComponent,
        cellRendererParams: {
          viewEmployee: (field: any) => this.editApp(field),
        },
        flex: 1

      },
    ];
  }
  
  editApp(params: any) {
    console.log("editApp", params);
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
    this.isLoading = true;

    const apiUrl = this.isProcess ? 'fetch/temp/payroll' : 'fetch/payroll';
    const payload = {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      isexport: true
    };

    this.service.post(apiUrl, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data.length) {

          const rows = this.isProcess
            ? res.data.map((r: any) => [
              r.employee_code,
              r.emp_name,
              r.department_name,
              r.designation_name,
              r.role_name,
              r.present_days,
              r.absent_days,
              r.total_hours,
              r.total_overtime,
              r.bonus_amount ?? 0,
              r.adv_deduction ?? 0,
              r.net_salary ?? 0
            ])
            : res.data.map((r: any) => [
              r.employee_code,
              r.emp_name,
              r.department_name,
              r.designation_name,
              r.role_name,
              r.present_days,
              r.absent_days,
              r.total_hours,
              r.total_overtime
            ]);

          const headers = this.isProcess
            ? ['Employee Code', 'Employee Name', 'Department', 'Designation', 'Role', 'Present Days', 'Absent Days', 'Total Hours', 'Overtime', 'Bonus', 'Advance Deduction', 'Net Salary']
            : ['Employee Code', 'Employee Name', 'Department', 'Designation', 'Role', 'Present Days', 'Absent Days', 'Total Hours', 'Overtime'];

          const csvArray: string[][] = [headers, ...rows];
          const csv = csvArray
            .map(row => row.map(v => `"${v ?? ''}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: this.isProcess
              ? 'Processed_Payroll.csv'
              : 'Generated_Payroll.csv'
          });
          link.click();

          this.toastr.success('Payroll data exported successfully!');
        } else {
          this.toastr.warning('No data found to export.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.warning('No data found to export');
        } else {
          this.toastr.error('Error while exporting data');
        }
        this.isLoading = false;
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('upload_file', file);

    this.service.post('import/attendance', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success(res.data);
        this.getTempPayroll();
      } else {
        console.log(res.error);
      }
    });

    this.fileInput.nativeElement.value = '';
  }

  // getPagination() {
  //   this.service.post('get-pagination', {}).subscribe((res: any) => {
  //     if (res.status === 'success') {
  //       this.paginationvalue = res.data;
  //       this.getTempPayroll();
  //     } else {
  //       this.paginationvalue = 10;
  //       this.getTempPayroll();
  //     }
  //   });
  // }

  // getpaginationvalue() {
  //   this.service.post('get-pagination', {}).subscribe((res: any) => {
  //     if (res.status === 'success') {
  //       this.paginationvalue = res.data
  //       this.generatePageNumbers(this.paginationvalue)
  //     }
  //   });
  // }

  // generatePageNumbers(pageWindow: number) {
  //   const total = this.lastPage;
  //   const current = this.currentPage;
  //   let startPage = current;
  //   let endPage = current + pageWindow - 1;
  //   if (endPage >= total) {
  //     endPage = total - 1;
  //     startPage = Math.max(2, total - pageWindow);
  //   }

  //   if (current === 1) {
  //     startPage = 2;
  //     endPage = Math.min(total - 1, pageWindow);
  //   }
  //   const pages: (number | string)[] = [];
  //   pages.push(1);
  //   if (startPage > 2) {
  //     pages.push('...');
  //   }
  //   for (let i = startPage; i <= endPage; i++) {
  //     pages.push(i);
  //   }
  //   if (endPage < total - 1) {
  //     pages.push('...');
  //   }
  //   if (total > 1) pages.push(total);
  //   this.pagesToShow = pages;
  // }


  // goToPage(page: number | string) {
  //   if (page === '...') return;
  //   if (page !== this.currentPage) {
  //     this.currentPage = page as number;
  //     if (this.isProcess === false) {
  //       this.getPayrollProcess(this.currentPage);
  //     }
  //     if (this.isProcess === true) {
  //       this.getTempPayroll(this.currentPage);
  //     }
  //   }
  // }

  // prevPage() {
  //   if (this.currentPage > 1) {
  //     this.currentPage--;
  //     if (this.isProcess === false) {
  //       this.getPayrollProcess(this.currentPage);
  //     }
  //     if (this.isProcess === true) {
  //       this.getTempPayroll(this.currentPage);
  //     }
  //   }
  // }

  // nextPage() {
  //   if (this.currentPage < this.lastPage) {
  //     this.currentPage++;
  //     if (this.isProcess === false) {
  //       this.getPayrollProcess(this.currentPage);
  //     }
  //     if (this.isProcess === true) {
  //       this.getTempPayroll(this.currentPage);
  //     }
  //   }
  // }
}
