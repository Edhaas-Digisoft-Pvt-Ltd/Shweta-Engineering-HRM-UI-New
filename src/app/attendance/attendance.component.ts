import { Component, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from '../hrmservice.service';
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent {
  @ViewChild('agGrid', { static: false }) agGrid!: AgGridAngular;

  rowData: any[] = [];
  activeTab: string = 'tab1';
  searchInputValue: string = '';
  gridApiActive: any;
  role: string = '';

  constructor(private toastr: ToastrService, private service: HrmserviceService) { }

  ngOnInit() {
    this.role = this.service.getRole();
    
    this.loadTodayDataFromStorage();
    this.fetchAttendance();
  }

  public defaultColDef: ColDef = {
    editable: false,
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true
  };

  columnDefs: ColDef[] = [
    { headerName: 'Employee Code', field: 'employee_code' },
    { headerName: 'Date', field: 'attendance_date' },
    { headerName: 'CheckIn', field: 'check_in' },
    { headerName: 'CheckOut', field: 'check_out' },
    { headerName: 'ShiftId', field: 'shift_id' },
    { headerName: 'Status', field: 'status' },
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

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const formData = new FormData();
    formData.append('upload_file', file);

    this.service.post('import-attendance', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success(res.data);
        this.fetchAttendance();
      } else {
        console.log(res.error);
      }
    });
  }

  fetchAttendance(): void {
    this.service.post('fetch/attendance', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.rowData = res.data
      } else {
        console.log(res.error);
      }
    });
  }

  downloadTemplate(): void {
    const userConfirmed = confirm("Do you want to download the daily attendance template?");
    if (userConfirmed) {
      const headers = ['employee_code', 'attendance_date', 'check_in', 'check_out', 'shift_id'];
      const exampleRow = [
        'SEE20250501',
        'mm-dd-yyyy',
        '7:00',
        '19:00',
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
}