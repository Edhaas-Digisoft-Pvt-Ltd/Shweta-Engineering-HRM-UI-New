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
  startDate: string = this.getFirstDayOfMonth();
  endDate: string = this.getLastDayOfMonth();

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
    admin_marked_absent: boolean;
  } = {
      attendance_live_id: null,
      employee_code: '',
      emp_name: '',
      currentdate: '',
      shift_details: '',
      shiftLabel: '',
      logged_in_time: '',
      logged_out_time: '',
      admin_marked_absent: false,
    };
  loginTimeError: boolean = false;
  logoutTimeError: boolean = false;
  loginShiftError: string = '';
  logoutShiftError: string = '';

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
    { headerName: 'Date', field: 'currentdate', valueFormatter: this.service.dateFormatter },
    {
      headerName: 'Login Time',
      field: 'logged_in_time',
      valueGetter: (p) => p.data?.admin_marked_absent === 'Yes' ? '' : (p.data?.logged_in_time || ''),
    },
    {
      headerName: 'Logout Time',
      field: 'logged_out_time',
      valueGetter: (p) => p.data?.admin_marked_absent === 'Yes' ? '' : (p.data?.logged_out_time || ''),
    },
    {
      headerName: 'Shift',
      field: 'shift_details',
      valueGetter: (p) => p.data?.admin_marked_absent === 'Yes' ? '' : (p.data?.shift_details || ''),
      valueFormatter: (p) => {
        if (p.value == '1') return 'Morning';
        if (p.value == '2') return 'Evening';
        return p.value || '';
      }
    },
    { headerName: 'Status', field: 'attendance_status', width: 110, flex: 0 },
    // ── Action column ────────────────────────────────────────────────────────
    {
      headerName: 'Action',
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
    this.fetchUnverifiedAttendance();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  fetchUnverifiedAttendance(): void {
    const body: any = {};
    if (this.startDate) body.start_date = this.startDate;
    if (this.endDate) body.end_date = this.endDate;

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
  private stashedLogin: string = '';
  private stashedLogout: string = '';
  private stashedShift: string = '';
  private stashedShiftLabel: string = '';

  openEditModal(row: any): void {
    const shift = row.shift_details?.toString() || '';
    const isAbsent = row.admin_marked_absent === 'Yes';
    const shiftLabel = shift === '1' ? 'Morning' : shift === '2' ? 'Evening' : shift;

    this.stashedLogin = row.logged_in_time || '';
    this.stashedLogout = row.logged_out_time || '';
    this.stashedShift = shift;
    this.stashedShiftLabel = shiftLabel;

    this.editRecord = {
      attendance_live_id: row.attendance_live_id,
      employee_code: row.employee?.employee_code || '',
      emp_name: row.employee?.emp_name || '',
      currentdate: row.currentdate || '',
      shift_details: isAbsent ? '' : shift,
      shiftLabel: isAbsent ? '' : shiftLabel,
      logged_in_time: isAbsent ? '' : (row.logged_in_time || ''),
      logged_out_time: isAbsent ? '' : (row.logged_out_time || ''),
      admin_marked_absent: isAbsent,
    };
    this.showEditModal = true;
  }
  onAbsentToggleChange(): void {
    if (this.editRecord.admin_marked_absent) {
      this.stashedLogin = this.editRecord.logged_in_time;
      this.stashedLogout = this.editRecord.logged_out_time;
      this.stashedShift = this.editRecord.shift_details;
      this.stashedShiftLabel = this.editRecord.shiftLabel;

      this.editRecord.logged_in_time = '';
      this.editRecord.logged_out_time = '';
      this.editRecord.shift_details = '';
      this.editRecord.shiftLabel = '';

      this.loginTimeError = false;
      this.logoutTimeError = false;
      this.loginShiftError = '';
      this.logoutShiftError = '';
    } else {
      this.editRecord.logged_in_time = this.stashedLogin || '';
      this.editRecord.logged_out_time = this.stashedLogout || '';
      this.editRecord.shift_details = this.stashedShift || '';
      this.editRecord.shiftLabel = this.stashedShiftLabel || '';
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.isSaving = false;
    this.loginTimeError = false;
    this.logoutTimeError = false;
    this.loginShiftError = '';
    this.logoutShiftError = '';
  }

  // Full validation for both login and logout
  validateTimes(): boolean {
    if (this.editRecord.admin_marked_absent) {
      this.loginTimeError = false;
      this.logoutTimeError = false;
      this.loginShiftError = '';
      this.logoutShiftError = '';
      return true;
    }
    const timeRegex = /^(\d{1,2}):(\d{2})(:\d{2})?\s*(AM|PM)$/i;

    const loginVal = this.editRecord.logged_in_time.trim();
    const logoutVal = this.editRecord.logged_out_time.trim();

    // Reset all errors
    this.loginTimeError = false;
    this.logoutTimeError = false;
    this.loginShiftError = '';
    this.logoutShiftError = '';

    let hasError = false;

    // --- Login validation ---
    const loginMatch = loginVal.match(timeRegex);
    if (!loginVal || !loginMatch) {
      this.loginTimeError = true;
      hasError = true;
    } else {
      let hours = parseInt(loginMatch[1], 10);
      const minutes = parseInt(loginMatch[2], 10);
      const mer = loginMatch[4].toUpperCase();

      if (hours < 1 || hours > 12 || minutes > 59) {
        this.loginTimeError = true;
        hasError = true;
      } else {
        if (mer === 'PM' && hours !== 12) hours += 12;
        if (mer === 'AM' && hours === 12) hours = 0;
        const totalMins = hours * 60 + minutes;

        if (this.editRecord.shift_details === '1' && (totalMins < 420 || totalMins > 1140)) {
          this.loginShiftError = 'Morning shift login time must be 7:00 AM or later.';
          hasError = true;
        }
        if (this.editRecord.shift_details === '2' && (totalMins > 420 && totalMins < 1140)) {
          this.loginShiftError = 'Evening shift login  time must be 7:00 PM or later.';
          hasError = true;
        }
      }
    }

    // --- Logout validation ---
    const logoutMatch = logoutVal.match(timeRegex);
    if (!logoutVal || !logoutMatch) {
      this.logoutTimeError = true;
      hasError = true;
    } else {
      let hours = parseInt(logoutMatch[1], 10);
      const minutes = parseInt(logoutMatch[2], 10);
      const mer = logoutMatch[4].toUpperCase();

      if (hours < 1 || hours > 12 || minutes > 59) {
        this.logoutTimeError = true;
        hasError = true;
      } else {
        if (mer === 'PM' && hours !== 12) hours += 12;
        if (mer === 'AM' && hours === 12) hours = 0;
        const totalMins = hours * 60 + minutes;

        if (this.editRecord.shift_details === '1' && (totalMins < 420 || totalMins > 1140)) {
          this.logoutShiftError = 'Morning shift logout time must be 7:00 PM or before.';
          hasError = true;
        }
        if (this.editRecord.shift_details === '2' && (totalMins > 420 && totalMins < 1140)) {
          this.logoutShiftError = 'Evening shift logout time must be 7:00 AM or before.';
          hasError = true;
        }
      }
    }

    return !hasError;
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

    const payload: any = {
      attendance_live_id: this.editRecord.attendance_live_id,
      admin_marked_absent: this.editRecord.admin_marked_absent,
      updated_by: updatedBy ? parseInt(updatedBy) : null,
    };

    if (!this.editRecord.admin_marked_absent) {
      payload.logged_in_time = this.formatTime(this.editRecord.logged_in_time);
      payload.logged_out_time = this.formatTime(this.editRecord.logged_out_time);
    }

    this.service.post('update-attendance-time', payload).subscribe({
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
      start_date: this.startDate,
      end_date: this.endDate,
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
    if (!confirm(`Verify ALL unverified attendance from ${this.startDate} to ${this.endDate}?`)) return;

    this.isLoading = true;

    this.service.post('verify-attendance', {
      start_date: this.startDate,
      end_date: this.endDate,
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
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.fetchUnverifiedAttendance();
    }, 500);
  }

  onDateRangeChange(): void {
    this.fetchUnverifiedAttendance();
  }

  clearFilter(): void {
    this.searchInputValue = '';
    this.startDate = this.getFirstDayOfMonth();
    this.endDate = this.getLastDayOfMonth();
    this.fetchUnverifiedAttendance();
  }
}