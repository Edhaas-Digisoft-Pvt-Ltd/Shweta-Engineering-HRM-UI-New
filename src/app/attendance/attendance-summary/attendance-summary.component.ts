import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColumnApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { AttendanceActionComponent } from '../attendance-action/attendance-action.component';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-attendance-summary',
  templateUrl: './attendance-summary.component.html',
  styleUrls: ['./attendance-summary.component.css']
})

export class AttendanceSummaryComponent {
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  searchValue: string = '';
  gridApiActive: any;
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

  ngOnInit() {
    this.loadData();
  }

  onMonthYearChange() {
    this.loadData();
  }

  loadData() {
    const daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();

    this.columnDefs = [
      { headerName: 'ID', field: 'id', pinned: 'left', width: 50 },
      {
        headerName: 'Employee Name',
        field: 'name',
        pinned: 'left',
        width: 250,
      },
    ];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.selectedYear, this.selectedMonth, i);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const header = `${this.months[this.selectedMonth].name} ${i} ${day} `;
      const isSunday = day=== 'Sun';
      this.columnDefs.push({
        headerName: header,
        field: `day${i}`,
        cellRenderer: (params: any) => this.dotAndImageRenderer(params, isSunday),

      });
    }

    // Static data
    this.rowData = [
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
      {
        id: 1,
        name: 'Alice',
        day1: 'A',
        day2: 'P',
        day3: 'P',
        day4: 'W',
        day5: 'H',
        day6: 'W/od',
        day7: 'A',
        day8: 'W',
        day9: 'WFH/2',
        day10: 'A',
      },
    ];
  }

  dotAndImageRenderer(params: any, isSunday: boolean) {
    const value = params.value;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    // wrapper.style.justifyContent = 'center';
    wrapper.style.height = '100%';

    if (isSunday) {
      const img = document.createElement('img');
      img.src = 'assets/sunday.png'; // Replace with your image path
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.marginBottom = '2px';
      img.style.position = 'absolute'
      img.style.zIndex = '-1'

      wrapper.appendChild(img);
    }

    const valueDiv = document.createElement('div');
    valueDiv.innerText = value || '';
    wrapper.appendChild(valueDiv);

    if (
      value === 'A' ||
      value === 'P' ||
      value === 'H' ||
      value === 'W' ||
      value === 'WFH/2' ||
      value === 'W/od' ||
      value === 'HD' ||
      value === 'LT'
    ) {
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

      wrapper.appendChild(dot);
    }

    return wrapper;
  }


  // search code
  emptyInput() {
    this.searchValue = '';
    window.location.reload();
  }
  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  // download template
  downloadTemplate() {
    alert("download template")
  }
  onFilterBoxChange() {
    if (this.gridApiActive) {
      this.gridApiActive.setQuickFilter(this.searchValue);
    }
  }
  // export to excel work
  exportToExcel() {
    this.agGrid.api.exportDataAsExcel({
      fileName: 'Employee-Data.xlsx'
    });
  }
}
