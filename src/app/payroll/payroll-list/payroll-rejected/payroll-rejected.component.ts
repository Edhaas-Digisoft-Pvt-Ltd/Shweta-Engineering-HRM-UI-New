import { Component } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payroll-rejected',
  templateUrl: './payroll-rejected.component.html',
  styleUrls: ['./payroll-rejected.component.css']
})
export class PayrollRejectedComponent {
  CompanyNames: any = [];
  selectedCompanyId: any;
  selectedYear: any;
  selectedMonth: any;
  today: string = new Date().toISOString().split('T')[0];
  rowData: any = [];
  selectedRowData: any[] = [];
  activeTab: string = 'tab1';
  gridApiActive!: GridApi;
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

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
    
    this.getCompanyNames();
    // this.RejectedPayrollList();
    this.getPagination();
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
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
    this.RejectedPayrollList();
  }

  onYearMonthChange() {
    this.RejectedPayrollList();
  }

  getMonthName(monthId: number): string {
    const month = this.months.find(m => m.id === monthId);
    return month ? month.value : '';
  }

  RejectedPayrollList(page: number = 1): void {
    this.isLoading = true;
    this.service.post('fetch/rejected/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      page: page,
      isexport: false,
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
              overTime: item.total_overtime,
              employe_id: item.employe_id,
              bonus_amount: item.bonus_amount ? `₹${item.bonus_amount}` : 'NA',
              advance_salary: item.advance_salary ? `₹${item.advance_salary}` : 'NA',
              net_salary: item.net_salary ? `₹${item.net_salary}` : 'NA',
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
          console.error(error);
          this.rowData = [];
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
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
      minWidth: 80,
    },
    {
      headerName: 'A',
      field: 'absentDays',
      sortable: true,
      filter: true,
      minWidth: 80,
    },
    // {
    //   headerName: 'OT(hrs)',
    //   field: 'overTime',
    //   sortable: true,
    //   filter: true,
    //   minWidth: 100,
    // },
    // {
    //   headerName: 'hours',
    //   field: 'hours',
    //   sortable: true,
    //   filter: true,
    //   minWidth: 100,
    // },
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


  exportExcel() {
    this.isLoading = true;
    this.service.post('fetch/rejected/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      isexport: true,
    }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data.length) {
          const rows = res.data.map((r: any) => [
            r.employee_code,
            r.emp_name,
            r.role_name,
            r.present_days,
            r.absent_days,
            r.total_overtime,
            r.total_hours,
            r.bonus_amount,
            r.adv_deduction,
            r.net_salary,
            r.payroll_status
          ]);

          const csvArray: string[][] = [
            ['Employee Code', 'Employee Name', 'Role Name', 'Present Days', 'Absent Days', 'Total Overtime', 'Total HOurs', 'Bonus Amount', 'Adv Deduction', 'Net Salary', 'Payroll Status'],
            ...rows
          ];

          const csv = csvArray
            .map((row: string[]) => row.map((v: string | number | null) => `"${v ?? ''}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'RejectedPayroll.csv'
          });
          link.click();

          this.toastr.success('Data exported successfully!');
        } else {
          this.toastr.warning('No data found to export');
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

  getPagination() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.RejectedPayrollList();
      } else {
        this.paginationvalue = 10;
        this.RejectedPayrollList();
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
      this.RejectedPayrollList(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.RejectedPayrollList(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.RejectedPayrollList(this.currentPage);
    }
  }

}