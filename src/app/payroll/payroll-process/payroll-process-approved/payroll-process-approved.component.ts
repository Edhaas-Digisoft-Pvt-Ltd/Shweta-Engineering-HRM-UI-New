import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { IRowNode } from 'ag-grid-community';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
declare var jspdf: any;
declare var html2canvas: any;

@Component({
  selector: 'app-payroll-process-approved',
  templateUrl: './payroll-process-approved.component.html',
  styleUrls: ['./payroll-process-approved.component.css']
})
export class PayrollProcessApprovedComponent {

  CompanyNames: any = [];
  selectedCompanyId: any;
  selectedYear: any;
  selectedMonth: any;
  rowData: any = [];
  selectedRowData: any[] = [];
  gridApiActive!: GridApi;
  activeTab: string = 'tab1';
  isProcess: any = false;
  columnDefs: ColDef[] = [];
  selectedEmployee: any = null;
  selectedEmployeesForModal: any[] = [];
  consolidatedSummary: { [monthYear: string]: any[] } = {};
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;
  years: number[] = [];
  dataToExportExcel: any[] = [];
  pdfExportRows: any[] = [];
  pdfMonthLabel: string = '';
  isPdfExporting: boolean = false;

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
    // this.getApprovedPayroll();
    this.getPagination();
    this.initializeColumns();
    this.getAttendanceDetails();
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

  generateYears(range: number = 5) {
    const currentYear = new Date().getFullYear();
    this.years = [];

    for (let i = currentYear - range; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.getApprovedPayroll();
  }

  onYearMonthChange() {
    this.getApprovedPayroll();
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  getApprovedPayroll(page: number = 1): void {
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

  initializeColumns() {
    this.columnDefs = [
      {
        headerName: 'Emp Code',
        field: 'employee_code',
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      {
        headerName: 'Emp Name',
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
        minWidth: 100,
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
    ]
  }


  // onSelectionChanged(event: any): void {
  //   this.selectedRowData = event.api.getSelectedRows();
  //   console.log('Selected rows:', this.selectedRowData);
  // }

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


  onSelectionChanged(event: any): void {
    this.selectedRowData = event.api.getSelectedRows();
    console.log('Selected rows:', this.selectedRowData);
  }

  getAttendanceDetails() {
    this.service.post('fetch/ConsolidatedSummary', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.consolidatedSummary = res;
      }
    });
  }

  getPagination() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.getApprovedPayroll();
      } else {
        this.paginationvalue = 10;
        this.getApprovedPayroll();
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
      this.getApprovedPayroll(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getApprovedPayroll(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getApprovedPayroll(this.currentPage);
    }
  }

  exportPdf() {
    if (!this.selectedCompanyId || !this.selectedYear || !this.selectedMonth) {
      this.toastr.warning('Select company, year and month first');
      return;
    }

    this.isPdfExporting = true;

    this.service.post('fetch/approved/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      isexport: true
    }).subscribe((res: any) => {
      if (res.status === 'success' && res.data?.length > 0) {
        this.dataToExportExcel = res.data;
        this.buildPdfTableData();
        setTimeout(() => this.generatePDF(), 100);
      } else {
        this.isPdfExporting = false;
        this.toastr.warning('No data to export');
      }
    }, (error) => {
      this.isPdfExporting = false;
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

  buildPdfTableData() {
    const year = this.selectedYear;
    const month = this.selectedMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
    const hoursOfMonth = daysInMonth * 8;

    this.pdfMonthLabel = `${monthName} ${year}`;

    this.pdfExportRows = this.dataToExportExcel.map((emp: any) => ({
      emp_name: emp.emp_name,
      present_days: emp.present_days ?? 0,
      present_day_hrs: emp.total_hours ?? 0,
      ot_hrs: emp.total_overtime ?? 0,
      fixed_salary: emp.basic_salary ?? 0,
      hours_of_month: hoursOfMonth,
      ot_per_hrs: emp.per_hours_amount ?? 0,
      late_in: emp.late_in ?? 0,
      late_mark_ded: emp.every_4_late_mark_4_hrs_deduction ?? 0,
      total_gross_salary: emp.total_salary ?? 0,
      pt: emp.total_tax_deduction ?? 0,
      pf_employer: emp.pf_employer_contribution ?? '',
      pf_employee: emp.pf_employee_deduction ?? '',
      esic: emp.esic_deduction ?? '',
      incentive: emp.incentive_amount ?? '',
      salary_advance: emp.adv_deduction ?? '',
      misc_expense: emp.misc_expense ?? 0,
      misc_deduction: emp.misc_deduction ?? 0,
      net_salary: emp.net_salary ?? 0,
    }));
  }

  generatePDF() {
    const tableEl = document.getElementById('pdfExportTable');
    if (!tableEl) {
      this.isLoading = false;
      this.toastr.error('Could not generate PDF');
      return;
    }

    html2canvas(tableEl, { scale: 2 }).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = jspdf;
      const doc = new jsPDF('l', 'pt', 'a4');

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 20;

      doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 20;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save('ApprovedPayroll.pdf');
      this.isPdfExporting = false;
    }).catch((err: any) => {
      console.error(err);
      this.isPdfExporting = false;
      this.toastr.error('Failed to generate PDF');
    });
  }
}
