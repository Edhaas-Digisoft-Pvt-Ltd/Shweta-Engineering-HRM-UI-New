import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upcoming-leaves',
  templateUrl: './upcoming-leaves.component.html',
  styleUrls: ['./upcoming-leaves.component.css']
})
export class UpcomingLeavesComponent {
  gridApiActive: any;
  searchInputValue: any;
  rowData: any = [];
  isLoading: boolean = false;
  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  CompanyNames: any[] = [];
  selectedCompanyId: any[] = ['all'];
  companyDropdownOpen: boolean = false;

  dateRangeLabel: string = '';

  constructor(private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.selectedCompanyId = ['all'];

    this.getCompanyNames();
    this.getPagination();
  }

  public defaultColDef: ColDef = {
    editable: false,
    flex: 1,
    resizable: true,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Employee Code', field: 'employee_code', sortable: true, filter: true },
    { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true },
    { headerName: 'Company', field: 'company_name', sortable: true, filter: true },
    { headerName: 'Department', field: 'department_name', sortable: true, filter: true },
    { headerName: 'Start Date', field: 'start_date', sortable: true, filter: true, valueFormatter: this.service.dateFormatter },
    { headerName: 'End Date', field: 'end_date', sortable: true, filter: true, valueFormatter: this.service.dateFormatter },
    { headerName: 'No. Of Days', field: 'total_leave_days', sortable: true, filter: true, maxWidth: 140 },
    { headerName: 'Status', field: 'leave_status', cellRenderer: this.statusButtonRenderer, sortable: true, filter: true, maxWidth: 140 },
  ];

  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;
    button.style.padding = '6px 12px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'default';
    button.style.height = '30px';
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '97%';
    button.style.marginTop = '6px';
    button.style.backgroundColor = '#B2FFE1B0';
    button.style.color = 'black';
    button.style.border = '1px solid #B2FFE1B0';

    return button;
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data;
      }
    });
  }

  toggleCompanyDropdown() {
    this.companyDropdownOpen = !this.companyDropdownOpen;
  }

  closeCompanyDropdown() {
    this.companyDropdownOpen = false;
  }

  isAllSelected(): boolean {
    return this.selectedCompanyId.includes('all');
  }

  isCompanySelected(companyId: any): boolean {
    return this.isAllSelected() || this.selectedCompanyId.includes(companyId);
  }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCompanyId = checked ? ['all'] : [this.CompanyNames[0]?.company_id].filter(Boolean);
    this.applyCompanyFilter();
  }

  toggleCompany(companyId: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    let ids = this.isAllSelected()
      ? this.CompanyNames.map((c: any) => c.company_id)
      : [...this.selectedCompanyId];
    if (checked) {
      if (!ids.includes(companyId)) {
        ids.push(companyId);
      }
    } else {
      ids = ids.filter((id: any) => id !== companyId);
    }
    if (ids.length === this.CompanyNames.length) {
      ids = ['all'];
    }
    this.selectedCompanyId = ids.length ? ids : [];
    this.applyCompanyFilter();
  }

  applyCompanyFilter() {
    this.currentPage = 1;
    this.getUpcomingLeaves();
  }

  get companyDropdownLabel(): string {
    if (this.isAllSelected()) return 'All Companies';
    if (this.selectedCompanyId.length === 1) {
      const match = this.CompanyNames.find(c => c.company_id === this.selectedCompanyId[0]);
      return match ? match.company_name : '1 Selected';
    }
    return `${this.selectedCompanyId.length} Companies Selected`;
  }

  getUpcomingLeaves(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('leave/upcoming', {
      company_id: this.selectedCompanyId,
      page: page,
      isexport: false,
    }).subscribe(
      (res: any) => {
        if (res.date_range) {
          this.dateRangeLabel = `${res.date_range.from} to ${res.date_range.to}`;
        }
        if (res.status === 'success') {
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            emp_name: item.emp_name,
            company_name: item.company_name,
            department_name: item.department_name,
            start_date: item.start_date,
            end_date: item.end_date,
            total_leave_days: item.total_leave_days,
            leave_status: item.leave_status,
            tbl_emp_leave_id: item.tbl_emp_leave_id,
          }));
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;
          this.generatePageNumbers(this.paginationvalue);
        } else {
          this.toastr.warning('Data Not Found');
        }
        this.isLoading = false;
      },
      (error) => {
        if (error.status === 400 && error.error?.date_range) {
          const d = error.error.date_range;
          this.dateRangeLabel = `${d.from} to ${d.to}`;
        }
        if (error.status !== 400) {
          console.error(error);
        }
        this.isLoading = false;
      }
    );
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }
  onFilterBoxChange() {
    this.gridApiActive.setQuickFilter(this.searchInputValue);
  }
  emptyInput() {
    this.searchInputValue = '';
    window.location.reload();
  }

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  exportExcel() {
    this.isLoading = true;
    this.service.post('leave/upcoming', {
      company_id: this.selectedCompanyId,
      isexport: true
    }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data.length) {
          const rows = res.data.map((r: any) => [
            r.employee_code,
            r.emp_name,
            r.company_name,
            r.department_name,
            r.start_date,
            r.end_date,
            r.total_leave_days,
            r.leave_status
          ]);

          const csvArray: string[][] = [
            ['Employee Code', 'Employee Name', 'Company', 'Department', 'Start Date', 'End Date', 'Days', 'Status'],
            ...rows
          ];

          const csv = csvArray
            .map((row: string[]) => row.map((v: string | number | null) => `"${v ?? ''}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'UpcomingLeaves.csv'
          });
          link.click();

          this.toastr.success('Upcoming Leaves exported successfully!');
        } else {
          this.toastr.warning('No data found to export');
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 400) {
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
        this.getUpcomingLeaves();
      } else {
        this.paginationvalue = 10;
        this.getUpcomingLeaves();
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
      this.getUpcomingLeaves(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getUpcomingLeaves(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getUpcomingLeaves(this.currentPage);
    }
  }
}
