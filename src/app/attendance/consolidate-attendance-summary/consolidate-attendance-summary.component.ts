import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, ColumnApi, ColGroupDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-consolidate-attendance-summary',
  templateUrl: './consolidate-attendance-summary.component.html',
  styleUrls: ['./consolidate-attendance-summary.component.css'],
})
export class ConsolidateAttendanceSummaryComponent {
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  gridApiActive: GridApi | undefined;
  searchValue: string = '';

  gridApi!: GridApi;
  columnDefs: (ColDef | ColGroupDef)[] = [];
  defaultColDef: ColDef = {
    resizable: false,
    sortable: true,
  };
  rowData: any[] = [];
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();
  isLoading: boolean = false;

  fromDate: string = '';
  toDate: string = '';


  constructor(private service: HrmserviceService) { }

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

  years = [2023, 2024, 2025];

  // Header map with dot color
  HEADERS = [
    { key: 'P', color: '#11FFA1' },
    { key: 'A', color: '#F90004' },
    { key: 'W', color: '#EDD000' },
    { key: 'W/od', color: '#9FFF04' },
    { key: 'H', color: '#04BCFF' },
    { key: 'WFH/2', color: '#0066EB' },
    { key: 'HD', color: '#0066EB' },
    { key: 'HR', color: '#005936' },
    { key: 'OT', color: '#FFA704' },
    { key: 'LT', color: '#880021' },
    { key: 'Th', color: '#BD7B00' },
  ];

  ngOnInit() {
    this.loadData();
    this.fetchConsolidateSummary();
  }

  onMonthYearChange() {
    this.selectedMonth = Number(this.selectedMonth);
    this.loadData();
    this.fetchConsolidateSummary();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    setTimeout(() => this.scrollToSelectedMonth(), 200);
  }

  onFilterBoxChange() {
    if (this.gridApi) {
      this.gridApi.setQuickFilter(this.searchValue);
    }
  }

  onSelectionChange() {
    this.loadData();
    setTimeout(() => this.scrollToSelectedMonth(), 200);
  }

  scrollToSelectedMonth() {
    if (this.gridApi) {
      // Middle index of the HEADERS array (11 items -> index 5)
      const firstHeader = this.HEADERS[0].key;
      // Construct the field name like 'month-4-PR'
      const targetField = `month-${this.selectedMonth}-${firstHeader}`;
      this.gridApi.ensureColumnVisible(targetField);
    }
  }

  loadData() {
    const baseCols: (ColDef | ColGroupDef)[] = [
      { headerName: 'Employee Code', field: 'id', pinned: 'left', width: 150 },
      { headerName: 'Employee Name', field: 'employeeName', pinned: 'left' },
    ];

    for (let i = 0; i < 12; i++) {
      const monthName = this.months[i].name;
      const group: ColGroupDef = {
        headerName: `${monthName} ${this.selectedYear}`,
        groupId: `month-${i}`,
        children: this.HEADERS.map((h) => ({
          headerName: this.getCustomHeader(h.key, h.color),
          field: `month-${i}-${h.key}`,
          colId: `month-${i}-${h.key}`,
          headerComponentParams: {
            template: this.getCustomHeader(h.key, h.color),
          },
          width: 80,
        })),
      };
      baseCols.push(group);
    }

    this.columnDefs = baseCols;
  }

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  getCustomHeader(label: string, color: string): string {
    return `<div style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 100%;">
                <div>${label}</div>
                <div style="width: 8px; height: 8px; margin: auto; border-radius: 50%; background: ${color}; margin-top: 2px;"></div>
              </div>`;
  }

  // fetchConsolidateSummary() {
  //   this.isLoading = true;
  //   this.service.post('fetch/ConsolidatedSummary', {}).subscribe((res: any) => {
  //     if (res.status === 'success') {
  //       const result = res.data;
  //       const employeeMap = new Map();

  //       Object.keys(result).forEach((monthKey) => {
  //         const monthIndex = parseInt(monthKey.split('-')[1]) - 1; // e.g., '2025-06' -> 5

  //         result[monthKey].forEach((item: any) => {
  //           const empId = item.employee_code;

  //           if (!employeeMap.has(empId)) {
  //             employeeMap.set(empId, {
  //               id: empId,
  //               employeeName: item.emp_name,
  //             });
  //           }

  //           const row = employeeMap.get(empId);

  //           row[`month-${monthIndex}-P`] = item.present_days || '';
  //           row[`month-${monthIndex}-A`] = item.absent_days || '';
  //           row[`month-${monthIndex}-W`] = item.weekend || '';
  //           row[`month-${monthIndex}-W/od`] = item.weekend_od || '';
  //           row[`month-${monthIndex}-H`] = item.holiday_days || '';
  //           row[`month-${monthIndex}-WFH/2`] = item.work_from_home_half_day || '';
  //           row[`month-${monthIndex}-HD`] = item.half_day || '';
  //           row[`month-${monthIndex}-LT`] = item.late || '';
  //           row[`month-${monthIndex}-HR`] = ''; // Add logic if needed
  //           row[`month-${monthIndex}-OT`] = item.total_overtime || '';
  //           row[`month-${monthIndex}-Th`] = ''; // Add logic if needed

  //           employeeMap.set(empId, row);
  //         });
  //       });

  //       this.rowData = Array.from(employeeMap.values());
  //       setTimeout(() => this.scrollToSelectedMonth(), 200);
  //     } else {
  //       this.rowData = [];
  //       console.error(res.error);
  //     }
  //   });
  //   this.isLoading = false;
  // }

  fetchConsolidateSummary() {
    if (!this.fromDate || !this.toDate) return;

    this.isLoading = true;
    this.service.post('fetch/ConsolidatedSummary', { from_date: this.fromDate, to_date: this.toDate })
      .subscribe((res: any) => {
        if (res.status === 'success') {
          const result = res.data;
          const employeeMap = new Map<string, any>();

          Object.keys(result).forEach((monthKey) => {
            result[monthKey].forEach((item: any) => {
              const empId = item.employee_code;

              if (!employeeMap.has(empId)) {
                employeeMap.set(empId, {
                  employeeCode: empId,
                  employeeName: item.emp_name
                });
              }

              const row = employeeMap.get(empId);

              // safe field names
              row[`${monthKey}-P`] = item.present_days || '';
              row[`${monthKey}-A`] = item.absent_days || '';
              row[`${monthKey}-W`] = item.weekend || '';
              row[`${monthKey}-WOD`] = item.weekend_od || '';
              row[`${monthKey}-H`] = item.holiday_days || '';
              row[`${monthKey}-WFH2`] = item.work_from_home_half_day || '';
              row[`${monthKey}-HD`] = item.half_day || '';
              row[`${monthKey}-LT`] = item.late || '';
              row[`${monthKey}-OT`] = item.total_overtime || '';
              row[`${monthKey}-Period`] = `${item.period_start} - ${item.period_end}`;

              employeeMap.set(empId, row);
            });
          });

          this.rowData = Array.from(employeeMap.values());

          // rebuild columns to match safe field names
          this.loadDynamicMonthColumns(result);

        } else {
          this.rowData = [];
        }
        this.isLoading = false;
      });
  }

  loadDynamicMonthColumns(groupedData: any): void {
    const dynamicCols: (ColDef | ColGroupDef)[] = [
      { headerName: 'Employee Code', field: 'employeeCode', pinned: 'left', width: 160 },
      { headerName: 'Employee Name', field: 'employeeName', pinned: 'left', width: 180 },
    ];

    // Sort month keys chronologically
    const sortedMonthKeys = Object.keys(groupedData).sort(
      (a, b) => new Date(a + '-01').getTime() - new Date(b + '-01').getTime()
    );

    sortedMonthKeys.forEach((monthKey) => {
      const sample = groupedData[monthKey][0];
      const monthLabel = new Date(monthKey + '-01').toLocaleString('default', { month: 'short', year: 'numeric' });
      const period = sample?.period_start && sample?.period_end
        ? ` (${sample.period_start} - ${sample.period_end})`
        : '';

      const group: ColGroupDef = {
        headerName: `${monthLabel}${period}`,
        children: [
          { headerName: this.getHeaderWithDot('P', '#11FFA1'), field: `${monthKey}-P`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('P', '#11FFA1') } },
          { headerName: this.getHeaderWithDot('A', '#F90004'), field: `${monthKey}-A`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('A', '#F90004') } },
          { headerName: this.getHeaderWithDot('W', '#EDD000'), field: `${monthKey}-W`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('W', '#EDD000') } },
          { headerName: this.getHeaderWithDot('W/OD', '#9FFF04'), field: `${monthKey}-WOD`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('W/OD', '#9FFF04') } },
          { headerName: this.getHeaderWithDot('H', '#04BCFF'), field: `${monthKey}-H`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('H', '#04BCFF') } },
          { headerName: this.getHeaderWithDot('WFH/2', '#0066EB'), field: `${monthKey}-WFH2`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('WFH/2', '#0066EB') } },
          { headerName: this.getHeaderWithDot('HD', '#0066EB'), field: `${monthKey}-HD`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('HD', '#0066EB') } },
          { headerName: this.getHeaderWithDot('LT', '#880021'), field: `${monthKey}-LT`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('LT', '#880021') } },
          { headerName: this.getHeaderWithDot('OT', '#FFA704'), field: `${monthKey}-OT`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('OT', '#FFA704') } },
        ]
      };

      dynamicCols.push(group);
    });

    this.columnDefs = dynamicCols;
  }

  showDashIfEmpty(params: any) {
    return params.value || '-';
  }

  getHeaderWithDot(label: string, color: string): string {
    return `<div style="display:flex; flex-direction:column; align-items:center;">
            <span>${label}</span>
            <span style="width:8px; height:8px; border-radius:50%; background:${color}; margin-top:2px;"></span>
          </div>`;
  }

  onDateRangeChange() {
    if (this.fromDate && this.toDate) {
      this.fetchConsolidateSummary();
    }
  }


  // search code
  emptyInput() {
    this.searchValue = '';
    window.location.reload();
  }

  // download template
  downloadTemplate() {
    alert('download template');
  }

  exportToExcel() {
    const wsData: any[][] = [];
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const statuses = ['P', 'A', 'W', 'W/Od', 'H', 'WFH/2', 'HD', 'HR', 'OT', 'LT'];

    const year = this.selectedYear;
    const startMonth = 0;
    const endMonth = 11;

    const headerRow1 = ['ID', 'Employee Name'];
    for (let m = startMonth; m <= endMonth; m++) {    
      const cleanLabel = monthLabels[m].split('(')[0].trim();
      headerRow1.push(`${cleanLabel} ${year}`, ...Array(statuses.length - 1).fill(''));
    }

    const headerRow2 = ['', ''];
    for (let m = startMonth; m <= endMonth; m++) {
      headerRow2.push(...statuses);
    }

    wsData.push(headerRow1);
    wsData.push(headerRow2);

    this.rowData.forEach((row: any) => {
      const dataRow = [row.id, row.employeeName];
      for (let m = startMonth; m <= endMonth; m++) {
        statuses.forEach(status => {
          dataRow.push(row[`month-${m}-${status}`] || '');
        });
      }
      wsData.push(dataRow);
    });

    const merges: XLSX.Range[] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    ];

    for (let i = 0, col = 2; i <= endMonth - startMonth; i++) {
      merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + statuses.length - 1 } });
      col += statuses.length;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    worksheet['!merges'] = merges;

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Attendance Summary': worksheet },
      SheetNames: ['Attendance Summary'],
    };

    XLSX.writeFile(workbook, `Attendance_Summary_${year}.xlsx`);
  }

}
