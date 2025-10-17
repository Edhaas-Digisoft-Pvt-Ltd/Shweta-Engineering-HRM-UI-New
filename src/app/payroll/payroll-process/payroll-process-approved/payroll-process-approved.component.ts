import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { IRowNode } from 'ag-grid-community';

@Component({
  selector: 'app-payroll-process-approved',
  templateUrl: './payroll-process-approved.component.html',
  styleUrls: ['./payroll-process-approved.component.css']
})
export class PayrollProcessApprovedComponent {

  CompanyNames: any = [];
  selectedCompanyId: any = 1;
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

  today: string = new Date().toISOString().split('T')[0];
  constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) { }

  rowSelection: string = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
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

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnInit() {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth();
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
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
  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
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
      page:page,
      isexport: false
    }).subscribe(
      (res: any) => {
        try {
          if (res.status === 'success' && res.data && res.data.length > 0) {
            this.rowData = res.data.map((item: any) => ({
              employee_code: item.employee_code,
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
      }
    );
  }

  initializeColumns() {
    this.columnDefs = [
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
        headerName: 'Department',
        field: 'department',
        sortable: true,
        filter: true,
        minWidth: 140,
      },
      // {
      //   headerName: 'Role',
      //   field: 'role',
      //   sortable: true,
      //   filter: true,
      // },
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
      {
        headerName: 'OT(hrs)',
        field: 'overTime',
        sortable: true,
        filter: true,
        minWidth: 100,
      },
      {
        headerName: 'hours',
        field: 'hours',
        sortable: true,
        filter: true,
        minWidth: 100,
      },
      {
        headerName: 'B & I',
        field: 'bonus_incentive_amount',
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

  exportSelectedRowsToCSV() {
    const selectedNodes: IRowNode<any>[] = this.gridApiActive.getSelectedNodes();
    const selectedData = selectedNodes.map((node: IRowNode<any>) => node.data);

    if (selectedData.length === 0) {
      this.toastr.warning('Please select at least one row to export.');
      return;
    }

    const monthYear = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}`;
    const consolidatedData = this.consolidatedSummary[monthYear] || [];

    const mergedData = selectedData.map((row: any) => {
      const attendance = consolidatedData.find((att: any) => att.employee_code === row.employee_code);

      return {
        'Employee Code': row.employee_code,
        'Employee Name': row.emp_name || attendance?.emp_name,
        'Department': row.department,
        'Present Days': row.presentDays,
        'Absent Days': row.absentDays,
        'WFH/2': attendance?.work_from_home_half_day || '0',
        'Half Day': attendance?.half_day || '0',
        'Late': attendance?.late || '0',
        'Total OT': row.overTime,
        'Total Hrs': row.hours,
        'Bonus&Incentive': row.bonus_incentive_amount,
        'Net Salary': row.net_salary,
      };
    });

    this.downloadAsCSV(mergedData, `Payroll_  ${monthYear}.csv`);
  }

downloadAsCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  const separator = ',';
  const keys = Object.keys(data[0]);

  const csvContent = [
    keys.join(separator),
    ...data.map(row =>
      keys.map(k => `"${(row[k] ?? '').toString().replace(/"/g, '""')}"`).join(separator)
    )
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

}
