import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { IRowNode } from 'ag-grid-community';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-payroll-approved',
  templateUrl: './payroll-approved.component.html',
  styleUrls: ['./payroll-approved.component.css']
})
export class PayrollApprovedComponent {
  CompanyNames: any = [];
  selectedCompanyId: any;
  selectedYear: any;
  selectedMonth: any;
  today: string = new Date().toISOString().split('T')[0];
  rowData: any = [];
  selectedRowData: any[] = [];
  gridApi: any;
  gridColumnApi: any;
  activeTab: string = 'tab1';
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;
  years: number[] = [];
  dataToExportExcel: any[] = [];

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
    this.selectedCompanyId = this.service.selectedCompanyId();

    // this.selectedYear = new Date().getFullYear();
    // this.selectedMonth = new Date().getMonth();
    // const currentDate = new Date();
    // this.today = currentDate.toISOString().split('T')[0];

    const today = new Date();

    //last month
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    this.selectedYear = lastMonthDate.getFullYear();
    this.selectedMonth = lastMonthDate.getMonth() + 1;

    this.today = today.toISOString().split('T')[0];

    this.generateYears();
    this.getCompanyNames();
    // this.ApprovePayrollList();
    this.getPagination();
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

  generateYears(range: number = 5) {
    const currentYear = new Date().getFullYear();
    this.years = [];

    for (let i = currentYear - range; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.ApprovePayrollList();
  }

  onYearMonthChange() {
    this.ApprovePayrollList();
  }

  ApprovePayrollList(page: number = 1): void {
    this.isLoading = true;
    this.service.post('fetch/approved/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      page: page,
      isexport: false
    }).subscribe(
      (res: any) => {
        try {
          if (res.status === 'success' && res.data && res.data.length > 0) {
            this.rowData = res.data.map((item: any) => ({
              employee_code: item.employee_code,
              emp_name: item.emp_name,
              department: item.department_name,
              role: item.role_name,
              presentDays: item.present_days,
              absentDays: item.absent_days,
              hours: item.total_hours,
              overTime: item.total_overtime + ' hrs',
              employe_id: item.employe_id,
              bonus_amount: item.bonus_amount ? `₹ ${item.bonus_amount}` : 'NA',
              advance_salary: item.advance_salary ? `₹ ${item.advance_salary}` : 'NA',
              net_salary: item.net_salary ? `₹ ${item.net_salary}` : 'NA',
            }));
            this.totalRows = res.pagination.total;
            this.currentPage = res.pagination.page;
            this.lastPage = res.pagination.last_page;
            this.generatePageNumbers(this.paginationvalue);
          } else {
            this.rowData = [];
            // this.toastr.warning('Data Not Found');
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
          // this.toastr.warning('Data Not Found');
          this.isLoading = false;
        } else {
          console.error(error);
          this.isLoading = false;
        }
      }
    );
  }

  columnDefs: ColDef[] = [
    {
      headerName: '',
      maxWidth: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {
      headerName: 'Emp Code',
      field: 'employee_code',
      sortable: true,
      filter: true,
      minWidth: 150,
    },
    {
      headerName: 'Emp name',
      field: 'emp_name',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'P',
      field: 'presentDays',
      sortable: true,
      filter: true,
      maxWidth: 70,
    },
    {
      headerName: 'A',
      field: 'absentDays',
      sortable: true,
      filter: true,
      maxWidth: 70,
    },
    // {
    //   headerName: 'OT(hrs)',
    //   field: 'overTime',
    //   sortable: true,
    //   filter: true,
    //   minWidth: 100,
    // },
    {
      headerName: 'hours',
      field: 'hours',
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      headerName: 'Bonus',
      field: 'bonus_amount',
      sortable: true,
      filter: true,
      minWidth: 120,
    },
    {
      headerName: 'Adv Salary',
      field: 'advance_salary',
      sortable: true,
      filter: true,
      minWidth: 140,
    },
    {
      headerName: 'Net Salary',
      field: 'net_salary',
      sortable: true,
      filter: true,
      minWidth: 140,
    },
  ];

  onSelectionChanged(event: any): void {
    this.selectedRowData = event.api.getSelectedRows();
    console.log('Selected rows:', this.selectedRowData);
  }

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

  gridOptions = {
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: false,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
  };


  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getPagination() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.ApprovePayrollList();
      } else {
        this.paginationvalue = 10;
        this.ApprovePayrollList();
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
      this.ApprovePayrollList(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.ApprovePayrollList(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.ApprovePayrollList(this.currentPage);
    }
  }

  exportExcel() {
    if (!this.selectedCompanyId || !this.selectedYear || !this.selectedMonth) {
      this.toastr.warning('Select company, year and month first');
      return;
    }

    this.isLoading = true;

    this.service.post('fetch/approved/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      isexport: true
    }).subscribe((res: any) => {
      this.isLoading = false;

      if (res.status === 'success' && res.data?.length > 0) {
        this.dataToExportExcel = res.data;
        this.generateExcel();
      } else {
        this.toastr.warning('No data to export');
      }
    }, (error) => {
      this.isLoading = false;
      if (error.status === 404) {
        this.toastr.warning('No data to export');
      } else {
        this.toastr.error('Failed to fetch payroll data for export');
      }
    });
  }

  // Adjust this to your real "Operator" role_id
  private isOperator(emp: any): boolean {
    return emp.role_id === 2;
  }

  generateExcel() {
    if (!this.dataToExportExcel || this.dataToExportExcel.length === 0) {
      this.toastr.warning('No data to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Approved Payroll');

    const year = this.selectedYear;
    const month = this.selectedMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });

    // GROUP: non-operators first, operators after
    const nonOperators = this.dataToExportExcel.filter((e: any) => !this.isOperator(e));
    const operators = this.dataToExportExcel.filter((e: any) => this.isOperator(e));
    const orderedEmployees = [...nonOperators, ...operators];

    const hasNonOperator = nonOperators.length > 0;

    // BASE HEADER (always shown)
    const baseHeaderLeft = ['Employee Code', 'Employee Name', 'Role'];
    const attendanceHeader = hasNonOperator ? ['Absent Days', 'H/D', 'W/O'] : [];
    const restHeader = [
      'Present Days', 'Hours', 'OT Hours', 'LATE IN', 'Every 4 late mark 4hrs deduction',
      'Total Hours', 'Gross Salary', 'Hours of the Month', 'Per Hours/Day',
      'Overtime Salary', 'Present Day Hrs Salary', 'Other', 'Ded.',
      'Total Salary', 'Professional Tax', 'Employee contri. PF', 'Employer contri. PF',
      'ESIC Employee 0.75%', 'Incentive', 'Salary Advance', 'Salary Payable'
    ];

    const headerRow = [...baseHeaderLeft, ...attendanceHeader, ...restHeader];

    worksheet.addRow(['', '', '', monthName]);
    worksheet.addRow(headerRow);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { bold: true };

    // total_month_hours — using daysInMonth*8 as a placeholder; swap for real source if you have one
    const hoursOfMonth = daysInMonth * 8;

    orderedEmployees.forEach((emp: any) => {
      const operator = this.isOperator(emp);

      const row: any[] = [emp.employee_code, emp.emp_name, emp.role_name];

      if (hasNonOperator) {
        if (!operator) {
          row.push(emp.absent_days ?? 0, emp.holidays ?? 0, emp.weekends ?? 0);
        } else {
          row.push('', '', ''); // blank for operators
        }
      }

      row.push(
        emp.present_days ?? 0,
        emp.total_hours,
        emp.total_overtime,
        emp.late_in ?? 0,                              // placeholder until source confirmed
        emp.every_4_late_mark_4_hrs_deduction ?? 0,    // placeholder until source confirmed
        emp.total_hours,                                // Total Hours (same as Hours unless you have a distinct calc)
        emp.basic_salary,                               // Gross Salary
        hoursOfMonth,
        emp.per_hours_amount,
        emp.overtime_amount,
        emp.present_day_hrs_salary,
        emp.other ?? 0,          // placeholder
        emp.deduction ?? 0,      // placeholder
        emp.total_salary,
        emp.total_tax_deduction,
        emp.pf_employee_deduction,
        emp.pf_employer_contribution,
        emp.esic_deduction,
        emp.incentive_amount,
        emp.adv_deduction,       // Salary Advance
        emp.net_salary           // Salary Payable
      );

      worksheet.addRow(row);
    });

    // COLUMN WIDTHS
    worksheet.columns.forEach((col, i) => {
      col.width = i < 2 ? 20 : 15;
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'ApprovedPayroll.xlsx');
    });
  }
}
