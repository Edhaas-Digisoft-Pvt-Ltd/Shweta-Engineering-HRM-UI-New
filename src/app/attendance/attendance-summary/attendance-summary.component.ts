import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColumnApi, GridReadyEvent, ColDef, GridOptions } from 'ag-grid-community';
import { AttendanceActionComponent } from '../attendance-action/attendance-action.component';
import * as XLSX from 'xlsx';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-attendance-summary',
  templateUrl: './attendance-summary.component.html',
  styleUrls: ['./attendance-summary.component.css']
})

export class AttendanceSummaryComponent {
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  searchValue: string = '';
  gridApiActive: GridApi | undefined;

  // years = [2023, 2024, 2025, 2026];
  years: number[] = [];

  generateyears() {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();

    this.years = [];

    for (let year = startYear; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

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
  isLoading: boolean = false;
  CompanyNames: any[] = [];
  selectedCompanyId: any[] = ['all'];
  companyDropdownOpen: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  constructor(private toastr: ToastrService, private service: HrmserviceService, private elementRef: ElementRef) { }

  ngOnInit() {
    // const savedCompanyId = this.service.selectedCompanyId();
    // this.selectedCompanyId = savedCompanyId
    //   ? (Array.isArray(savedCompanyId) ? savedCompanyId : [savedCompanyId])
    //   : ['all'];
    this.selectedCompanyId = ['all'];
    this.generateyears();

    this.loadData();
    // this.fetchDailySummary();
    this.getPaginationValueAndFetchAttendance();
    this.getCompanyNames();
  }

  onMonthYearChange() {
    this.selectedMonth = Number(this.selectedMonth);
    this.loadData();
    this.fetchDailySummary();
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data;
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  toggleCompanyDropdown() {
    this.companyDropdownOpen = !this.companyDropdownOpen;
  }

  closeCompanyDropdown() {
    this.companyDropdownOpen = false;
  }

  isAllSelected(): boolean {
    return this.selectedCompanyId.includes('all');
  }

  isCompanySelected(companyId: any): boolean {
    return this.isAllSelected() || this.selectedCompanyId.includes(companyId);
  }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCompanyId = checked ? ['all'] : [this.CompanyNames[0]?.company_id].filter(Boolean);
    this.applyCompanyFilter();
  }

  toggleCompany(companyId: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    let ids = this.isAllSelected()
      ? this.CompanyNames.map((c: any) => c.company_id)
      : [...this.selectedCompanyId];

    if (checked) {
      if (!ids.includes(companyId)) {
        ids.push(companyId);
      }
    } else {
      ids = ids.filter((id: any) => id !== companyId);
    }

    if (ids.length === this.CompanyNames.length) {
      ids = ['all'];
    }
    this.selectedCompanyId = ids.length ? ids : [];

    this.applyCompanyFilter();
  }

  applyCompanyFilter() {
    this.currentPage = 1;
    this.fetchDailySummary();
  }

  get companyDropdownLabel(): string {
    if (this.isAllSelected()) return 'All Companies';
    if (this.selectedCompanyId.length === 0) return 'Select Company';
    if (this.selectedCompanyId.length === 1) {
      const match = this.CompanyNames.find(c => c.company_id === this.selectedCompanyId[0]);
      return match ? match.company_name : '1 Selected';
    }
    return `${this.selectedCompanyId.length} Companies Selected`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.companyDropdownOpen) {
      const clickedInside = this.elementRef.nativeElement
        .querySelector('.custom-select-dropdown')
        ?.contains(event.target);

      if (!clickedInside) {
        this.companyDropdownOpen = false;
      }
    }
  }

  loadData() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();

    this.columnDefs = [
      { headerName: 'Employee Code', field: 'id', pinned: 'left', width: 150, editable: true, },
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

  fetchDailySummary(page: number = 1): void {
    this.isLoading = true;

    const payload = {
      company_id: this.selectedCompanyId,
      month: this.selectedMonth + 1,
      year: this.selectedYear,
      page: page,
      isexport: false,
      search: this.searchValue.trim() || '',
    };

    if (this.searchValue && this.searchValue.trim() !== '') {
      payload['search'] = this.searchValue.trim();
    }

    this.service.post('fetch/DailySummary', payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.status === 'success') {
          if (!res.data?.length) {
            this.rowData = [];
            this.toastr.warning(res.message || 'No data found for selected month/year');
            return;
          }

          const rawData = res.data;
          const pagination = res.pagination || {};

          this.rowData = this.buildExportRowMap(rawData);
          this.totalRows = pagination.total ?? this.rowData.length;
          this.currentPage = pagination.page ?? 1;
          this.lastPage = pagination.last_page ?? 1;

          this.generatePageNumbers(this.paginationvalue);
        }
        else if (res.status === false || res.status === 'error' || res.data === 'No employees found for the given month and year.') {
          this.rowData = [];
          this.toastr.error(res.data);
        }
        else {
          this.rowData = [];
          this.toastr.error(res.data);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.rowData = [];
        this.toastr.error('Failed to fetch attendance summary.');
        console.error('Fetch error:', err);
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

    // if (isSunday) {
    //   const img = document.createElement('img');
    //   img.src = 'assets/sunday.png';
    //   img.style.width = '100%';
    //   img.style.height = '100%';
    //   img.style.marginBottom = '2px';
    //   img.style.position = 'absolute';
    //   img.style.zIndex = '-1';
    //   wrapper.appendChild(img);
    // }

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
    else if (value === 'OT') dot.style.background = '#eb9900ff';

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

  searchTimeout: any;

  onFilterBoxChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.fetchDailySummary();
    }, 500);
  }

  buildExportRowMap(data: any[]) {
    const employeeMap: { [key: string]: any } = {};

    data.forEach((item) => {
      const key = item.employee_code;
      const date = new Date(item.attendance_date);
      const field = this.formatDateKey(date);
      const status = (item.status || '').toUpperCase();

      if (!employeeMap[key]) {
        employeeMap[key] = {
          id: item.employee_code,
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
    this.isLoading = true;

    const payload = {
      company_id: this.selectedCompanyId,
      month: this.selectedMonth + 1,
      year: this.selectedYear,
      isexport: true // 👈 force full data
    };

    this.service.post('fetch/DailySummary', payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.status === 'success' && res.data?.length > 0) {
          const fullData = this.buildExportRowMap(res.data);
          this.generateExcel(fullData);
        } else {
          this.toastr.warning('No data available for export.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to export data');
      }
    });
  }

  generateExcel(data: any[]): void {
    const worksheetData = [this.getExportHeaders(), ...this.getExportRows()];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `Attendance-Summary-${this.selectedMonthYear}.xlsx`);
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

  getPaginationValueAndFetchAttendance() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.fetchDailySummary();
      } else {
        this.paginationvalue = 10;
        this.fetchDailySummary();
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
      this.fetchDailySummary(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchDailySummary(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.fetchDailySummary(this.currentPage);
    }
  }
}
