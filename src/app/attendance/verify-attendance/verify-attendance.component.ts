import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-verify-attendance',
  templateUrl: './verify-attendance.component.html',
  styleUrls: ['./verify-attendance.component.css']
})
export class VerifyAttendanceComponent implements OnInit {

  rowData: any[] = [];
  isLoading: boolean = false;
  searchInputValue: string = '';
  searchTimeout: any;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  selectedIds: Set<number> = new Set();

  private gridApi!: GridApi;

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
    {
      headerName: '',
      field: 'attendance_live_id',
      flex: 0,
      width: 50,
      sortable: false,
      filter: false,
      // Header checkbox (select all)
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
    },
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

  gridOptions = {
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 25, 50, 100],
    rowSelection: 'multiple' as const,
    suppressRowClickSelection: true,  // only checkbox triggers selection
  };

  constructor(
    private service: HrmserviceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }
    this.fetchUnverifiedAttendance();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  fetchUnverifiedAttendance(): void {
    const body: any = {
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
        } else {
          this.rowData = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Fetch Unverified Attendance Error:', err);
        this.toastr.error('Failed to fetch records.');
      }
    });
  }

  // Returns selected attendance_live_ids from AG Grid
  getSelectedIds(): number[] {
    if (!this.gridApi) return [];
    return this.gridApi
      .getSelectedRows()
      .map((row: any) => row.attendance_live_id)
      .filter(Boolean);
  }

  get selectedCount(): number {
    return this.gridApi ? this.gridApi.getSelectedRows().length : 0;
  }

  verifySelected(): void {
    const ids = this.getSelectedIds();

    if (ids.length === 0) {
      this.toastr.warning('Please select at least one record to verify.');
      return;
    }

    if (!confirm(`Verify ${ids.length} selected attendance record(s)?`)) return;

    this.isLoading = true;

    this.service.post('verify-attendance', {
      month: this.selectedMonth,
      year: this.selectedYear,
      attendance_live_ids: ids,
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.toastr.success(
            `Inserted: ${res.inserted} | Skipped: ${res.skipped} | Verified: ${res.verified}`,
            'Verification Complete'
          );
          // Show warning if some employees were not in payroll
          if (res.warning) {
            this.toastr.warning(res.warning, 'Payroll Warning', { timeOut: 6000 });
          }
          this.fetchUnverifiedAttendance();
        } else {
          // All records failed payroll check
          this.toastr.error(res.message || 'Verification failed.', 'Error', { timeOut: 6000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Something went wrong.');
      }
    });
  }

  verifyAll(): void {
    if (!confirm(`Verify ALL unverified attendance for ${this.months[this.selectedMonth - 1].label} ${this.selectedYear}?`)) return;

    this.isLoading = true;

    this.service.post('verify-attendance', {
      month: this.selectedMonth,
      year: this.selectedYear,
      // no attendance_live_ids → backend verifies all
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.toastr.success(
            `Inserted: ${res.inserted} | Skipped: ${res.skipped} | Verified: ${res.verified}`,
            'Verification Complete'
          );
          this.fetchUnverifiedAttendance();
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
      this.fetchUnverifiedAttendance();
    }, 500);
  }

  onFilterChange(): void {
    this.fetchUnverifiedAttendance();
  }

  clearFilter(): void {
    this.searchInputValue = '';
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();
    this.fetchUnverifiedAttendance();
  }
}