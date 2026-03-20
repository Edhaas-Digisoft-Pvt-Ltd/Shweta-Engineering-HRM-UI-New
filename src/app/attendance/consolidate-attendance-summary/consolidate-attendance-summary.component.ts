import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, ColumnApi, ColGroupDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';

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
  attendanceData: any;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;
  columnApi!: ColumnApi;


  constructor(private toastr: ToastrService, private service: HrmserviceService) { }

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

  // years = [2023, 2024, 2025,2026];

  // Header map with dot color
  HEADERS = [
    { key: 'P', color: '#11FFA1' },
    { key: 'A', color: '#F90004' },
    { key: 'W/O', color: '#EDD000' },
    // { key: 'W/od', color: '#9FFF04' },
    { key: 'H', color: '#04BCFF' },
    // { key: 'WFH', color: '#0066EB' },
    // { key: 'HD', color: '#0066EB' },
    { key: 'OT', color: '#FFA704' },
    { key: 'LT', color: '#880021' },
    { key: 'Th', color: '#BD7B00' },
  ];

  ngOnInit() {
    this.loadData();
    // this.fetchConsolidateSummary();
    this.getPaginationValueAndFetchAttendance();
  }

  onMonthYearChange() {
    this.selectedMonth = Number(this.selectedMonth);
    this.loadData();
    this.fetchConsolidateSummary();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    setTimeout(() => this.scrollToSelectedMonth(), 200);
  }

  searchTimeout: any;

  onFilterBoxChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.fetchConsolidateSummary();
    }, 500);
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

  fetchConsolidateSummary(page: number = 1): void {
    if (!this.fromDate || !this.toDate) return;
    const payload = {
      from_date: this.fromDate,
      to_date: this.toDate,
      page: this.currentPage,
      search: this.searchValue.trim() || '',
    };

    this.isLoading = true;
    this.service.post('fetch/ConsolidatedSummary', payload)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          if (res.status === 'success' && (!res.data || Object.keys(res.data).length === 0)) {
            this.rowData = [];
            this.toastr.warning(res.message || 'No employees found for the selected date range.');
            return;
          }

          if (res.status === 'success') {
            const result = res.data;
            this.totalRows = res.pagination.total;
            this.currentPage = res.pagination.page;
            this.lastPage = res.pagination.last_page;
            this.generatePageNumbers(this.paginationvalue);
            this.attendanceData = res.data;
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
                row[`${monthKey}-W/O`] = item.weekend || '';
                row[`${monthKey}-H`] = item.holiday_days || '';
                row[`${monthKey}-LT`] = item.late || '';
                row[`${monthKey}-OT`] = item.total_overtime || '';
                row[`${monthKey}-Period`] = `${item.period_start} - ${item.period_end}`;

                employeeMap.set(empId, row);
              });
            });

            this.rowData = Array.from(employeeMap.values());
            this.loadDynamicMonthColumns(result);
            setTimeout(() => {
              if (this.gridApi && this.columnApi) {
                const totalColumns = this.columnApi.getAllDisplayedColumns().length;

                // one month
                if (totalColumns <= 15) {
                  this.gridApi.sizeColumnsToFit();
                }
                // multiple months
                else {
                  this.columnApi.resetColumnState();
                  this.columnApi.autoSizeAllColumns();
                }
              }
            }, 100);
          } else {
            this.rowData = [];
            this.toastr.warning(res.message || 'Error fetching consolidated summary.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.rowData = [];

          // Laravel validation error comes in err.error.message
          const msg = err?.error?.message || 'Error fetching consolidated summary.';
          this.toastr.warning(msg);
          console.error('Error:', err);
        }
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
          { headerName: this.getHeaderWithDot('W/O', '#EDD000'), field: `${monthKey}-W/O`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('W/O', '#EDD000') } },
          { headerName: this.getHeaderWithDot('H', '#04BCFF'), field: `${monthKey}-H`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('H', '#04BCFF') } },
          // { headerName: this.getHeaderWithDot('HD', '#0066EB'), field: `${monthKey}-HD`, width: 70, valueFormatter: this.showDashIfEmpty, headerComponentParams: { template: this.getHeaderWithDot('HD', '#0066EB') } },
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
    if (!this.rowData?.length) {
      this.toastr.warning('No data to export');
      return;
    }

    const statuses = ['P', 'A', 'W/O', 'H', 'WFH2', 'HD', 'HR', 'OT', 'LT'];

    // Collect all months dynamically from rowData
    const monthKeys = new Set<string>();
    this.rowData.forEach(emp => {
      Object.keys(emp).forEach(key => {
        const match = key.match(/^(\d{4}-\d{2})-/); // matches YYYY-MM-STATUS
        if (match) monthKeys.add(match[1]);
      });
    });

    const months = Array.from(monthKeys).sort(); // sorted months

    // Build headers
    const header1 = ['EmployeeCode', 'EmployeeName'];
    const header2 = ['', ''];

    months.forEach(month => {
      // Add merged cell for month spanning statuses
      header1.push(...Array(statuses.length).fill(month));
      // Second row: statuses
      header2.push(...statuses);
    });

    // Prepare sheet data
    const sheetData: any[][] = [];
    sheetData.push(header1);
    sheetData.push(header2);

    this.rowData.forEach(emp => {
      const row = [emp.employeeCode, emp.employeeName];
      months.forEach(month => {
        statuses.forEach(status => {
          const field = `${month}-${status}`;
          row.push(emp[field] !== undefined ? emp[field] : 0);
        });
      });
      sheetData.push(row);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Merge first row for month labels
    let colIndex = 2;
    months.forEach(() => {
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({ s: { r: 0, c: colIndex }, e: { r: 0, c: colIndex + statuses.length - 1 } });
      colIndex += statuses.length;
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    XLSX.writeFile(wb, `Attendance_${this.fromDate}_to_${this.toDate}.xlsx`);
  }

  getPaginationValueAndFetchAttendance() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.fetchConsolidateSummary();
      } else {
        this.paginationvalue = 10;
        this.fetchConsolidateSummary();
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

    if (endPage >= total) {
      endPage = total - 1;
      startPage = Math.max(2, total - pageWindow);
    }

    if (current === 1) {
      startPage = 2;
      endPage = Math.min(total - 1, pageWindow);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < total - 1) {
      pages.push('...');
    }

    if (total > 1) pages.push(total);

    this.pagesToShow = pages;
  }


  goToPage(page: number | string) {
    if (page === '...') return;
    if (page !== this.currentPage) {
      this.currentPage = page as number;
      this.fetchConsolidateSummary(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchConsolidateSummary(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.fetchConsolidateSummary(this.currentPage);
    }
  }

}
