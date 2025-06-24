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
      { headerName: 'ID', field: 'id', pinned: 'left' },
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

  fetchConsolidateSummary() {
    this.service.post('fetch/ConsolidatedSummary', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        const result = res.data;
        const employeeMap = new Map();

        Object.keys(result).forEach((monthKey) => {
          const monthIndex = parseInt(monthKey.split('-')[1]) - 1; // e.g., '2025-06' -> 5

          result[monthKey].forEach((item: any) => {
            const empId = item.employe_id;

            if (!employeeMap.has(empId)) {
              employeeMap.set(empId, {
                id: empId,
                employeeName: item.emp_name,
              });
            }

            const row = employeeMap.get(empId);

            row[`month-${monthIndex}-P`] = item.present_days || '';
            row[`month-${monthIndex}-A`] = item.absent_days || '';
            row[`month-${monthIndex}-W`] = item.weekend || '';
            row[`month-${monthIndex}-W/od`] = item.weekend_od || '';
            row[`month-${monthIndex}-H`] = item.holiday_days || '';
            row[`month-${monthIndex}-WFH/2`] = item.work_from_home_half_day || '';
            row[`month-${monthIndex}-HD`] = item.half_day || '';
            row[`month-${monthIndex}-LT`] = item.late || '';
            row[`month-${monthIndex}-HR`] = ''; // Add logic if needed
            row[`month-${monthIndex}-OT`] = item.total_overtime || '';
            row[`month-${monthIndex}-Th`] = ''; // Add logic if needed

            employeeMap.set(empId, row);
          });
        });

        this.rowData = Array.from(employeeMap.values());
        setTimeout(() => this.scrollToSelectedMonth(), 200);
      } else {
        this.rowData = [];
        console.error(res.error);
      }
    });
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
      headerRow1.push(`${monthLabels[m]} ${year}`, ...Array(statuses.length - 1).fill(''));
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
