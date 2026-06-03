import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-verify-attendance',
  templateUrl: './verify-attendance.component.html',
  styleUrls: ['./verify-attendance.component.css']
})
export class VerifyAttendanceComponent {

  rowData: any[] = [];
  isLoading: boolean = false;
  searchInputValue: string = '';
  searchTimeout: any;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: number = 10;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  years: number[] = [];

  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
  };

  columnDefs: ColDef[] = [
    { headerName: '#', valueGetter: 'node.rowIndex + 1', flex: 0, width: 60 },
    { headerName: 'Employee Code', valueGetter: (p) => p.data?.employee?.employee_code || '' },
    { headerName: 'Name', valueGetter: (p) => p.data?.employee?.emp_name || '' },
    { headerName: 'Date', field: 'currentdate' },
    { headerName: 'Login Time', field: 'logged_in_time' },
    { headerName: 'Logout Time', field: 'logged_out_time' },
    {
      headerName: 'Shift',
      field: 'shift_details',
      valueFormatter: (p) => {
        if (p.value == '1') return 'Morning';
        if (p.value == '2') return 'Evening';
        return p.value || '';
      }
    },
  ];

  gridOptions = { pagination: false };

  constructor(
    private service: HrmserviceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Populate year dropdown: 5 years back → current year
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }

    this.getPaginationAndFetch();
  }

  getPaginationAndFetch(): void {
    this.service.post('get-pagination', {}).subscribe({
      next: (res: any) => {
        this.paginationvalue = res.status === 'success' ? res.data : 10;
        this.fetchUnverifiedAttendance();
      },
      error: () => {
        this.paginationvalue = 10;
        this.fetchUnverifiedAttendance();
      }
    });
  }

  fetchUnverifiedAttendance(): void {
    const body: any = {
      page: this.currentPage,
      month: this.selectedMonth,
      year: this.selectedYear,
    };

    if (this.searchInputValue.trim()) {
      body.search = this.searchInputValue.trim();
    }

    this.isLoading = true;

    this.service.post('fetch/unverified-attendance', body).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.rowData = res.data;
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;
          this.generatePageNumbers();
        } else {
          this.rowData = [];
          this.totalRows = 0;
          this.pagesToShow = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Fetch Unverified Attendance Error:', err);
        this.toastr.error('Failed to fetch records.');
      }
    });
  }

  verifyAll(): void {
    if (!confirm(`Are you sure you want to verify all attendance records?`)) return;
    // if (!confirm(`Verify all attendance for ${this.months[this.selectedMonth - 1].label} ${this.selectedYear}?`)) return;

    this.isLoading = true;

    this.service.post('verify-attendance', {
      month: this.selectedMonth,
      year: this.selectedYear,
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.toastr.success(
            `Inserted: ${res.inserted} | Skipped: ${res.skipped} | Verified: ${res.verified}`,
            'Verification Complete'
          );
          this.fetchUnverifiedAttendance(); // refresh grid
        } else {
          this.toastr.error(res.message || 'Verification failed.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Something went wrong.');
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.fetchUnverifiedAttendance();
    }, 500);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchUnverifiedAttendance();
  }

  clearFilter(): void {
    this.searchInputValue = '';
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();
    this.currentPage = 1;
    this.fetchUnverifiedAttendance();
  }

  // ── Pagination ──────────────────────────────────────────
  generatePageNumbers(): void {
    const total = this.lastPage;
    const current = this.currentPage;
    const window = this.paginationvalue;

    let startPage = current;
    let endPage = current + window - 1;

    if (endPage >= total) {
      endPage = total - 1;
      startPage = Math.max(2, total - window);
    }
    if (current === 1) {
      startPage = 2;
      endPage = Math.min(total - 1, window);
    }

    const pages: (number | string)[] = [1];
    if (startPage > 2) pages.push('...');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < total - 1) pages.push('...');
    if (total > 1) pages.push(total);

    this.pagesToShow = pages;
  }

  goToPage(page: number | string): void {
    if (page === '...' || page === this.currentPage) return;
    this.currentPage = page as number;
    this.fetchUnverifiedAttendance();
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.fetchUnverifiedAttendance();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchUnverifiedAttendance();
    }
  }
}