import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
// import { EmployeeActionComponent } from '../employee-action/employee-action.component';
import { PayrollActionBtnComponent } from './payroll-action-btn/payroll-action-btn.component';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

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
  dataToExportExcel: any[] = [];
  dataToExportExcel_totals: any = {}

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
    this.selectedMonth = new Date().getMonth();
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.getCompanyNames();
    // this.getpayrollList();

    this.getPagination();
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

  getpayrollList(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('get/payroll_list', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      page: page,
      isexport: false,
    }).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data?.length > 0) {
          this.dataToExportExcel = res.data;
          this.dataToExportExcel_totals = res.totals;
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            employeeName: item.emp_name,
            total_hours: item.total_hours,
            overTime: item.total_overtime,
            netAmount: item.net_salary ? `₹ ${item.net_salary}` : 'NA',
            deduction: item.deduction ? `₹ ${item.deduction}` : 'NA',
            employe_id: item.employe_id,
            temp_payroll_id: item.temp_payroll_id
          }));
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;
          this.generatePageNumbers(this.paginationvalue);
        } else {
          this.rowData = [];
          this.toastr.warning('Data Not Found');
        }
      } catch (error) {
        console.log(error);
        this.rowData = [];
      }
      this.isLoading = false;
    },
      (error) => {
        this.rowData = [];
        if (error.status === 404) {
          this.toastr.warning('Data Not Found');
          this.isLoading = false;
        } else {
          console.error(error);
          this.isLoading = false;
        }
      });
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
      headerName: 'Total Hours',
      field: 'total_hours',
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
    if (!this.selectedCompanyId || !this.selectedYear || !this.selectedMonth) {
      this.toastr.warning('Select company, year and month first');
      return;
    }

    this.isLoading = true;

    this.service.post('get/payroll_list', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      isexport: true
    }).subscribe((res: any) => {
      this.isLoading = false;

      if (res.status === 'success' && res.data?.length > 0) {
        this.dataToExportExcel = res.data;
        this.dataToExportExcel_totals = res.totals;

        this.generateExcel();
      } else {
        this.toastr.warning('No data to export');
      }
    }, (error) => {
      console.error(error);
      this.isLoading = false;
      this.toastr.error('Failed to fetch payroll data for export');
    });
  }

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

    // Header row 1
    const headerRow1: any[] = ['Employee Code', 'Employee Name'];
    for (let d = 1; d <= daysInMonth; d++) headerRow1.push('');
    headerRow1.push(
      'Absent Days',
      'Present Days',
      'Hours',
      'OT Hours',
      'Late In',
      'Every 4 late mark 4hrs deduction',
      'Total Hours',
      'Gross Salary',
      'Hours of Month',
      'Per Hours Salary',
      'Overtime Salary',
      'Present Day Hrs salary',
      'Deduction',
      'Total_Salary',
      'Professional Tax',
      'Employee contri. PF',
      'Employer contri. PF',
      'ESIC Employee 0.75%',
      'Advance Salary',
      'Salary Payable',
    );
    worksheet.addRow(headerRow1);

    // Merge headers
    worksheet.mergeCells(1, 1, 2, 1);
    worksheet.mergeCells(1, 2, 2, 2);
    worksheet.mergeCells(1, 3, 1, 2 + daysInMonth);
    worksheet.mergeCells(1, 3 + daysInMonth, 2, 3 + daysInMonth);
    worksheet.mergeCells(1, 4 + daysInMonth, 2, 4 + daysInMonth);
    worksheet.mergeCells(1, 5 + daysInMonth, 2, 5 + daysInMonth);
    worksheet.mergeCells(1, 6 + daysInMonth, 2, 6 + daysInMonth);
    worksheet.mergeCells(1, 7 + daysInMonth, 2, 7 + daysInMonth); // Present
    worksheet.mergeCells(1, 8 + daysInMonth, 2, 8 + daysInMonth); // Absent
    worksheet.mergeCells(1, 9 + daysInMonth, 2, 9 + daysInMonth); // Hours
    worksheet.mergeCells(1, 10 + daysInMonth, 2, 10 + daysInMonth); // OT Hours
    worksheet.mergeCells(1, 11 + daysInMonth, 2, 11 + daysInMonth); // Late
    worksheet.mergeCells(1, 12 + daysInMonth, 2, 12 + daysInMonth); // Early leave
    worksheet.mergeCells(1, 13 + daysInMonth, 2, 13 + daysInMonth); // Early leave

    worksheet.getCell('C1').value = monthName;

    // Header row 2 - attendance dates
    const headerRow2: any[] = ['', ''];
    for (let d = 1; d <= daysInMonth; d++) {
      headerRow2.push(`${d} ${monthName.slice(0, 3)}`);
    }
    headerRow2.push('', '', '', '', '', '', '', '', '', '');
    worksheet.addRow(headerRow2);

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { bold: true };

    // ✅ Fill employee data (only ONE loop)
    this.dataToExportExcel.forEach(emp => {
      // -------- Row 1: Attendance Status --------
      const rowStatus: any[] = [emp.employee_code, emp.emp_name];
      for (let d = 1; d <= daysInMonth; d++) {
        const attObj = emp.attendance.find((a: any) => {
          const date = new Date(a.attendance_date);
          return date.getDate() === d;
        });
        rowStatus.push(attObj ? attObj.status : '');
      }
      rowStatus.push(
        emp.absent_days,
        emp.present_days,
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
        emp.total_salary,
        emp.total_tax_deduction,
        emp.pf_employee_deduction,
        emp.pf_employer_contribution,
        emp.esic_deduction,
        emp.adv_deduction,
        emp.net_salary,
      );
      worksheet.addRow(rowStatus);

      // -------- Row 2: Overtime Hours --------
      const rowOvertime: any[] = ['', ''];
      for (let d = 1; d <= daysInMonth; d++) {
        const attObj = emp.attendance.find((a: any) => {
          const date = new Date(a.attendance_date);
          return date.getDate() === d;
        });

        let overtimeVal = attObj && attObj.over_time_hr != null ? Number(attObj.over_time_hr) : 0;

        // ✅ Remove ".0" if decimal part is 0
        if (Number.isInteger(overtimeVal)) {
          overtimeVal = Math.floor(overtimeVal);
        }

        rowOvertime.push(overtimeVal);
      }
      rowOvertime.push('', '', '', '', '', '', '', '', '', '');
      worksheet.addRow(rowOvertime);
    });

    //Add Totals Row BELOW ALL EMPLOYEES
    const totals = this.dataToExportExcel_totals;

    const totalsRow: any[] = ['TOTAL', ''];
    for (let d = 1; d <= daysInMonth; d++) totalsRow.push(''); // leave attendance blank

    totalsRow.push(
      '', '', '', '', '', '', '', '', '', '',
      totals.total_overtime_salary, // Overtime Salary
      '',                            // Present Day Hrs salary
      '',                            // Deduction
      totals.total_salary,           // Total Salary
      totals.total_tax,              // Professional Tax
      totals.total_pf_employee,      // Employee PF
      totals.total_pf_employer,      // Employer PF
      totals.total_esic,             // ESIC
      totals.total_adv_salary,       // Advance Salary
      totals.total_net_salary        // Net Salary (Salary Payable)
    );

    worksheet.addRow(totalsRow);
    const lastRow = worksheet.lastRow;
    if (lastRow) lastRow.font = { bold: true };

    // Optional column widths
    worksheet.columns.forEach((col, i) => {
      if (i < 2) col.width = 20;
      else if (i < 2 + daysInMonth) col.width = 5;
      else col.width = 15;
    });

    // Export file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'Payroll.xlsx');
    });
  }

  getPagination() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.getpayrollList();
      } else {
        this.paginationvalue = 10;
        this.getpayrollList();
      }
    });
  }

  getpaginationvalue() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data
        this.generatePageNumbers(this.paginationvalue)
      }
    });
  }

  generatePageNumbers(pageWindow: number) {
    const total = this.lastPage;
    const current = this.currentPage;

    let startPage = current;
    let endPage = current + pageWindow - 1;

    if (endPage >= total) {
      endPage = total - 1;
      startPage = Math.max(2, total - pageWindow);
    }

    if (current === 1) {
      startPage = 2;
      endPage = Math.min(total - 1, pageWindow);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < total - 1) {
      pages.push('...');
    }

    if (total > 1) pages.push(total);

    this.pagesToShow = pages;
  }


  goToPage(page: number | string) {
    if (page === '...') return;
    if (page !== this.currentPage) {
      this.currentPage = page as number;
      this.getpayrollList(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getpayrollList(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getpayrollList(this.currentPage);
    }
  }

}
