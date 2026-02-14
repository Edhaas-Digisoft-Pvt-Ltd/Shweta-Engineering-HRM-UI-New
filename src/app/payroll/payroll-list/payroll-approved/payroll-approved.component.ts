import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { IRowNode } from 'ag-grid-community';

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
    console.log('Selected Company ID:', this.selectedCompanyId);
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
      page:page,
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

  exportSelectedRowsToCSV() {
    const selectedNodes: IRowNode<any>[] = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node: IRowNode<any>) => node.data);

    if (selectedData.length === 0) {
      this.toastr.warning('Please select at least one row to export.');
      return;
    }

    this.gridApi.exportDataAsCsv({
      onlySelected: true,
      columnKeys: ['employee_code', 'department', 'presentDays', 'absentDays', 'overTime', 'hours', 'bonus_amount', 'advance_salary', 'net_salary'],
      fileName: 'payrollApproved.csv',
    });
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

}
