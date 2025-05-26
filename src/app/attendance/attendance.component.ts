import { Component, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
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
 
  constructor( private toastr: ToastrService){ }
 
  ngOnInit() {
    this.loadTodayDataFromStorage();
  }
 
  public defaultColDef: ColDef = {
    editable: false,
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true
  };
 
columnDefs: ColDef[] = [
  { headerName: 'Employee ID', field: 'Employee ID' },
  { headerName: 'Attendance Date', field: 'Attendance Date' },
  { headerName: 'Check In', field: 'Check In' },
  { headerName: 'Check Out', field: 'Check Out' },
  { headerName: 'Shift Id', field: 'Shift Id' },
  { headerName: 'Status', field: 'Status' },
];
 
 
 
 
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

  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      alert('Please upload only one file');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const rawData = XLSX.utils.sheet_to_json(ws, { raw: true });

      const formatTime = (excelTime: number) => {
        if (typeof excelTime !== 'number') return excelTime;
        const totalMinutes = Math.round(excelTime * 24 * 60);
        const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
        const minutes = (totalMinutes % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      this.rowData = rawData.map((row: any) => ({
        ...row,
        'Check In': formatTime(row['Check In']),
        'Check Out': formatTime(row['Check Out']),
      }));

      if (this.gridApiActive) {
        this.gridApiActive.setRowData(this.rowData);
      }
    };

    reader.readAsBinaryString(target.files[0]);
  }
 
  downloadTemplate(): void {
    const userConfirmed = confirm("Do you want to download the daily attendance template?");
    if (userConfirmed) {
      const headers = ['Employee_ID', 'Attendance_Date', 'CheckIn', 'CheckOut', 'Shift Id', 'Status'];
      const exampleRow = [
        '1',
        '26-05-2025',
        '09:00 AM',
        '06:00 PM',
        '1',
        'P'
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
        Attendance: {
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