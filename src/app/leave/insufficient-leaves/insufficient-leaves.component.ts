import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ModalServiceService } from 'src/app/modal-service.service';

@Component({
  selector: 'app-insufficient-leaves',
  templateUrl: './insufficient-leaves.component.html',
  styleUrls: ['./insufficient-leaves.component.css']
})
export class InsufficientLeavesComponent {
  today: string = new Date().toISOString().split('T')[0];
  gridApiActive: any;
  searchInputValue: any;
  params: any;
  selectedCompanyId: any;
  selectedYear: any;
  selectedMonth: any;
  rowData: any = [];
  isLoading: boolean = false;
  selectedValue: any = 1;
  financialYears: number[] = [];
  CompanyNames: any = [];
  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  months = [
    { id: 1, value: 'January' },
    { id: 2, value: 'February' },
    { id: 3, value: 'March' },
    { id: 4, value: 'April' },
    { id: 5, value: 'May' },
    { id: 6, value: 'June' },
    { id: 7, value: 'July' },
    { id: 8, value: 'August' },
    { id: 9, value: 'September' },
    { id: 10, value: 'October' },
    { id: 11, value: 'November' },
    { id: 12, value: 'December' }
  ];

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService) { }

  ngOnInit(): void {
    const currentDate = new Date();
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    this.today = currentDate.toISOString().split('T')[0];
    this.selectedCompanyId = this.service.selectedCompanyId();
    this.generateFinancialYears();

    this.getCompanyNames();
    this.getInsufficientLeaves();

    this.getPagination();
  }

  agInit(params: any): void {
    this.params = params;
  }

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.getInsufficientLeaves();
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  // financialYears = [2022, 2023, 2024, 2025];
  generateFinancialYears() {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();

    this.financialYears = [];

    for (let year = startYear; year <= currentYear; year++) {
      this.financialYears.push(year);
    }
  }

  getInsufficientLeaves(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];

    const payload = {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      page: page,
      isexport: false,
    };

    this.service.post('insufficient/leaves', payload).subscribe(
      (res: any) => {
        if (res.status) {
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            emp_name: item.emp_name,
            absent_date: item.absent_date
          }));
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;
          this.generatePageNumbers(this.paginationvalue);
        } else {
          this.toastr.error(res.message);
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('API Error:', error);

        if (error.status === 400 && error.error?.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Something went wrong while fetching data');
        }

        this.isLoading = false;
      }
    );
  }

  columnDefs: ColDef[] = [
    { headerName: 'Employee Code', field: 'employee_code', sortable: true, filter: true },
    { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true },
    { headerName: 'Absent Date', field: 'absent_date', sortable: true, filter: true },
  ];

  onYearMonthChange() {
    this.getInsufficientLeaves();
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }
  onFilterBoxChange() {
    this.gridApiActive.setQuickFilter(this.searchInputValue);
  }
  searchValue(searchValue: any) {
    throw new Error('Method not implemented.');
  }
  emptyInput() {
    this.searchInputValue = '';
    window.location.reload();
  }

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  refresh(params: any): boolean {
    return true;
  }

  exportExcel() {
    this.isLoading = true;

    this.service.post('insufficient/leaves', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      isexport: true
    }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data && res.data.length > 0) {

          const cleanText = (val: any) =>
            String(val ?? '').replace(/\u00A0/g, ' ').replace(/Â/g, '');

          const rows = res.data.map((r: any) => [
            r.employee_code,
            cleanText(r.emp_name),
            r.absent_date
          ]);

          const csvArray: string[][] = [
            ['Employee Code', 'Employee Name', 'Absent Date'],
            ...rows
          ];

          const csv = csvArray
            .map(row => row.map(v => `"${v ?? ''}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');

          link.href = URL.createObjectURL(blob);
          link.download = 'Insufficient_Leaves.csv';
          link.click();

          this.toastr.success('Absentee report exported successfully!');
        } else {
          this.toastr.warning('No data found to export');
        }

        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 400) {
          this.toastr.warning(err.error?.message || 'No data found to export');
        } else {
          this.toastr.error('Error while exporting absentee data');
        }
        this.isLoading = false;
      }
    });
  }

  getPagination() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.getInsufficientLeaves();
      } else {
        this.paginationvalue = 10;
        this.getInsufficientLeaves();
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
      this.getInsufficientLeaves(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getInsufficientLeaves(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getInsufficientLeaves(this.currentPage);
    }
  }

}
