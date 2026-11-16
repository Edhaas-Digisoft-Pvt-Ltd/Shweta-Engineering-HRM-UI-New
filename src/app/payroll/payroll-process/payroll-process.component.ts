import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { PayrollActionBtnComponent } from '../payroll-list/payroll-action-btn/payroll-action-btn.component';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

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

  // 'time' = attendance based payroll, 'job' = job (die rate) based operators (is_non_time_based)
  payrollType: 'time' | 'job' = 'time';
  genAll: any[] = [];    // all employees ready to generate (both types)
  tempAll: any[] = [];   // all generated (temp) payrolls (both types)
  columnDefs: ColDef[] = [];
  tempColumnDefs: ColDef[] = [];
  selectedEmployee: any = null;
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;
  dataToExportExcel: any[] = [];
  dataToExportExcel_totals: any = {}

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

  // ---- Time based / Job based filter ----
  private matchesType(row: any): boolean {
    const isJob = Number(row.is_non_time_based) === 1;
    return this.payrollType === 'job' ? isJob : !isJob;
  }

  applyTypeFilter() {
    this.rowData = this.genAll.filter((r: any) => this.matchesType(r));
    this.tempRowData = this.tempAll.filter((r: any) => this.matchesType(r));
    this.isProcess = this.tempRowData.length > 0;
  }

  setPayrollType(type: 'time' | 'job') {
    if (this.payrollType === type) return;
    this.payrollType = type;
    this.initializeColumns();
    this.initializeColumnsforProcess();
    this.applyTypeFilter();
  }

  private showFailures(res: any) {
    const failed = (res?.results ?? []).filter((r: any) => r.status !== 'success');
    if (failed.length > 0) {
      const msg = failed.slice(0, 3).map((r: any) => `Emp ${r.employee_id}: ${r.message ?? r.data ?? 'failed'}`).join(' | ');
      this.toastr.warning(`${failed.length} payroll(s) not generated. ${msg}`);
    }
  }

  ngOnInit() {
    // console.log(this.isProcess);
    const savedId = this.service.selectedCompanyId();
    this.selectedCompanyId = (savedId && savedId !== 'all') ? savedId : null;

    // this.selectedYear = new Date().getFullYear();
    // this.selectedMonth = new Date().getMonth();
    // this.selectedYear = 2025;
    // this.selectedMonth = 12;

    const today = new Date();

    //last month
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    this.selectedYear = lastMonthDate.getFullYear();
    this.selectedMonth = lastMonthDate.getMonth() + 1;

    this.today = today.toISOString().split('T')[0];

    this.activeTab = this.hasAccess('Payroll List', 'view') ? 'tab1' : 'tab3';

    this.getCompanyNames();
    this.initializeColumns();
    this.initializeColumnsforProcess();
    // this.getTempPayroll();

    // this.getPagination();

    // if (sessionStorage.getItem('roleName') == 'Accountant') {
    //   this.router.navigate(['/authPanal/payrollProcess']);
    //   return;
    // } else {
    //   alert('Please Login To Proceed');
    //   sessionStorage.clear();
    //   this.router.navigate(['']);
    //   return;
    // }
  }

  hasAccess(module: string, permission: string): boolean {
    return this.service.hasPermission(module, permission);
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

        if (this.CompanyNames.length > 0) {

          // If no valid company, pick first one
          const defaultCompany = (this.selectedCompanyId && this.selectedCompanyId !== 'all')
            ? this.CompanyNames.find((c: any) => c.company_id == this.selectedCompanyId) ?? this.CompanyNames[0]
            : this.CompanyNames[0];

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
    this.genAll = [];
    this.service.post('fetch/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      // page: page,
      isexport: false,
    }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.dataToExportExcel = res.data;
        this.dataToExportExcel_totals = res.totals;
        this.genAll = res.data.map((item: any) => ({
          employee_code: item.employee_code,
          emp_name: item.emp_name,
          department: item.department_name,
          role: item.role_name,
          presentDays: item.present_days,
          absentDays: item.absent_days,
          total_hours: item.total_hours,
          overTime: item.overtime_hrs,
          employe_id: item.employe_id,
          is_non_time_based: item.is_non_time_based,
        }));
        this.applyTypeFilter();
        // this.totalRows = res.pagination.total;
        // this.currentPage = res.pagination.page;
        // this.lastPage = res.pagination.last_page;
        // this.generatePageNumbers(this.paginationvalue);
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.applyTypeFilter();
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
          this.tempAll = res.data.map((item: any) => ({
            is_non_time_based: item.is_non_time_based,
            job_amount: Number(item.is_non_time_based) === 1 ? `₹ ${item.job_amount}` : '-',
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
            misc_expense: item.misc_expense ? `₹ ${item.misc_expense}` : 'NA',        
            misc_deduction: item.misc_deduction ? `₹ ${item.misc_deduction}` : 'NA', 
            net_salary: item.net_salary ? `₹ ${item.net_salary}` : 'NA',
          }));
          this.applyTypeFilter();
          // this.totalRows = res.pagination.total;
          // this.currentPage = res.pagination.page;
          // this.lastPage = res.pagination.last_page;
          // this.generatePageNumbers(this.paginationvalue);
        }
        else {
          this.tempAll = [];
          this.applyTypeFilter();
        }
        this.isLoading = false;
      },
      error: () => {
        this.tempAll = [];
        this.applyTypeFilter();
        this.isLoading = false;
      }
    });
  }

  generatePayroll() {
    if (!this.rowData || this.rowData.length === 0) {
      this.toastr.warning('No employees to generate for this type.');
      return;
    }
    this.isLoading = true;
    // rowData is already filtered by the selected type (time based / job based)
    const payrolls = this.rowData.map((emp: any) => ({
      employee_id: emp.employe_id,
      year: this.selectedYear,
      month: this.selectedMonth
    }));

    const payload = { payrolls };

    this.service.post('craete/temp/payroll', payload).subscribe({
      next: (res: any) => {
        this.showFailures(res);
        this.toastr.success('Temporary payroll created.');
        this.getTempPayroll();
        this.getPayrollProcess();
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
    // tempRowData is already filtered by the selected type
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
        this.getPayrollProcess();
        this.isLoading = false;
      } else {
        this.toastr.error('Something went wrong');
        this.isLoading = false;
      }
    })
  }


  initializeColumns() {
    if (this.payrollType === 'job') {
      this.columnDefs = [
        { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true },
        { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true },
        { headerName: 'Role', field: 'role', sortable: true, filter: true },
      ];
      return;
    }
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true },
      { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true },
      { headerName: 'Role', field: 'role', sortable: true, filter: true },
      { headerName: 'Present Days', field: 'presentDays', sortable: true, filter: true },
      { headerName: 'Absent', field: 'absentDays', sortable: true, filter: true, },
      // { headerName: 'Total hrs', field: 'total_hours', sortable: true, filter: true, },
      // { headerName: 'OT(hrs)', field: 'overTime', sortable: true, filter: true, },
    ];
  }

  initializeColumnsforProcess() {
    if (this.payrollType === 'job') {
      this.tempColumnDefs = [
        { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, minWidth: 160 },
        { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true, minWidth: 140 },
        { headerName: 'Job Amount', field: 'job_amount', sortable: true, filter: true },
        { headerName: 'Adv Salary', field: 'adv_deduction', sortable: true, filter: true },
        { headerName: 'Net Salary', field: 'net_salary', sortable: true, filter: true },
        {
          headerName: 'Actions',
          cellStyle: { border: '1px solid #ddd' },
          cellRenderer: PayrollActionBtnComponent,
          cellRendererParams: {
            viewEmployee: (field: any) => this.editApp(field),
            source: 'process'
          },
          flex: 1
        },
      ];
      return;
    }
    this.tempColumnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, minWidth: 160 },
      { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true, minWidth: 140 },
      { headerName: 'P', field: 'present_days', sortable: true, filter: true },
      { headerName: 'A', field: 'absent_days', sortable: true, filter: true },
      // { headerName: 'OT(hrs)', field: 'total_overtime', sortable: true, filter: true },
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
          source: 'process'
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

  // exportExcel() {
  //   this.isLoading = true;

  //   const apiUrl = this.isProcess ? 'fetch/temp/payroll' : 'fetch/payroll';
  //   const payload = {
  //     company_id: this.selectedCompanyId,
  //     year: this.selectedYear,
  //     month: this.selectedMonth,
  //     isexport: true
  //   };

  //   this.service.post(apiUrl, payload).subscribe({
  //     next: (res: any) => {
  //       if (res.status === 'success' && res.data.length) {

  //         const rows = this.isProcess
  //           ? res.data.map((r: any) => [
  //             r.employee_code,
  //             r.emp_name,
  //             r.department_name,
  //             r.designation_name,
  //             r.role_name,
  //             r.present_days,
  //             r.absent_days,
  //             r.total_hours,
  //             r.total_overtime,
  //             r.bonus_amount ?? 0,
  //             r.adv_deduction ?? 0,
  //             r.net_salary ?? 0
  //           ])
  //           : res.data.map((r: any) => [
  //             r.employee_code,
  //             r.emp_name,
  //             r.department_name,
  //             r.designation_name,
  //             r.role_name,
  //             r.present_days,
  //             r.absent_days,
  //             r.total_hours,
  //             r.total_overtime
  //           ]);

  //         const headers = this.isProcess
  //           ? ['Employee Code', 'Employee Name', 'Department', 'Designation', 'Role', 'Present Days', 'Absent Days', 'Total Hours', 'Overtime', 'Bonus', 'Advance Deduction', 'Net Salary']
  //           : ['Employee Code', 'Employee Name', 'Department', 'Designation', 'Role', 'Present Days', 'Absent Days', 'Total Hours', 'Overtime'];

  //         const csvArray: string[][] = [headers, ...rows];
  //         const csv = csvArray
  //           .map(row => row.map(v => `"${v ?? ''}"`).join(','))
  //           .join('\n');

  //         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  //         const link = Object.assign(document.createElement('a'), {
  //           href: URL.createObjectURL(blob),
  //           download: this.isProcess
  //             ? 'Processed_Payroll.csv'
  //             : 'Generated_Payroll.csv'
  //         });
  //         link.click();

  //         this.toastr.success('Payroll data exported successfully!');
  //       } else {
  //         this.toastr.warning('No data found to export.');
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       if (err.status === 404) {
  //         this.toastr.warning('No data found to export');
  //       } else {
  //         this.toastr.error('Error while exporting data');
  //       }
  //       this.isLoading = false;
  //     }
  //   });
  // }

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

  showLwpColumns: boolean = false;
  exportExcel() {
    if (!this.selectedCompanyId || !this.selectedYear || !this.selectedMonth) {
      this.toastr.warning('Select company, year and month first');
      return;
    }

    this.isLoading = true;

    const apiUrl = this.isProcess
      ? 'fetch/temp/payroll'
      : 'fetch/payroll';

    this.service.post(apiUrl, {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      isexport: true
    }).subscribe((res: any) => {
      this.isLoading = false;

      // export only the selected type (time based / job based)
      const typeRows = (res.data ?? []).filter((r: any) => this.matchesType(r));

      if (res.status === 'success' && typeRows.length > 0) {
        this.dataToExportExcel = typeRows;
        this.dataToExportExcel_totals = this.calcTotals(typeRows);

        if (this.payrollType === 'job') {
          this.generateJobExcel();
        } else if (this.isProcess) {
          // FULL payroll excel (existing)
          this.showLwpColumns = this.dataToExportExcel.some(
            (row: any) => Number(row.leave_without_pay_days) > 0
          );
          this.generateExcel();
        } else {
          // ONLY attendance excel (upto total_hours)
          this.generateAttendanceExcel();
        }

      } else {
        this.toastr.warning('No data to export');
      }
    }, () => {
      this.isLoading = false;
      this.toastr.error('Failed to export');
    });
  }

  // totals for the exported rows (backend totals cover every employee, so recompute per type)
  private calcTotals(rows: any[]): any {
    const sum = (key: string) => rows.reduce((t: number, r: any) => t + Number(r[key] ?? 0), 0);
    return {
      total_overtime_salary: sum('overtime_amount'),
      total_salary: sum('total_salary'),
      total_tax: sum('total_tax_deduction'),
      total_pf_employee: sum('pf_employee_deduction'),
      total_pf_employer: sum('pf_employer_contribution'),
      total_esic: sum('esic_deduction'),
      total_adv_salary: sum('adv_deduction'),
      total_net_salary: sum('net_salary'),
    };
  }

  // job (die rate) based operators excel
  generateJobExcel() {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Job Payroll');
    const monthName = new Date(this.selectedYear, this.selectedMonth - 1).toLocaleString('en-US', { month: 'long' });

    ws.addRow([`Job based payroll - ${monthName} ${this.selectedYear}`]);
    ws.getRow(1).font = { bold: true };
    ws.addRow([
      'Employee Code', 'Employee Name', 'Job Amount', 'Miscellaneous Expenses', 'Total Salary',
      'Professional Tax', 'Employee contri. PF', 'Employer contri. PF', 'ESIC',
      'Advance Salary', 'Miscellaneous Deductions', 'Net Salary'
    ]);
    ws.getRow(2).font = { bold: true };

    this.dataToExportExcel.forEach((emp: any) => {
      ws.addRow([
        emp.employee_code, emp.emp_name, emp.job_amount ?? 0, emp.misc_expense ?? 0, emp.total_salary ?? 0,
        emp.total_tax_deduction ?? 0, emp.pf_employee_deduction ?? 0, emp.pf_employer_contribution ?? 0,
        emp.esic_deduction ?? 0, emp.adv_deduction ?? 0, emp.misc_deduction ?? 0, emp.net_salary ?? 0
      ]);
    });

    const t = this.dataToExportExcel_totals;
    ws.addRow(['TOTAL', '', '', '', t.total_salary, t.total_tax, t.total_pf_employee, t.total_pf_employer,
      t.total_esic, t.total_adv_salary, '', t.total_net_salary]);
    ws.lastRow!.font = { bold: true };
    ws.columns.forEach(col => col.width = 20);

    // die wise breakup (only once payroll is generated)
    const dieSheet = workbook.addWorksheet('Die Details');
    dieSheet.addRow(['Employee Code', 'Employee Name', 'Die No', 'Jobs Done', 'Die Rate', 'Amount']);
    dieSheet.getRow(1).font = { bold: true };
    this.dataToExportExcel.forEach((emp: any) => {
      (emp.die_details ?? []).forEach((d: any) => {
        dieSheet.addRow([emp.employee_code, emp.emp_name, d.die_number, Number(d.jobs_done), Number(d.die_rate), Number(d.amount)]);
      });
    });
    dieSheet.columns.forEach(col => col.width = 18);

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'Payroll_job_based.xlsx');
    });
  }

  //process
  generateExcel() {
    if (!this.dataToExportExcel || this.dataToExportExcel.length === 0) {
      this.toastr.warning('No data to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll');

    const year = this.selectedYear;
    const month = this.selectedMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });

    // ROLE BASED SORTING
    const nonOperators = this.dataToExportExcel.filter((e: any) => e.role_id !== 2);
    const operators = this.dataToExportExcel.filter((e: any) => e.role_id === 2);
    const orderedEmployees = [...nonOperators, ...operators];

    const isOperator = (emp: any) => emp.role_id === 2;

    // HEADER ROW 1
    const headerRow1: any[] = ['Employee Code', 'Employee Name'];

    for (let d = 1; d <= daysInMonth; d++) headerRow1.push('');

    headerRow1.push(
      'Absent Days',
      'H/O',
      'W/O',
      'Present Days',
      'Hours',
      'OT Hours',
      'Late In',
      'Every 4 late mark 4hrs deduction',
      'Total Hours',
      'Gross Salary',
      'Hours of Month',
      'Per Hours/Day',
      'Overtime Salary',
      'Present Day Hrs salary',
      'Deduction',
      ...(this.showLwpColumns ? ['Leave Without Pay Days', 'Leave Without Pay Amount'] : []),
      'Total Salary',
      'Professional Tax',
      'Employee contri. PF',
      'Employer contri. PF',
      'ESIC Employee 0.75%',
      'Advance Salary',
      'Miscellaneous Expenses',  
      'Miscellaneous Deductions', 
      'Incentive Amount',
      'Default Holiday Pay',
      'Salary Payable'
    );

    worksheet.addRow(headerRow1);

    // HEADER ROW 2 (DATES)
    const headerRow2: any[] = ['', ''];
    for (let d = 1; d <= daysInMonth; d++) {
      headerRow2.push(`${d} ${monthName.slice(0, 3)}`);
    }

    const extraCols = 25 + (this.showLwpColumns ? 2 : 0); // +1 because of H/O
    for (let i = 0; i < extraCols; i++) headerRow2.push('');

    worksheet.addRow(headerRow2);

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { bold: true };
    worksheet.getCell('C1').value = monthName;

    // DATA ROWS
    orderedEmployees.forEach(emp => {
      const operator = isOperator(emp);

      const row: any[] = [emp.employee_code, emp.emp_name];

      for (let d = 1; d <= daysInMonth; d++) {
        const att = emp.attendance.find((a: any) =>
          new Date(a.attendance_date).getDate() === d
        );
        row.push(att ? att.status : '');
      }

      // Non-operator specific columns
      if (!operator) {
        row.push(
          emp.absent_days ?? 0,
          emp.holidays ?? 0,
          emp.weekends ?? 0,
          emp.present_days ?? 0
        );
      } else {
        row.push('', '', '', emp.present_days ?? 0);
      }

      row.push(
        emp.hours,
        emp.total_overtime,
        emp.late_in,
        emp.every_4_late_mark_4_hrs_deduction,
        emp.total_hours,
        emp.basic_salary,
        emp.total_month_hours,
        emp.per_hours_amount,
        emp.overtime_amount,
        emp.present_day_hrs_salary,
        emp.deduction,
        ...(this.showLwpColumns
          ? [emp.leave_without_pay_days ?? 0, emp.leave_without_pay_amount ?? 0]
          : []),
        emp.total_salary,
        emp.total_tax_deduction,
        emp.pf_employee_deduction,
        emp.pf_employer_contribution,
        emp.esic_deduction,
        emp.adv_deduction,
        emp.misc_expense ?? 0,   
        emp.misc_deduction ?? 0, 
        emp.incentive_amount,
        emp.default_holiday_pay,
        emp.net_salary
      );

      worksheet.addRow(row);

      // BLANK ROW → ONLY FOR NON OPERATOR
      if (!operator) {
        worksheet.addRow([]);
      }

      // OT ROW → ONLY FOR OPERATOR
      if (operator) {
        const otRow: any[] = ['', ''];

        for (let d = 1; d <= daysInMonth; d++) {
          const att = emp.attendance.find((a: any) =>
            new Date(a.attendance_date).getDate() === d
          );
          otRow.push(att?.over_time_hr ?? '');
        }

        const fillCols = row.length - otRow.length;
        for (let i = 0; i < fillCols; i++) otRow.push('');

        worksheet.addRow(otRow);
      }
    });

    // TOTAL ROW (UNCHANGED)
    const totals = this.dataToExportExcel_totals;
    const totalsRow: any[] = ['TOTAL', ''];

    for (let d = 1; d <= daysInMonth; d++) totalsRow.push('');

    totalsRow.push(
      '', '', '', '', '', '', '', '', '', '', '', '',
      totals.total_overtime_salary,
      '', '',
      ...(this.showLwpColumns ? ['', ''] : []),
      totals.total_salary,
      totals.total_tax,
      totals.total_pf_employee,
      totals.total_pf_employer,
      totals.total_esic,
      totals.total_adv_salary,
      '','','', '',
      totals.total_net_salary
    );

    worksheet.addRow(totalsRow);
    worksheet.lastRow!.font = { bold: true };

    // COLUMN WIDTH
    worksheet.columns.forEach((col, i) => {
      if (i < 2) col.width = 20;
      else if (i < 2 + daysInMonth) col.width = 5;
      else col.width = 15;
    });

    // EXPORT
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'Payroll_process.xlsx');
    });
  }

  //generate
  generateAttendanceExcel() {
    if (!this.dataToExportExcel || this.dataToExportExcel.length === 0) {
      this.toastr.warning('No data to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll');

    const year = this.selectedYear;
    const month = this.selectedMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });

    // ROLE BASED SORTING
    const nonOperators = this.dataToExportExcel.filter((e: any) => e.role_id !== 2);
    const operators = this.dataToExportExcel.filter((e: any) => e.role_id === 2);
    const orderedEmployees = [...nonOperators, ...operators];

    const isOperator = (emp: any) => emp.role_id === 2;

    /* ================= HEADER ROW 1 ================= */
    const headerRow1: any[] = ['Employee Code', 'Employee Name'];

    for (let d = 1; d <= daysInMonth; d++) headerRow1.push('');

    headerRow1.push(
      'Absent Days',
      'H/O',
      'W/O',
      'Present Days',
      'Hours',
      'OT Hours',
      'Late In',
      'Every 4 late mark 4hrs deduction',
      'Total Hours'
    );

    worksheet.addRow(headerRow1);

    const headerRow2: any[] = ['', ''];
    for (let d = 1; d <= daysInMonth; d++) {
      headerRow2.push(`${d} ${monthName.slice(0, 3)}`);
    }

    // Only columns till Total Hours
    for (let i = 0; i < 9; i++) headerRow2.push('');

    worksheet.addRow(headerRow2);

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { bold: true };
    worksheet.getCell('C1').value = monthName;

    orderedEmployees.forEach(emp => {
      const operator = isOperator(emp);
      const row: any[] = [emp.employee_code, emp.emp_name];

      for (let d = 1; d <= daysInMonth; d++) {
        const att = emp.attendance.find((a: any) =>
          new Date(a.attendance_date).getDate() === d
        );
        row.push(att ? att.status : '');
      }

      if (!operator) {
        row.push(
          emp.absent_days ?? 0,
          emp.holidays ?? 0,
          emp.weekends ?? 0,
          emp.present_days ?? 0
        );
      } else {
        row.push('', '', '', emp.present_days ?? 0);
      }

      row.push(
        emp.hours,
        emp.overtime_hrs,
        emp.late_in,
        emp.every_4_late_mark_4_hrs_deduction,
        emp.total_hours
      );

      worksheet.addRow(row);

      // Blank row for NON-OPERATOR
      if (!operator) {
        worksheet.addRow([]);
      }

      // OT row for OPERATOR
      if (operator) {
        const otRow: any[] = ['', ''];

        for (let d = 1; d <= daysInMonth; d++) {
          const att = emp.attendance.find((a: any) =>
            new Date(a.attendance_date).getDate() === d
          );
          otRow.push(att?.over_time_hr ?? '');
        }

        const fillCols = row.length - otRow.length;
        for (let i = 0; i < fillCols; i++) otRow.push('');

        worksheet.addRow(otRow);
      }
    });

    worksheet.columns.forEach((col, i) => {
      if (i < 2) col.width = 20;
      else if (i < 2 + daysInMonth) col.width = 5;
      else col.width = 15;
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'Payroll_generate.xlsx');
    });
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
