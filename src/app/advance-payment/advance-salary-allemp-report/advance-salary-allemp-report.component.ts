import { Component, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef, GridApi } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-advance-salary-allemp-report',
  templateUrl: './advance-salary-allemp-report.component.html',
  styleUrls: ['./advance-salary-allemp-report.component.css']
})
export class AdvanceSalaryAllempReportComponent {
  today: string = new Date().toISOString().split('T')[0];
  title: String = 'Company Demo';
  activeTab: string = 'tab1';
  gridApiActive!: GridApi;
  role: string = '';
  columnDefs: ColDef[] = [];
  rowData: any = [];
  CompanyNames: any[] = [];
  selectedCompanyId: any[] = ['all'];
  companyDropdownOpen: boolean = false;
  selectedYear = new Date().getFullYear();
  selectedMonth: any;
  displayApprovedData!: FormGroup;
  approvedData!: any;
  isLoading: boolean = false;
  selectedAdvpayid: number = 0;
  tabledata: any = [];
  searchValue: string = '';
  searchTimeout: any;
  years: number[] = [];

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService, private elementRef: ElementRef) { }

  ngOnInit() {
    const savedCompanyId = this.service.selectedCompanyId();
    this.selectedCompanyId = savedCompanyId
      ? (Array.isArray(savedCompanyId) ? savedCompanyId : [savedCompanyId])
      : ['all'];
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.role = this.service.getRole();
    this.initializeColumns();
    this.getCompanyNames();
    this.getPagination();
    this.generateFinancialYears();

    this.displayApprovedData = this.fb.group({
      id: [{ value: '', disabled: true }],
      employeeName: [{ value: '', disabled: true }],
      company: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      requestDate: [{ value: '', disabled: true }],
      tenure: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      emi_status: [{ value: '', disabled: true }],
      firstInstallmentDate: [{ value: '', disabled: true }],
      installmentEndDate: [{ value: '', disabled: true }],
      lastInstallmentDate: [{ value: '', disabled: true }],
      installmentDueDate: [{ value: '', disabled: true }],
      remainingBalance: [{ value: '', disabled: true }],
      advanceAmount: [{ value: '', disabled: true }],
    })
  }

  ngAfterViewInit() {
    const skipModalEl = document.getElementById('openSkipEmiModal');
    if (skipModalEl) {
      skipModalEl.addEventListener('hidden.bs.modal', () => {
        const advanceModalEl = document.getElementById('advanceSalaryModalinfo');
        if (advanceModalEl) {
          new bootstrap.Modal(advanceModalEl).show();
        }
      });
    }
  }

  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modalElement: any) => {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  }
  removeBackdrop() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
  }

  onYearMonthChange() {
    this.getAllEmpAdvanceSalary();
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
    this.getAllEmpAdvanceSalary();
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

  getPaidEmiCount(): number {
    if (!this.selectedAdvpayid || !this.tabledata[this.selectedAdvpayid]) return 0;
    return this.tabledata[this.selectedAdvpayid].filter((e: { date: any; EMI: any; }) => e.date && e.EMI).length;
  }

  getAllEmpAdvanceSalary(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('all/emp-advance-salary-report', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      page: page,
      isexport: false,
      search: this.searchValue || ''
    }).subscribe((res: any) => {
      try {
        if (res.status === 'success') {
          this.rowData = res.data.map((item: any) => ({
            emp_id: item.employee_code,
            emp_name: item.emp_name,
            apply_date: item.apply_date,
            advance_amount: item.advance_amount,
            remaining_balance: item.remaining_balance,
            emi: item.emi,
            updated_on: item.updated_on,
            deducted_on: item.deducted_on,
            status: item.status,
            tenure: item.tenure,
            adv_pay_id: item.adv_pay_id,
            last_installment_date: item.last_installment_date ? item.last_installment_date : '-',

            emi_status: item.emi_status === 'Ongoing'
              ? 'Unpaid'
              : item.emi_status === 'Completed'
                ? 'Paid'
                : '-'

          }));
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;
          this.generatePageNumbers(this.paginationvalue);
        } else {
          // this.toastr.warning('Data Not Found');
        }
      } catch (error) {
        console.log(error);
      }
      this.isLoading = false;
    }, (error) => {
      if (error.status === 400) {
        // this.toastr.warning('Data Not Found');
      } else {
        console.error(error);
      }
      this.isLoading = false;
    })
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
  }

  generateFinancialYears() {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();

    this.years = [];

    for (let year = startYear; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  days = Array.from({ length: 31 }, (_, i) => i + 1);

  viewMode: 'Day' | 'Month' = 'Day';

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.getAllEmpAdvanceSalary();
    }, 500);
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  onFilterBoxChange() {
    if (this.gridApiActive) {
      this.gridApiActive.setQuickFilter(this.searchValue);
    }
  }

  // search code
  emptyInput() {
    this.searchValue = '';
    window.location.reload();
  }

  public defaultColDef: ColDef = {
    editable: true,
    // flex: 1,
    resizable: true,
  };
  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'emp_id', sortable: true, filter: true, maxWidth: 150 },
      {
        headerName: 'Emp Name',
        field: 'emp_name',
        sortable: true,
        filter: true,
        maxWidth: 140
      },
      { headerName: 'ApplyDate', field: 'apply_date', sortable: true, filter: true, maxWidth: 130, valueFormatter: this.service.dateFormatter },
      {
        headerName: 'Adv.Amt',
        field: 'advance_amount',
        sortable: true,
        filter: true,
        maxWidth: 120
      },
      {
        headerName: 'Remaining',
        field: 'remaining_balance',
        sortable: true,
        filter: true,
        maxWidth: 120
      },
      {
        headerName: 'EMI',
        field: 'emi',
        sortable: true,
        filter: true,
        maxWidth: 80
      },

      { headerName: 'Tenure', field: 'tenure', sortable: true, filter: true, maxWidth: 100 },
      { headerName: 'LastDate', field: 'last_installment_date', sortable: true, filter: true, maxWidth: 100 },
      { headerName: 'Status', field: 'status', cellRenderer: this.statusButtonRenderer, sortable: true, filter: true, maxWidth: 90 },
      { headerName: 'EMIStatus', field: 'emi_status', sortable: true, filter: true, maxWidth: 100 },
    ];
    this.columnDefs.push({
      headerName: 'View',
      maxWidth: 80,
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-sm mb-1" data-bs-toggle="modal" data-bs-target="#advanceSalaryModalinfo" style="background-color:#C8E3FF">
          <i class="bi bi-eye"></i>
          </button>`;
      },
      onCellClicked: (event: any) => {
        this.getSingleApprovedData(event.data.adv_pay_id);
      },
    });
  }

  getSingleApprovedData(data: any) {
    this.selectedAdvpayid = data;
    this.service.post('single/report/advancesaraly', { adv_pay_id: data }).subscribe((res: any) => {
      if (res.status === 'success') {
        const advanceInfo = res.data.advance_info;
        const emiHistory = res.data.emi_history;

        this.approvedData = {
          id: advanceInfo?.employee_code,
          employeeName: advanceInfo?.emp_name,
          company: advanceInfo?.company_name,
          department: advanceInfo?.department_name,
          role: advanceInfo?.designation_name,
          requestDate: advanceInfo?.apply_date,
          status: advanceInfo?.status,
          emi_status: advanceInfo?.emi_status,
          tenure: advanceInfo?.tenure,
          amount: advanceInfo?.advance_amount,
          reason: advanceInfo?.remarks,
          EMIStartDate: advanceInfo?.updated_on,
          installmentAmount: advanceInfo?.emi,
          remainingBalance: advanceInfo?.remaining_balance,
          advanceAmount: advanceInfo?.advance_amount,
          firstInstallmentDate: advanceInfo?.deducted_on,
        }
        this.displayApprovedData.patchValue(this.approvedData);

        if (this.selectedAdvpayid !== null) {
          // const sortedEmiHistory = [...emiHistory].sort((a, b) => {
          //   return new Date(b.deducted_on || b.year_month).getTime() -
          //     new Date(a.deducted_on || a.year_month).getTime();
          // });

          const paidEmis = emiHistory.map((item: any) => ({
            date: item.year_month,
            installment_amount: item.installment_amount,
            installment_status: item.installment_status,
            remarks: item.remarks ? item.remarks : '-',
          }))
            .reverse();

          this.tabledata[this.selectedAdvpayid] = paidEmis;
        }
      }
    })
  }

  calculatePaidAmount(): number {
    const total = +this.displayApprovedData.get('amount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    return total - remaining;
  }

  calculatePaidPercentage(): number {
    const advance = +this.displayApprovedData.get('advanceAmount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    if (advance === 0) return 0;
    return Math.round(((advance - remaining) / advance) * 100);
  }

  statusButtonRenderer(params: any) {
    const status = params.value;
    const icon = document.createElement('i');

    // Common style
    icon.style.fontSize = '18px';
    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';
    icon.style.width = '100%';
    icon.style.marginTop = '6px';

    //Bootstrap Icon
    if (status === 'Approved') {
      icon.className = 'bi bi-check-circle-fill';
      icon.style.color = '#28a745';
    } else if (status === 'Rejected') {
      icon.className = 'bi bi-x-circle-fill';
      icon.style.color = '#dc3545';
    } else if (status === 'pending' || status === 'Pending') {
      icon.className = 'bi bi-hourglass-split';
      icon.style.color = '#ffc107';
    } else {
      icon.className = 'bi bi-question-circle';
      icon.style.color = '#6c757d';
    }

    return icon;
  }


  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  // update function
  updateStatus(data: any) {
    alert('update');
  }

  exportExcel() {
    this.isLoading = true;
    this.service.post('all/emp-advance-salary-report', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      isexport: true,
    }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data.length) {
          const rows = res.data.map((r: any) => [
            r.employee_code,
            r.emp_name,
            r.apply_date,
            r.advance_amount,
            r.tenure,
            r.emi,
            r.status
          ]);

          const csvArray: string[][] = [
            ['Employee Code', 'Employee Name', 'Apply Date', 'Advance Amount', 'Tenure', 'Emi', 'Status'],
            ...rows
          ];

          const csv = csvArray
            .map((row: string[]) => row.map((v: string | number | null) => `"${v ?? ''}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'ApprovedAdvPayment.csv'
          });
          link.click();

          this.toastr.success('Data exported successfully!');
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 400) {
          this.toastr.warning('No data found to export');
        } else {
          this.toastr.error('Error while exporting data');
        }
        this.isLoading = false;
      }
    });
  }

  getPagination() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.getAllEmpAdvanceSalary();
      } else {
        this.paginationvalue = 10;
        this.getAllEmpAdvanceSalary();
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
      this.getAllEmpAdvanceSalary(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllEmpAdvanceSalary(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getAllEmpAdvanceSalary(this.currentPage);
    }
  }
}

