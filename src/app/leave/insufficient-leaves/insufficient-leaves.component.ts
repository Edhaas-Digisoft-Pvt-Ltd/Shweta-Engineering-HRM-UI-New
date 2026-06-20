import { Component, ElementRef, HostListener } from '@angular/core';
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
  selectedCompanyId: any[] = ['all'];
  companyDropdownOpen: boolean = false;
  rowData: any = [];
  isLoading: boolean = false;
  selectedValue: any = 1;
  CompanyNames: any[] = [];
  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  startDate: string = this.getFirstDayOfMonth();
  endDate: string = this.getLastDayOfMonth();

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    const currentDate = new Date();

    this.today = currentDate.toISOString().split('T')[0];
    const savedCompanyId = this.service.selectedCompanyId();
    this.selectedCompanyId = savedCompanyId
      ? (Array.isArray(savedCompanyId) ? savedCompanyId : [savedCompanyId])
      : ['all'];

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

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data;
      }
    });
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
    this.getInsufficientLeaves();
  }

  get companyDropdownLabel(): string {
    if (this.isAllSelected()) return 'All Companies';
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

  getInsufficientLeaves(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];

    const payload = {
      company_id: this.selectedCompanyId,
      start_date: this.startDate,
      end_date: this.endDate,
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

  onDateRangeChange(): void {
    this.currentPage = 1;
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

  getFirstDayOfMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  getLastDayOfMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  exportExcel() {
    this.isLoading = true;

    this.service.post('insufficient/leaves', {
      company_id: this.selectedCompanyId,
      start_date: this.startDate,
      end_date: this.endDate,
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
