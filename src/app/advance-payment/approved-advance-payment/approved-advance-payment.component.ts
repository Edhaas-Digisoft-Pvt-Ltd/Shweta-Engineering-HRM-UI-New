import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef, GridApi } from 'ag-grid-community';
import { EmployeeActionComponent } from 'src/app/employee/employee-action/employee-action.component';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-approved-advance-payment',
  templateUrl: './approved-advance-payment.component.html',
  styleUrls: ['./approved-advance-payment.component.css'],
})
export class ApprovedAdvancePaymentComponent {
  today: string = new Date().toISOString().split('T')[0];
  title: String = 'Company Demo';
  activeTab: string = 'tab1';
  gridApiActive!: GridApi;
  role: string = '';
  columnDefs: ColDef[] = [];
  rowData: any = [];
  CompanyNames: any = [];
  selectedCompanyId: any = 1;
  selectedYear: any;
  selectedMonth: any;
  displayApprovedData!: FormGroup;
  approvedData!: any;
  isLoading: boolean = false;
  selectedAdvpayid: number = 0;
  tabledata: any = [];
  skipEmiForm!: FormGroup;
  isSkipConfirmed: boolean = false;
  skipEmiReason: any;
  isSkipFormSubmitted = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    this.selectedCompanyId = this.service.selectedCompanyId();

    const currentDate = new Date();
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    // this.initializeGrids();
    this.role = this.service.getRole();
    this.initializeColumns();
    this.getCompanyNames();
    // this.getAllApprovedRequest();
    this.getPagination();

    this.displayApprovedData = this.fb.group({
      id: [{ value: '', disabled: true }],
      employeeName: [{ value: '', disabled: true }],
      company: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      requestDate: [{ value: '', disabled: true }],
      tenure: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      firstInstallmentDate: [{ value: '', disabled: true }],
      installmentEndDate: [{ value: '', disabled: true }],
      lastInstallmentDate: [{ value: '', disabled: true }],
      installmentDueDate: [{ value: '', disabled: true }],
      remainingBalance: [{ value: '', disabled: true }],
      advanceAmount: [{ value: '', disabled: true }],
      skipEmi: [false],
      skipreason: ['', Validators.required]
    })

    this.skipEmiForm = this.fb.group({
      isSkipConfirmed: [false],
      skipEmiReason: ['', Validators.required]
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

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.getAllApprovedRequest();
  }

  onYearMonthChange() {
    this.getAllApprovedRequest();
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

  getPaidEmiCount(): number {
    if (!this.selectedAdvpayid || !this.tabledata[this.selectedAdvpayid]) return 0;
    return this.tabledata[this.selectedAdvpayid].filter((e: { date: any; EMI: any; }) => e.date && e.EMI).length;
  }

  getAllApprovedRequest(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('all/companyapprovedrequest', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
      page: page,
      isexport: false,
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
            adv_pay_id: item.adv_pay_id
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

  // columnDefs: any[] = [];
  // rowData: any[] = [];
  monthlyColumnDefs: any[] = [];
  monthlyRowData: any[] = [];

  // gridApiActive: any;

  financialYears = [2022, 2023, 2024, 2025];
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
  days = Array.from({ length: 31 }, (_, i) => i + 1);
  //  for selecting company
  optionsArray: string[] = ['Company A', 'Company B', 'Company C'];
  selectedValue: string = 'Company A'; // Default selected

  viewMode: 'Day' | 'Month' = 'Day'; // Default view
  searchValue: string = '';

  initializeGrids() {
    this.generateDayColumns();
    this.generateMonthlySummary();
  }
  generateMonthlySummary() {
    throw new Error('Method not implemented.');
  }
  generateDayColumns() {
    throw new Error('Method not implemented.');
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
      { headerName: 'Emp Code', field: 'emp_id', sortable: true, filter: true, maxWidth: 160 },
      {
        headerName: 'Employee Name',
        field: 'emp_name',
        sortable: true,
        filter: true,
        maxWidth: 200
      },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true, maxWidth: 150 },
      {
        headerName: 'Adv. Amount',
        field: 'advance_amount',
        sortable: true,
        filter: true,
        maxWidth: 150
      },
      {
        headerName: 'Remaining Amount',
        field: 'remaining_balance',
        sortable: true,
        filter: true,
        maxWidth: 190
      },
      {
        headerName: 'EMI',
        field: 'emi',
        sortable: true,
        filter: true,
        maxWidth: 120
      },

      // { headerName: 'Status', field: 'status', cellRenderer: this.statusButtonRenderer, sortable: true, filter: true,  maxWidth:140},
      { headerName: 'Tenure', field: 'tenure', sortable: true, filter: true, maxWidth: 110 },
    ];
    this.columnDefs.push({
      headerName: 'Actions',
      maxWidth: 120,
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
    const button = document.createElement('button');

    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '18px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '100%';
    button.style.marginTop = '6px';

    // Conditional styling
    if (status === 'Pending') {
      button.style.backgroundColor = '#FFF291'; // light red
      button.style.color = '#721c24'; // dark red text
      button.style.border = '1px solid #f5c6cb';
    } else if (status === 'Approved') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
    }

    return button;
  }

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  // update function
  updateStatus(data: any) {
    alert('update');
  }

  skipEmiConfirm() {
    this.isSkipFormSubmitted = true;

    const skipReason = this.displayApprovedData.get('skipreason')?.value;

    if (skipReason && skipReason.trim() !== '') {
      if (confirm("Are you sure you want to skip EMI for this month?")) {
        const payload = {
          adv_pay_id: this.selectedAdvpayid,
          remarks: skipReason
        };

        this.service.post('emp/advancesaraly/skip/emi', payload).subscribe({
          next: (res: any) => {
            this.toastr.success('EMI Skipped successfully.');
            this.isSkipFormSubmitted = false;
            this.getSingleApprovedData(this.selectedAdvpayid);

            this.displayApprovedData.patchValue({
              skipEmi: false,
              skipreason: ''
            });
          },
          error: (err) => {
            console.error('Error:', err);

            if (err.status === 404) {
              this.toastr.error(err.error.message);
            } else if (err.status === 409) {
              this.toastr.error(err.error.message);
            } else {
              this.toastr.error("Something went wrong!");
            }
            this.isSkipFormSubmitted = false;
          }
        });
      } else {
        this.isSkipFormSubmitted = false;
      }
    } else {
      this.toastr.warning('Please enter skip reason before submitting.');
      this.isSkipFormSubmitted = false;
    }
  }


  exportExcel() {
    this.isLoading = true;
    this.service.post('all/companyapprovedrequest', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
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

        this.getAllApprovedRequest();
      } else {
        this.paginationvalue = 10;
        this.getAllApprovedRequest();
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
      this.getAllApprovedRequest(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllApprovedRequest(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getAllApprovedRequest(this.currentPage);
    }
  }
}

// skipEmiConfirm() {
//   const reason = this.displayApprovedData.get('skipreason')?.value;
//   const advPayId = this.selectedAdvpayid;

//   if (!reason) {
//     this.toastr.warning("Please enter a reason before skipping EMI.");
//     return;
//   }

//   if (confirm("Are you sure you want to skip EMI for this month?")) {
//     const payload = {
//       adv_pay_id: advPayId,
//       remarks: reason
//     };

//     this.service.post('emp/advancesaraly/skip/emi', payload).subscribe({
//       next: (res: any) => {
//         this.toastr.success("EMI skipped successfully");
//         this.closeAllModals();
//       },
//       error: (err: any) => {
//         console.error(err);
//         this.toastr.error("Something went wrong.");
//       }
//     });
//   }
// }
