import { Component, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-live-attendance',
  templateUrl: './live-attendance.component.html',
  styleUrls: ['./live-attendance.component.css']
})
export class LiveAttendanceComponent {
  @ViewChild('agGrid', { static: false }) agGrid!: AgGridAngular;

  rowData: any[] = [];
  activeTab: string = 'live'; // default tab
  searchInputValue: string = '';
  gridApiActive: any;
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;
  currentFilter: string = '';

  startDate: string = this.getFirstDayOfMonth();
  endDate: string = this.getLastDayOfMonth();

  constructor(private toastr: ToastrService, private service: HrmserviceService) { }

  ngOnInit() {
    this.getPaginationValueAndFetch();
    //this.startAutoRefresh(); // live auto refresh
  }

  // Auto refresh every 15 sec
  // startAutoRefresh() {
  //   setInterval(() => {
  //     if (this.activeTab === 'live') {
  //       this.fetchLiveAttendance();
  //     }
  //   }, 15000);
  // }

  public defaultColDef: ColDef = {
    editable: false,
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true
  };

  // LIVE columns
  columnDefs: ColDef[] = [
    { headerName: 'Employee Code', field: 'employee.employee_code' },
    { headerName: 'Name', field: 'employee.emp_name' },
    { headerName: 'Date', field: 'currentdate' },
    { headerName: 'Login Time', field: 'logged_in_time' },
    { headerName: 'Logout Time', field: 'logged_out_time' },
    {
      headerName: 'Shift',
      field: 'shift_details',
      valueFormatter: (params: any) => {
        if (params.value == 1) return 'Morning';
        if (params.value == 2) return 'Evening';
        return params.value; // fallback
      }
    }
  ];

  selectTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'live') {
      this.fetchLiveAttendance();
    }
  }

  onYearMonthChange() {
    this.currentPage = 1;
    this.fetchLiveAttendance();
  }

  fetchLiveAttendance() {
    const body: any = {
      page: this.currentPage,
      limit: this.paginationvalue,
    };

    if (this.currentFilter) {
      body.status = this.currentFilter;
    }

    if (this.searchInputValue?.trim()) {
      body.search = this.searchInputValue.trim();
    }

    // send current month/year automatically
    if (this.startDate) body.start_date = this.startDate;
    if (this.endDate) body.end_date = this.endDate;

    this.isLoading = true;

    this.service.post('fetch/live-attendance', body).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.status === 'success') {
          this.rowData = res.data;
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;
          this.generatePageNumbers(this.paginationvalue);
        } else {
          this.rowData = [];
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Error fetching live attendance');
      }
    });
  }

  onGridReady(params: any): void {
    this.gridApiActive = params.api;
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
    this.fetchLiveAttendance();
  }

  getFirstDayOfMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  getLastDayOfMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate(); // gets last date of current month
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }
  // pagination (same as yours)
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

    if (startPage > 2) pages.push('...');

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < total - 1) pages.push('...');

    if (total > 1) pages.push(total);

    this.pagesToShow = pages;
  }

  goToPage(page: number | string) {
    if (page === '...') return;
    this.currentPage = page as number;
    this.fetchLiveAttendance();
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.fetchLiveAttendance();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchLiveAttendance();
    }
  }

  searchTimeout: any;

  onSearchChange(): void {
    // Debounce search to avoid too many API calls
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.fetchLiveAttendance();
    }, 500);
  }

  // onSearchChange() {
  //   setTimeout(() => {
  //     this.currentPage = 1;
  //     this.fetchLiveAttendance();
  //   }, 500);
  // }

  getPaginationValueAndFetch() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      this.paginationvalue = res.status === 'success' ? res.data : 10;
      this.fetchLiveAttendance();
    });
  }

  getTodayDayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  getFormattedTodayDate(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}