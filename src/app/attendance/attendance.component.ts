import { Component, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from '../hrmservice.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent {
  @ViewChild('agGrid', { static: false }) agGrid!: AgGridAngular;

  rowData: any[] = [];
  activeTab: string = 'live';
  searchInputValue: string = '';
  gridApiActive: any;
  role: string = '';
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;
  currentFilter: string = '';

  startDate: string = this.getFirstDayOfMonth();
  endDate: string = this.getLastDayOfMonth();

  constructor(private toastr: ToastrService, private service: HrmserviceService, private router: Router,) { }

  ngOnInit() {
    this.role = this.service.getRole();

    this.loadTodayDataFromStorage();
    // this.fetchAttendance();
    this.getPaginationValueAndFetchAttendance();

    this.activeTab = this.hasAccess('Live_attendance', 'view') ? 'live' : 'tab1';
  }

  hasAccess(module: string, permission: string): boolean {
    return this.service.hasPermission(module, permission);
  }

  public defaultColDef: ColDef = {
    editable: false,
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true
  };

  columnDefs: ColDef[] = [
    { headerName: 'Emp Code', field: 'employee_code', editable: true },
    { headerName: 'Emp name', field: 'emp_name', editable: true },
    { headerName: 'Date', field: 'attendance_date', valueFormatter: this.service.dateFormatter },
    { headerName: 'CheckIn', field: 'check_in' },
    { headerName: 'CheckOut', field: 'check_out' },
    {
      headerName: 'Shift',
      field: 'shift_id',
      valueFormatter: (params: any) => {
        if (params.value == 1) return 'Morning';
        if (params.value == 2) return 'Evening';
        return params.value; // fallback
      }
    },
    {
      headerName: 'Status', field: 'status',
      valueGetter: (params) => {
        const row = params.data;

        // If backend status exists → show it
        if (row.status && row.status.trim() !== '') {
          return row.status;
        }

        // If check-in & check-out exist → mark Present
        if (row.check_in) {
          return 'P';
        }

        return ''; // otherwise blank
      }
    },
  ];

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0]; // yyyy-MM-dd
  }

  getFormattedTodayDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return today.toLocaleDateString('en-GB', options).replace(/ /g, ' ');
  }
  getTodayDayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
  }

  loadTodayDataFromStorage(): void {
    const allData = JSON.parse(localStorage.getItem('attendanceData') || '[]');
    const todayStr = this.getTodayDateString();
    this.rowData = allData.filter((row: { attendance_date: string; }) => row.attendance_date === todayStr);
  }

  selectedFile: File | null = null;

  //import attendance
  onFileChange(event: any) {
    this.isLoading = true;
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const formData = new FormData();
    formData.append('upload_file', file);

    this.service.post('import-attendance', formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status === 'success') {
        this.toastr.success(res.data);
        this.fetchAttendance();
      } else {
        if (res.duplicates > 0)
          this.toastr.error('Duplicates record found')
        else
          this.toastr.error(res.data)
      }
    });

  }

  applyFilter(status: string) {
    this.currentFilter = status;
    this.currentPage = 1;
    this.fetchAttendance();
  }

  clearFilter() {
    this.currentFilter = '';
    this.searchInputValue = '';
    this.startDate = this.getFirstDayOfMonth();
    this.endDate = this.getLastDayOfMonth();
    this.currentPage = 1;
    this.fetchAttendance();
  }

  fetchAttendance() {
    const body: any = {
      page: this.currentPage,
      limit: this.paginationvalue,
      start_date: this.startDate,
      end_date: this.endDate,
    };

    if (this.currentFilter) {
      body.status = this.currentFilter;
    }

    if (this.searchInputValue && this.searchInputValue.trim() !== '') {
      body.search = this.searchInputValue.trim();
    }

    this.isLoading = true;

    this.service.post('fetch/attendance', body).subscribe({
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
          this.totalRows = 0;
          this.pagesToShow = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Fetch Attendance Error:', err);
      }
    });
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
    this.fetchAttendance();
  }

  downloadTemplate(): void {
    const userConfirmed = confirm("Do you want to download the daily attendance template?");
    if (userConfirmed) {
      const headers = ['employee_code', 'attendance_date', 'check_in', 'check_out', 'shift_id'];
      const exampleRow = [
        'SEE20250501',
        'dd-mm-yyyy',
        '7:00:00 AM',
        '7:00:00 PM',
        '1',
      ];

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
      const workbook: XLSX.WorkBook = { Sheets: { 'Template': worksheet }, SheetNames: ['Template'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Attendance_Template.xlsx');

      this.toastr.success('Download successfully !');
    }
  }


  // Monthly attendance template download
  MonthlyAttendanceTemplate(): void {
    const userConfirmed = confirm("Do you want to download the monthly attendance template?");
    if (userConfirmed) {
      const headers = ['Emp Code', 'Name'];
      for (let i = 1; i <= 31; i++) {
        headers.push(i.toString());
      }
      headers.push('Total Present');

      const exampleRow1 = ['1001', 'John Doe', 'P', 'P', 'A', 'P', 'P', 'P', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'A', '28'];
      const exampleRow2 = ['1002', 'Jane Smith', 'P', 'LT', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', '30'];

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, exampleRow1, exampleRow2]);
      const workbook: XLSX.WorkBook = { Sheets: { 'Monthly Attendance': worksheet }, SheetNames: ['Monthly Attendance'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Monthly_Attendance_Template.xlsx');

      this.toastr.success('Download successfully !');
    }
  }

  onGridReady(params: any): void {
    this.gridApiActive = params.api;
    this.gridApiActive.setRowData(this.rowData);
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  filterByStatus(status: string): void {
    if (this.agGrid && this.agGrid.api) {
      this.agGrid.api.setFilterModel({
        status: {
          type: 'equals',
          filter: status
        }
      });
      this.agGrid.api.onFilterChanged();
    }
  }

  clearStatusFilter(): void {
    if (this.agGrid && this.agGrid.api) {
      this.agGrid.api.setFilterModel(null);
      this.agGrid.api.onFilterChanged();
    }
  }

  onFilterBoxChange(): void {
    if (this.gridApiActive) {
      this.gridApiActive.setQuickFilter(this.searchInputValue);
    }
  }

  emptyInput(): void {
    this.searchInputValue = '';
    this.onFilterBoxChange();
  }

  exportAttendance() {
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    //  const from_date = '2025-08-01';
    //  const to_date = '2025-08-30';

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const from_date = formatDate(firstDayLastMonth);
    const to_date = formatDate(lastDayLastMonth);

    console.log({ from_date, to_date });

    this.service.post('export-attendance', { from_date, to_date }).subscribe((res: any) => {
      if (res.status === 'success') {
        console.log(res);

        const data = res.data.map((i: any) => ({
          employee_code: i.employee_code,
          emp_name: i.emp_name,
          attendance_date: this.formatToDDMMYYYY(i.currentdate),
          check_in: i.logged_in_time,
          check_out: i.logged_out_time,
          shift_id: i.shift_details
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        const monthName = firstDayLastMonth.toLocaleString('en-US', { month: 'short' });
        XLSX.writeFile(wb, `Attendance_${monthName}_${firstDayLastMonth.getFullYear()}.xlsx`);

        this.toastr.success('Attendance exported successfully!');
      } else {
        this.toastr.error('Failed to export attendance.');
      }
    });
  }

  // check_in: this.removeAMPM(i.logged_in_time),
  // check_out: this.removeAMPM(i.logged_out_time),

  // Convert date (yyyy-mm-dd) → mm-dd-yyyy
  formatToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Convert time to 07:00, 19:00 format
  formatToHHMM(timeStr: string): string {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const date = new Date(`1970-01-01 ${timeStr}`);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  normalizeTimeToHHMM(timeStr: string | null): string {
    if (!timeStr) return '';

    timeStr = timeStr.trim();

    // Check if time has AM/PM
    const is12Hour = /AM|PM/i.test(timeStr);

    let hours = 0;
    let minutes = 0;

    if (is12Hour) {
      const [time, meridian] = timeStr.split(' ');
      const [h, m] = time.split(':').map(Number);
      hours = h % 12; // 12 AM/PM edge case
      if (/PM/i.test(meridian)) hours += 12;
      minutes = m || 0;
    } else {
      const [h, m] = timeStr.split(':').map(Number);
      hours = h || 0;
      minutes = m || 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Remove AM/PM from time string
  removeAMPM(timeStr: string | null): string {
    if (!timeStr) return '';
    return timeStr.replace(/\s?(AM|PM)/i, '').trim();
  }

  searchTimeout: any;

  onSearchChange(): void {
    // Debounce search to avoid too many API calls
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.fetchAttendance();
    }, 500);
  }

  getPaginationValueAndFetchAttendance() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.fetchAttendance();
      } else {
        this.paginationvalue = 10;
        this.fetchAttendance();
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

    // Ensure window doesn't exceed total
    if (endPage >= total) {
      endPage = total - 1; // leave space for last page
      startPage = Math.max(2, total - pageWindow); // maintain consistent window size
    }

    // Special case for first page
    if (current === 1) {
      startPage = 2;
      endPage = Math.min(total - 1, pageWindow);
    }

    const pages: (number | string)[] = [];
    pages.push(1); // always first page

    // Add ellipsis if gap exists between first page and startPage
    if (startPage > 2) {
      pages.push('...');
    }

    // Add pages in window
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis if gap exists between endPage and last page
    if (endPage < total - 1) {
      pages.push('...');
    }

    // Always add last page
    if (total > 1) pages.push(total);

    this.pagesToShow = pages;
  }


  goToPage(page: number | string) {
    if (page === '...') return;
    if (page !== this.currentPage) {
      this.currentPage = page as number;
      this.fetchAttendance();
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.fetchAttendance();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchAttendance();
    }
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

  exportVerifiedOrImportedAttendnace(): void {
    const body: any = {
      isexport: true,
      start_date: this.startDate,
      end_date: this.endDate,
    };

    if (this.currentFilter) {
      body.status = this.currentFilter;
    }

    if (this.searchInputValue && this.searchInputValue.trim() !== '') {
      body.search = this.searchInputValue.trim();
    }

    this.isLoading = true;

    this.service.post('fetch/attendance', body).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success' && res.data.length) {
          const data = res.data.map((i: any) => ({
            employee_code: i.employee_code,
            emp_name: i.emp_name,
            attendance_date: this.formatToDDMMYYYY(i.attendance_date),
            check_in: i.check_in,
            check_out: i.check_out,
            shift_id: i.shift_id,
          }));

          const ws = XLSX.utils.json_to_sheet(data, {
            header: ['employee_code', 'emp_name', 'attendance_date', 'check_in', 'check_out', 'shift_id'],
          });
          ws['!cols'] = [
            { wch: 15 }, { wch: 20 }, { wch: 15 },
            { wch: 12 }, { wch: 12 }, { wch: 10 },
          ];

          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
          XLSX.writeFile(wb, `Attendance_${this.startDate}_to_${this.endDate}.xlsx`);

          this.toastr.success('Attendance exported successfully!');
        } else {
          this.toastr.warning('No data found to export.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.toastr.warning('No data found to export.');
        } else {
          this.toastr.error('Error while exporting data.');
        }
      }
    });
  }
}