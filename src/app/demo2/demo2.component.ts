import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { CalendarOption } from '@fullcalendar/angular/private-types';
// import * as bootstrap from 'bootstrap';
import dayGridPlugin from '@fullcalendar/daygrid';
declare var bootstrap: any;
import {
  ColDef,
  GridApi,
  ColumnApi,
  GridReadyEvent,
  ColGroupDef,
  GridOptions,
} from 'ag-grid-community';

@Component({
  selector: 'app-demo2',
  templateUrl: './demo2.component.html',
  styleUrls: ['./demo2.component.css'],
})
export class Demo2Component {
  // selectedYear = new Date().getFullYear();
  // years: number[] = [];

  // columnDefs: any[] = [];
  // rowData: any[] = [];

  // subHeaders = ['A', 'B', 'H', 'WFH/2', 'W', 'HR', 'OT', 'LT', 'TH', 'HD'];
  // // subHeaders = [
  // //   { name: 'A', value: 0 },
  // //   { name: 'B', value: 1 },
  // //   { name: 'H', value: 2 },
  // //   { name: 'WFH/2', value: 3 },
  // //   { name: 'W', value: 4 },
  // //   { name: 'HR', value: 5 },
  // //   { name: 'OT', value: 6 },
  // //   { name: 'LT', value: 7 },
  // //   { name: 'TH', value: 8 },
  // //   { name: 'HD', value: 9 },
  // // ]

  // colorMap: any = {
  //   A: 'red',
  //   B: 'blue',
  //   H: 'green',
  //   'WH/2': 'orange',
  //   W: 'purple',
  //   HR: 'teal',
  //   OT: 'brown',
  //   LT: 'pink',
  //   TH: 'gray',
  //   HD: 'gold',
  // };

  // ngOnInit() {
  //   this.generateYears();
  //   this.setupGrid();
  // }

  // generateYears() {
  //   const current = new Date().getFullYear();
  //   for (let i = current - 5; i <= current + 5; i++) {
  //     this.years.push(i);
  //   }
  // }
  // selectedYear = new Date().getFullYear();
  // selectedMonth = new Date().getMonth();
  // setupGrid() {
  //   const daysInMonth = new Date(
  //     this.selectedYear,
  //     this.selectedMonth + 1,
  //     0
  //   ).getDate();
  //   this.columnDefs = [
  //     {
  //       headerName: 'ID',
  //       field: 'id',
  //       pinned: 'left',
  //       width: 80,
  //     },
  //     {
  //       headerName: 'Employee Name',
  //       field: 'employeeName',
  //       pinned: 'left',
  //       width: 150,
  //     },
  //   ];

  //   const months = [
  //     'January',
  //     'February',
  //     'March',
  //     'April',
  //     'May',
  //     'June',
  //     'July',
  //     'August',
  //     'September',
  //     'October',
  //     'November',
  //     'December',
  //   ];

  //   months.forEach((month, index) => {
  //     const children = this.subHeaders.map((header) => {
  //       return {
  //         headerName: header,
  //         field: `${month}_${header}`,
  //         cellRenderer: (params: any) => this.dotAndImageRenderer(params),
  //         width: 70,
  //       };
  //     });

  //     this.columnDefs.push({
  //       headerName: `${month} - ${this.selectedYear}`,
  //       children,
  //     });
  //     console.log(children)
  //   });

  //   this.rowData = [
  //     // {
  //     //   id: 1,
  //     //   employeeName: 'John Doe',
  //     //   January_A: '1',
  //     //   January_B: '1',
  //     //   January_H: '1',
  //     //   January_W: '1',
  //     // },
  //     // {
  //     //   id: 1,
  //     //   employeeName: 'John Doe',
  //     //   January_A: '1',
  //     //   January_B: '1',
  //     //   January_H: '1',
  //     //   January_W: '1',
  //     // },
  //   ];
  // }

  // onYearChange() {
  //   this.setupGrid();
  // }
  // dotAndImageRenderer(params: any) {
  //   const value = params.value;
  //   console.log(value)

  //   const wrapper = document.createElement('div');
  //   wrapper.style.display = 'flex';
  //   wrapper.style.flexDirection = 'column';
  //   wrapper.style.alignItems = 'center';
  //   // wrapper.style.justifyContent = 'center';
  //   wrapper.style.height = '100%';

  //   const valueDiv = document.createElement('div');
  //   valueDiv.innerText = value || '';
  //   wrapper.appendChild(valueDiv);

  //   if (
  //     value === 'A' ||
  //     value === 'P' ||
  //     value === 'H' ||
  //     value === 'W' ||
  //     value === 'WFH/2' ||
  //     value === 'W/od' ||
  //     value === 'HD' ||
  //     value === 'LT'
  //   ) {
  //     const dot = document.createElement('div');
  //     dot.style.width = '8px';
  //     dot.style.height = '8px';
  //     dot.style.margin = '2px auto 0';
  //     dot.style.borderRadius = '50%';

  //     if (value === 'A') dot.style.background = '#F90004';
  //     else if (value === 'P') dot.style.background = '#11FFA1';
  //     else if (value === 'H') dot.style.background = '#04BCFF';
  //     else if (value === 'W') dot.style.background = '#EDD000';
  //     else if (value === 'WFH/2') dot.style.background = '#0066EB';
  //     else if (value === 'W/od') dot.style.background = '#9FFF04';
  //     else if (value === 'HD') dot.style.background = '#E000B0';
  //     else if (value === 'LT') dot.style.background = '#880021';

  //     wrapper.appendChild(dot);
  //   }

  //   return wrapper;
  // }

  // gridApi!: GridApi;
  // columnDefs: (ColDef | ColGroupDef)[] = [];
  // defaultColDef: ColDef = {
  //   resizable: false,
  //   sortable: true,
  // };
  // rowData: any[] = [];
  // selectedYear = new Date().getFullYear();
  // selectedMonth = new Date().getMonth();

  // months = [
  //   { name: 'Jan', value: 0 },
  //   { name: 'Feb', value: 1 },
  //   { name: 'Mar', value: 2 },
  //   { name: 'Apr', value: 3 },
  //   { name: 'May', value: 4 },
  //   { name: 'Jun', value: 5 },
  //   { name: 'Jul', value: 6 },
  //   { name: 'Aug', value: 7 },
  //   { name: 'Sep', value: 8 },
  //   { name: 'Oct', value: 9 },
  //   { name: 'Nov', value: 10 },
  //   { name: 'Dec', value: 11 },
  // ];

  // years = [2023, 2024, 2025];

  // // Header map with dot color
  // HEADERS = [
  //   { key: 'P', color: '#11FFA1' },
  //   { key: 'A', color: '#F90004' },
  //   { key: 'W', color: '#EDD000' },
  //   { key: 'W/od', color: '#9FFF04' },
  //   { key: 'H', color: '#04BCFF' },
  //   { key: 'WFH/2', color: '#0066EB' },
  //   { key: 'HD', color: '#0066EB' },
  //   { key: 'HR', color: '#005936' },
  //   { key: 'OT', color: '#FFA704' },
  //   { key: 'LT', color: '#880021' },
  //   { key: 'Th', color: '#BD7B00' },
  // ];

  // ngOnInit() {
  //   this.generateColumnDefs();
  //   this.generateRowData();
  // }

  // onGridReady(params: any) {
  //   this.gridApi = params.api;
  //   setTimeout(() => this.scrollToSelectedMonth(), 200);
  // }

  // onSelectionChange() {
  //   this.generateColumnDefs();
  //   setTimeout(() => this.scrollToSelectedMonth(), 200);
  // }

  // scrollToSelectedMonth() {
  //   if (this.gridApi) {
  //     // Middle index of the HEADERS array (11 items -> index 5)
  //     const midHeader = this.HEADERS[Math.floor(this.HEADERS.length / 2)].key;

  //     // Construct the field name like 'month-4-HR' (for May, assuming HR is middle)
  //     const targetField = `month-${this.selectedMonth}-${midHeader}`;

  //     this.gridApi.ensureColumnVisible(targetField);
  //   }
  // }

  // generateColumnDefs() {
  //   const baseCols: (ColDef | ColGroupDef)[] = [
  //     { headerName: 'ID', field: 'id', pinned: 'left' },
  //     { headerName: 'Employee Name', field: 'employeeName', pinned: 'left' },
  //   ];

  //   for (let i = 0; i < 12; i++) {
  //     const monthName = this.months[i].name;
  //     const group: ColGroupDef = {
  //       headerName: `${monthName} ${this.selectedYear}`,
  //       groupId: `month-${i}`,
  //       children: this.HEADERS.map((h) => ({
  //         headerName: this.getCustomHeader(h.key, h.color),
  //         field: `month-${i}-${h.key}`,
  //         colId: `month-${i}-${h.key}`,
  //         headerComponentParams: {
  //           template: this.getCustomHeader(h.key, h.color),
  //         },
  //         width: 80,
  //       })),
  //     };
  //     baseCols.push(group);
  //   }

  //   this.columnDefs = baseCols;
  // }

  // getCustomHeader(label: string, color: string): string {
  //   return `<div style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 100%;">
  //             <div>${label}</div>
  //             <div style="width: 8px; height: 8px; margin: auto; border-radius: 50%; background: ${color}; margin-top: 2px;"></div>
  //           </div>`;
  // }

  // generateRowData() {
  //   this.rowData = [
  //     {
  //       id: 0,
  //       employeeName: 'Employee 1',
  //       'month-0-A': 3,
  //       'month-0-H': 4,
  //       'month-0-HD': 6,
  //       'month-0-HR': 8,
  //       'month-0-LT': 7,
  //       'month-0-OT': 4,
  //       'month-0-P': 0,
  //       'month-0-Th': 9,
  //       'month-0-W': 5,
  //       'month-0-W/od': 7,
  //       'month-0-WFH/2': 5,
  //       'month-1-A': 3,
  //       'month-1-H': 4,
  //       'month-1-HD': 6,
  //       'month-1-HR': 8,
  //       'month-1-LT': 7,
  //       'month-1-OT': 4,
  //       'month-1-P': 0,
  //       'month-1-Th': 9,
  //       'month-1-W': 5,
  //       'month-1-W/od': 7,
  //       'month-1-WFH/2': 5,
  //       'month-2-A': 3,
  //       'month-2-H': 4,
  //       'month-2-HD': 6,
  //       'month-2-HR': 8,
  //       'month-2-LT': 7,
  //       'month-2-OT': 4,
  //       'month-2-P': 0,
  //       'month-2-Th': 9,
  //       'month-2-W': 5,
  //       'month-2-W/od': 7,
  //       'month-2-WFH/2': 5,
  //       'month-3-A': 3,
  //       'month-3-H': 4,
  //       'month-3-HD': 6,
  //       'month-3-HR': 8,
  //       'month-3-LT': 7,
  //       'month-3-OT': 4,
  //       'month-3-P': 0,
  //       'month-3-Th': 9,
  //       'month-3-W': 5,
  //       'month-3-W/od': 7,
  //       'month-3-WFH/2': 5,
  //       'month-4-A': 3,
  //       'month-4-H': 4,
  //       'month-4-HD': 6,
  //       'month-4-HR': 8,
  //       'month-4-LT': 7,
  //       'month-4-OT': 4,
  //       'month-4-P': 0,
  //       'month-4-Th': 9,
  //       'month-4-W': 5,
  //       'month-4-W/od': 7,
  //       'month-4-WFH/2': 5,
  //       'month-5-A': 3,
  //       'month-5-H': 4,
  //       'month-5-HD': 6,
  //       'month-5-HR': 8,
  //       'month-5-LT': 7,
  //       'month-5-OT': 4,
  //       'month-5-P': 0,
  //       'month-5-Th': 9,
  //       'month-5-W': 5,
  //       'month-5-W/od': 7,
  //       'month-5-WFH/2': 5,
  //       'month-6-A': 3,
  //       'month-6-H': 4,
  //       'month-6-HD': 6,
  //       'month-6-HR': 8,
  //       'month-6-LT': 7,
  //       'month-6-OT': 4,
  //       'month-6-P': 0,
  //       'month-6-Th': 9,
  //       'month-6-W': 5,
  //       'month-6-W/od': 7,
  //       'month-6-WFH/2': 5,
  //       'month-7-A': 3,
  //       'month-7-H': 4,
  //       'month-7-HD': 6,
  //       'month-7-HR': 8,
  //       'month-7-LT': 7,
  //       'month-7-OT': 4,
  //       'month-7-P': 0,
  //       'month-7-Th': 9,
  //       'month-7-W': 5,
  //       'month-7-W/od': 7,
  //       'month-7-WFH/2': 5,
  //       'month-8-A': 3,
  //       'month-8-H': 4,
  //       'month-8-HD': 6,
  //       'month-8-HR': 8,
  //       'month-8-LT': 7,
  //       'month-8-OT': 4,
  //       'month-8-P': 0,
  //       'month-8-Th': 9,
  //       'month-8-W': 5,
  //       'month-8-W/od': 7,
  //       'month-8-WFH/2': 5,
  //       'month-9-A': 3,
  //       'month-9-H': 4,
  //       'month-9-HD': 6,
  //       'month-9-HR': 8,
  //       'month-9-LT': 7,
  //       'month-9-OT': 4,
  //       'month-9-P': 0,
  //       'month-9-Th': 9,
  //       'month-9-W': 5,
  //       'month-9-W/od': 7,
  //       'month-9-WFH/2': 5,
  //       'month-10-A': 3,
  //       'month-10-H': 4,
  //       'month-10-HD': 6,
  //       'month-10-HR': 8,
  //       'month-10-LT': 7,
  //       'month-10-OT': 4,
  //       'month-10-P': 0,
  //       'month-10-Th': 9,
  //       'month-10-W': 5,
  //       'month-10-W/od': 7,
  //       'month-10-WFH/2': 5,
  //       'month-11-A': 3,
  //       'month-11-H': 4,
  //       'month-11-HD': 6,
  //       'month-11-HR': 8,
  //       'month-11-LT': 7,
  //       'month-11-OT': 4,
  //       'month-11-P': 0,
  //       'month-11-Th': 9,
  //       'month-11-W': 5,
  //       'month-11-W/od': 7,
  //       'month-11-WFH/2': 5,
  //       'month-12-A': 3,
  //       'month-12-H': 4,
  //       'month-12-HD': 6,
  //       'month-12-HR': 8,
  //       'month-12-LT': 7,
  //       'month-12-OT': 4,
  //       'month-12-P': 0,
  //       'month-12-Th': 9,
  //       'month-12-W': 5,
  //       'month-12-W/od': 7,
  //       'month-12-WFH/2': 5,
  //     },
  //
  //   ];
  // }
  calendarEvents: EventInput[] = [];
  selectedDate: string = '';
  eventTitle: string = '';
  eventDesc: string = '';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: this.calendarEvents
  };

  ngOnInit() {
    // Now that we're in Angular, use ES modules for plugin
    import('@fullcalendar/daygrid').then((module) => {
      this.calendarOptions.plugins = [module.default];
    });
  }

  handleDateClick(arg: any) {
    this.selectedDate = arg.dateStr;
    this.eventTitle = '';
    this.eventDesc = '';

    const modalEl = document.getElementById('eventModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  addEvent() {
    if (this.eventTitle.trim()) {
      const newEvent = {
        title: `${this.eventTitle}: ${this.eventDesc}`, // ✅ text only
        date: this.selectedDate
      };
      this.calendarEvents = [...this.calendarEvents, newEvent];
      this.calendarOptions.events = [...this.calendarEvents];

      // Close modal
      const modalEl = document.getElementById('eventModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }

      // Clear inputs
      this.eventTitle = '';
      this.eventDesc = '';
    }
  }
}
