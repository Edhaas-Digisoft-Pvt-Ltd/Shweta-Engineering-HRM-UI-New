import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColumnApi, GridReadyEvent, ColDef, GridOptions } from 'ag-grid-community';
import { AttendanceActionComponent } from '../attendance-action/attendance-action.component';
import * as XLSX from 'xlsx';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-attendance-summary',
  templateUrl: './attendance-summary.component.html',
  styleUrls: ['./attendance-summary.component.css']
})

export class AttendanceSummaryComponent {
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  searchValue: string = '';
  gridApiActive: GridApi | undefined;

  years = [2023, 2024, 2025];
  months = [
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 1 },
    { name: 'Mar', value: 2 },
    { name: 'Apr', value: 3 },
    { name: 'May', value: 4 },
    { name: 'Jun', value: 5 },
    { name: 'Jul', value: 6 },
    { name: 'Aug', value: 7 },
    { name: 'Sep', value: 8 },
    { name: 'Oct', value: 9 },
    { name: 'Nov', value: 10 },
    { name: 'Dec', value: 11 },
  ];

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();

  columnDefs: any[] = [];
  rowData: any[] = [];

  constructor(private service: HrmserviceService) {}

  ngOnInit() {
    this.loadData();
    this.fetchDailySummary();
  }

  onMonthYearChange() {
    this.selectedMonth = Number(this.selectedMonth); 
    this.loadData();
    this.fetchDailySummary();
  }

  loadData() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();

    this.columnDefs = [
      { headerName: 'ID', field: 'id', pinned: 'left', width: 70 },
      { headerName: 'Employee Name', field: 'name', pinned: 'left', width: 200 },
    ];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(Date.UTC(this.selectedYear, this.selectedMonth, i));
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const header = `${i}\n${dayName}`;
      const isSunday = dayName === 'Sun';
      const fieldKey = this.formatDateKey(date);

      this.columnDefs.push({
        headerValueGetter: () => header,
        field: fieldKey,
        cellRenderer: (params: any) => this.dotAndImageRenderer(params, isSunday),
        minWidth: 50,
        maxWidth: 80,
      });
    }
  }

  gridOptions: GridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  formatDateKey(date: Date): string {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
      .toISOString()
      .split('T')[0];
  }

  get selectedMonthYear(): string {
    return `${this.months[this.selectedMonth].name} ${this.selectedYear}`;
  }

  fetchDailySummary() {
    const payload = {
      month: this.selectedMonth + 1,
      year: this.selectedYear
    };

    this.service.post('fetch/DailySummary', payload).subscribe((res: any) => {
      if (res.status === 'success') {
        const rawData = res.data;
        this.rowData = this.buildExportRowMap(rawData);
      } else {
        console.log(res.error);
      }
    });
  }

  dotAndImageRenderer(params: any, isSunday: boolean) {
    const value = params.value;
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.height = '100%';

    if (isSunday) {
      const img = document.createElement('img');
      img.src = 'assets/sunday.png';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.marginBottom = '2px';
      img.style.position = 'absolute';
      img.style.zIndex = '-1';
      wrapper.appendChild(img);
    }

    const valueDiv = document.createElement('div');
    valueDiv.innerText = value || '';
    wrapper.appendChild(valueDiv);

    const dot = document.createElement('div');
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.margin = '2px auto 0';
    dot.style.borderRadius = '50%';

    if (value === 'A') dot.style.background = '#F90004';
    else if (value === 'P') dot.style.background = '#11FFA1';
    else if (value === 'H') dot.style.background = '#04BCFF';
    else if (value === 'W') dot.style.background = '#EDD000';
    else if (value === 'WFH/2') dot.style.background = '#0066EB';
    else if (value === 'W/od') dot.style.background = '#9FFF04';
    else if (value === 'HD') dot.style.background = '#E000B0';
    else if (value === 'LT') dot.style.background = '#880021';

    if (dot.style.background) {
      wrapper.appendChild(dot);
    }

    return wrapper;
  }


  // search code
  emptyInput() {
    this.searchValue = '';
    window.location.reload();
  }

  onGridReady(params: { api: GridApi }) {
    this.gridApiActive = params.api;
  }

  onFilterBoxChange() {
    if (this.gridApiActive) {
      this.gridApiActive.setQuickFilter(this.searchValue);
    }
  }

  buildExportRowMap(data: any[]) {
    const employeeMap: { [key: string]: any } = {};

    data.forEach((item) => {
      const key = item.employe_id;
      const date = new Date(item.attendance_date);
      const field = this.formatDateKey(date); 
      const status = (item.status || '').toUpperCase();

      if (!employeeMap[key]) {
        employeeMap[key] = {
          id: item.employe_id,
          name: item.emp_name,
          _dates: new Set<string>() 
        };
      }

      if (!employeeMap[key]._dates.has(field)) {
        employeeMap[key][field] = status;
        employeeMap[key]._dates.add(field);
      }
    });

    return Object.values(employeeMap).map(emp => {
      delete emp._dates;
      return emp;
    });
  }

  exportToExcel() {
    const worksheetData = [this.getExportHeaders(), ...this.getExportRows()];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, 'Attendance-Summary.xlsx');
  }

  getExportHeaders(): string[] {
    const headers = ['ID', 'Employee Name'];
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(Date.UTC(this.selectedYear, this.selectedMonth, i));
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      headers.push(`${this.months[this.selectedMonth].name} ${i} ${day}`);
    }
    return headers;
  }

  getExportRows(): any[][] {
    return this.rowData.map(row => {
      const rowArray: any[] = [row.id, row.name];
      const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(Date.UTC(this.selectedYear, this.selectedMonth, i));
        const key = this.formatDateKey(date);
        rowArray.push(row[key] || '');
      }

      return rowArray;
    });
  }
}
