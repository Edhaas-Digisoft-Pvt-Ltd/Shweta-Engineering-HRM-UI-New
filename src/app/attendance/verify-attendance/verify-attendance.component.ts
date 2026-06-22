import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
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

  // ── Edit Modal ─────────────────────────────────────────────────────────────
  showEditModal: boolean = false;
  isSaving: boolean = false;

  editRecord: {
    attendance_live_id: number | null;
    employee_code: string;
    emp_name: string;
    currentdate: string;
    shift_details: string;
    shiftLabel: string;
    logged_in_time: string;
    logged_out_time: string;
  } = {
      attendance_live_id: null,
      employee_code: '',
      emp_name: '',
      currentdate: '',
      shift_details: '',
      shiftLabel: '',
      logged_in_time: '',
      logged_out_time: '',
    };
  loginTimeError: boolean = false;
  logoutTimeError: boolean = false;

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
    // ── Action column ────────────────────────────────────────────────────────
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      flex: 0,
      width: 90,
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-sm mb-1" style="background-color:#C8E3FF">
              <i class="bi bi-pencil"></i>
            </button>`;
      },
      onCellClicked: (event: any) => {
        this.openEditModal(event.data);
      },
    },
    // ────────────────────────────────────────────────────────────────────────
  ];

  gridOptions = {
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 25, 50, 100],
    rowSelection: 'multiple' as const,
    suppressRowClickSelection: true,
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

  // ── Edit Modal Methods ─────────────────────────────────────────────────────

  openEditModal(row: any): void {
    const shift = row.shift_details?.toString() || '';
    this.editRecord = {
      attendance_live_id: row.attendance_live_id,
      employee_code: row.employee?.employee_code || '',
      emp_name: row.employee?.emp_name || '',
      currentdate: row.currentdate || '',
      shift_details: shift,
      shiftLabel: shift === '1' ? 'Morning' : shift === '2' ? 'Evening' : shift,
      logged_in_time: row.logged_in_time || '',
      logged_out_time: row.logged_out_time || '',
    };
    // removed updateTimeConstraints()
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.isSaving = false;
    this.loginTimeError = false;
    this.logoutTimeError = false;
  }

  // Full validation for both login and logout
  validateTimes(): boolean {
    // Regex: HH:MM or HH:MM:SS followed by AM/PM (case insensitive)
    const timeRegex = /^(\d{1,2}):(\d{2})(:\d{2})?\s*(AM|PM)$/i;

    const loginVal = this.editRecord.logged_in_time.trim();
    const logoutVal = this.editRecord.logged_out_time.trim();

    let hasError = false;

    // Reset red borders first
    this.loginTimeError = false;
    this.logoutTimeError = false;

    // --- Login validation ---
    if (!loginVal) {
      this.loginTimeError = true;
      hasError = true;
    } else {
      const match = loginVal.match(timeRegex);
      if (!match) {
        this.loginTimeError = true;
        hasError = true;
      } else {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const mer = match[4].toUpperCase();

        if (hours < 1 || hours > 12) { this.loginTimeError = true; hasError = true; }
        else if (minutes > 59) { this.loginTimeError = true; hasError = true; }
        else {
          // Convert to 24h for shift check
          if (mer === 'PM' && hours !== 12) hours += 12;
          if (mer === 'AM' && hours === 12) hours = 0;
          const totalMins = hours * 60 + minutes;

          if (this.editRecord.shift_details === '1' && totalMins < 420) {
            this.toastr.error('Morning shift login time must be 7:00 AM or later.');
            this.loginTimeError = true;
            hasError = true;
          }
          if (this.editRecord.shift_details === '2' && totalMins < 1140) {
            this.toastr.error('Evening shift login time must be 7:00 PM or later.');
            this.loginTimeError = true;
            hasError = true;
          }
        }
      }
    }

    // --- Logout validation ---
    if (!logoutVal) {
      this.logoutTimeError = true;
      hasError = true;
    } else {
      const match = logoutVal.match(timeRegex);
      if (!match) {
        this.logoutTimeError = true;
        hasError = true;
      } else {
        const minutes = parseInt(match[2], 10);
        const hours = parseInt(match[1], 10);
        if (hours < 1 || hours > 12 || minutes > 59) {
          this.logoutTimeError = true;
          hasError = true;
        }
      }
    }

    if (hasError) {
      // Only show generic toastr if no specific shift error was already shown
      const loginMatch = loginVal.match(timeRegex);
      const logoutMatch = logoutVal.match(timeRegex);
      if (!loginVal || !loginMatch || !logoutVal || !logoutMatch) {
        this.toastr.error('Please fill all required fields.');
      }
      return false;
    }

    return true;
  }

  // Format time before sending to backend
  private formatTime(val: string): string {
    if (!val) return val;
    val = val.trim();

    // Uppercase AM/PM
    val = val.replace(/\b(am|pm)\b/gi, m => m.toUpperCase());

    // Split timePart and meridiem: "7:00 PM" or "7:00:25 PM"
    const meridiemMatch = val.match(/^([\d:]+)\s*(AM|PM)$/i);
    if (meridiemMatch) {
      let timePart = meridiemMatch[1];
      const mer = meridiemMatch[2].toUpperCase();
      const parts = timePart.split(':');
      if (parts.length === 2) timePart = timePart + ':00';  // add :00 seconds
      val = timePart + ' ' + mer;
    }

    return val;
  }

  saveEditRecord(): void {
    if (!this.validateTimes()) return;

    this.isSaving = true;

    const updatedBy = sessionStorage.getItem('employeeId');

    this.service.post('update-attendance-time', {
      attendance_live_id: this.editRecord.attendance_live_id,
      logged_in_time: this.formatTime(this.editRecord.logged_in_time),
      logged_out_time: this.formatTime(this.editRecord.logged_out_time),
      updated_by:         updatedBy ? parseInt(updatedBy) : null,
    }).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.toastr.success('Attendance updated successfully.');
          this.closeEditModal();
          this.fetchUnverifiedAttendance();
        } else {
          this.toastr.error(res.message || 'Update failed.');
        }
      },
      error: () => {
        this.isSaving = false;
        this.toastr.error('Something went wrong while updating.');
      }
    });
  }

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

    if (!confirm(`Are you sure you want to verify ${ids.length} selected attendance record(s)?`)) return;

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
          if (res.warning) {
            this.toastr.warning(res.warning, 'Payroll Warning', { timeOut: 6000 });
          }
          this.fetchUnverifiedAttendance();
        } else {
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