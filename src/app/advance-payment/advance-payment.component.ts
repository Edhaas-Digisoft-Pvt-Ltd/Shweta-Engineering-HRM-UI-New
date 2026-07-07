import { Component, ElementRef, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef, GridApi } from 'ag-grid-community';
import { HrmserviceService } from '../hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ModalServiceService } from '../modal-service.service';
declare var bootstrap: any;
@Component({
  selector: 'app-advance-payment',
  templateUrl: './advance-payment.component.html',
  styleUrls: ['./advance-payment.component.css'],
})
export class AdvancePaymentComponent {
  constructor(private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService, private router: Router, private elementRef: ElementRef) { }
  today: string = new Date().toISOString().split('T')[0];
  title: String = 'Company Demo';
  role: string = '';
  // EditAdvancePayment
  EditAdvancePayment!: FormGroup;

  activeTab: string = 'tab1';
  gridApiActive!: GridApi;
  CompanyNames: any[] = [];
  selectedCompanyId: any[] = ['all'];
  companyDropdownOpen: boolean = false;
  rowData: any = [];
  columnDefs: ColDef[] = [];
  advPayId: any;
  monthlyColumnDefs: any[] = [];
  monthlyRowData: any[] = [];
  EditAdvancePaymentData!: any;
  isLoading: boolean = false;
  salaryTrackerForm!: FormGroup;
  isSubmitted = false;
  hideSubmitButton: boolean = false;

  // Pagination & grid APIs
  gridApi!: GridApi;
  gridColumnApi: any;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];

  startDate: string = this.getFirstDayOfMonth();
  endDate: string = this.getLastDayOfMonth();

  ngOnInit() {
    // const savedCompanyId = this.service.selectedCompanyId();
    // this.selectedCompanyId = savedCompanyId
    //   ? (Array.isArray(savedCompanyId) ? savedCompanyId : [savedCompanyId])
    //   : ['all'];
    this.selectedCompanyId = ['all'];

    this.getCompanyNames();
    this.getAllAdvSalary();
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    // this.initializeGrids();

    this.role = this.service.getRole();
    this.initializeColumns();

    this.EditAdvancePayment = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      employeeName: [{ value: '', disabled: true }, Validators.required],
      company: [{ value: '', disabled: true }, Validators.required],
      department: [{ value: '', disabled: true }, Validators.required],
      role: [{ value: '', disabled: true }, Validators.required],
      requestData: [{ value: '', disabled: true }, Validators.required],
      status: [{ value: '', disabled: true }, Validators.required],
      tenure: [{ value: '', disabled: true }, Validators.required],
      amount: [{ value: '', disabled: true }, Validators.required],
      reason: [{ value: '', disabled: true }, Validators.required],
      EMIStartDate: [{ value: '', disabled: true }, Validators.required],
      installmentAmount: [{ value: '', disabled: true }, Validators.required],
    });

    this.salaryTrackerForm = this.fb.group({
      emp_name: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      tenure: [{ value: '', disabled: true }],

      payment_mode: ['', Validators.required],
      transfer_data: ['', Validators.required]
    });
  }

  openModel() {
    this.modalService.openModal('advanceRequestModal')
  }

  openSalaryTrackerModel() {
    this.modalService.openModal('advanceSalaryTrackerModal')
  }

  hasAccess(module: string, permission: string): boolean {
    return this.service.hasPermission(module, permission);
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

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
    this.getAllAdvSalary();
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

  getAllAdvSalary(page: number = 1) {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('fetch/allcompanyrequest', {
      company_id: this.selectedCompanyId,
      start_date: this.startDate,
      end_date: this.endDate,
      page: page,
      isexport: false,
    }).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data.length > 0) {
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            apply_date: item.apply_date,
            emp_name: item.emp_name,
            department_name: item.department_name,
            designation_name: item.designation_name,
            advance_amount: item.advance_amount,
            tenure: item.tenure,
            status: item.status,
            adv_pay_id: item.adv_pay_id,
            accountant_confirmation: item.accountant_confirmation,
            transfer_data: item.transfer_data,
            payment_mode: item.payment_mode,
          }))
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;

          this.generatePageNumbers();
        } else {
          // this.toastr.warning('Data Not Found');
        }
      } catch (error) {
        console.log(error);
      }
      this.isLoading = false;
    },
      (error) => {
        if (error.status === 404) {
          // this.toastr.warning('Data Not Found');
        } else {
          console.error(error);
        }
        this.isLoading = false;
      })
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
  }

  days = Array.from({ length: 31 }, (_, i) => i + 1);

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

  // onGridReady(params: { api: any }) {
  //   this.gridApiActive = params.api;
  // }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // load first page
    this.getAllAdvSalary(1);
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

  onDateRangeChange(): void {
    this.currentPage = 1;
    this.getAllAdvSalary();
  }

  public defaultColDef: ColDef = {
    editable: false,
    // flex: 1,
    resizable: true,
  };

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, flex: 1, },
      {
        headerName: 'Employee Name',
        field: 'emp_name',
        sortable: true,
        filter: true,
        flex: 1,
      },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true, valueFormatter: this.service.dateFormatter },
      { headerName: 'Amount', field: 'advance_amount', sortable: true, filter: true },
      { headerName: 'Tenure', field: 'tenure', sortable: true, filter: true, flex: 1, maxWidth: 120 },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        filter: true,
        flex: 1,
        cellRenderer: this.statusButtonRenderer,
      },
    ];
    // if (this.hasAccess('Advance Payment', 'ApproveOrReject')) {
    //   this.columnDefs.push({
    //     headerName: 'Actions',
    //     flex: 1,
    //     cellStyle: { border: '1px solid #ddd' },
    //     cellRenderer: (params: any) => {
    //       return `<button type="button" class="btn btn-sm mb-1" style="background-color:#C8E3FF">
    //           <i class="bi bi-pencil"></i>
    //         </button>`;
    //     },
    //     onCellClicked: (event: any) => {
    //       this.getSingleAdvanceSalary(event.data.adv_pay_id);
    //       this.openModel();
    //     },
    //   });
    // }
    // if (this.hasAccess('Advance Payment', 'SalaryTracker')) {
    //   this.columnDefs.push({
    //     headerName: 'Actions',
    //     flex: 1,
    //     cellStyle: { border: '1px solid #ddd' },
    //     cellRenderer: (params: any) => {
    //       if (params.data.status === 'Approved') {
    //         return `
    //     <button type="button" class="btn btn-sm mb-1 st-btn" style="background-color:#C8E3FF">
    //       <i class="bi bi-pencil"></i>
    //     </button>
    //   `;
    //       }
    //       return '';
    //     },
    //     onCellClicked: (event: any) => {
    //       if (!event.event.target.closest('.st-btn')) {
    //         return;
    //       }

    //       if (event.data.status !== 'Approved') {
    //         return;
    //       }

    //       this.setSalaryTrackerData(event.data);
    //       this.openSalaryTrackerModel();
    //     },
    //   });
    // }
    this.columnDefs.push({
      headerName: 'Actions',
      flex: 1,
      cellStyle: { border: '1px solid #ddd' },

      cellRenderer: (params: any) => {
        let buttons = '';

        // Approve/Reject button (for pending)
        if (
          params.data.status === 'pending' &&
          this.hasAccess('Advance Payment', 'ApproveOrReject')
        ) {
          buttons += `
        <button type="button" class="btn btn-sm mb-1 edit-btn" style="background-color:#C8E3FF">
          <i class="bi bi-pencil"></i>
        </button>
      `;
        }

        // Salary Tracker button (for Approved)
        // Salary Tracker button
        if (
          (params.data.status === 'Approved' || params.data.status === 'pending') &&
          this.hasAccess('Advance Payment', 'SalaryTracker')
        ) {

          // Disabled button for pending
          if (params.data.status === 'pending') {
            buttons += `
      <button 
        type="button" 
        class="btn btn-sm mb-1"
        style="background-color:#d3d3d3; cursor:not-allowed;"
        disabled
      >
        <i class="bi bi-cash"></i>
      </button>
    `;
          }

          // Active button for approved
          if (params.data.status === 'Approved') {
            buttons += `
      <button 
        type="button" 
        class="btn btn-sm mb-1 st-btn" 
        style="background-color:#C8E3FF"
      >
        <i class="bi bi-cash"></i>
      </button>
    `;
          }
        }

        return buttons;
      },

      onCellClicked: (event: any) => {

        // 🔹 Open Approve Modal
        if (event.event.target.closest('.edit-btn')) {
          this.getSingleAdvanceSalary(event.data.adv_pay_id);
          this.openModel();
          return;
        }

        // 🔹 Open Salary Tracker
        if (event.event.target.closest('.st-btn')) {
          this.setSalaryTrackerData(event.data);
          this.openSalaryTrackerModel();
          return;
        }
      }
    });
  }

  getSingleAdvanceSalary(data: any) {
    this.isLoading = true;
    this.advPayId = data;

    this.service.post('single/advancesaraly', { adv_pay_id: data }).subscribe((res: any) => {
      if (res.status === 'success') {
        const singleAdvanceSalary = res.data[0];
        this.EditAdvancePaymentData = {
          id: singleAdvanceSalary?.employee_code,
          employeeName: singleAdvanceSalary?.emp_name,
          company: singleAdvanceSalary?.company_name,
          department: singleAdvanceSalary?.department_name,
          role: singleAdvanceSalary?.designation_name,
          requestData: this.service.formatToDDMMYYYY(singleAdvanceSalary?.apply_date),
          status: singleAdvanceSalary?.status,
          tenure: singleAdvanceSalary?.tenure,
          amount: singleAdvanceSalary?.advance_amount,
          reason: singleAdvanceSalary?.remarks,
          EMIStartDate: singleAdvanceSalary?.updated_on,
          installmentAmount: singleAdvanceSalary?.emi,
        }
        this.EditAdvancePayment.patchValue(this.EditAdvancePaymentData);
        this.isLoading = false;
      }
      this.isLoading = false;
    })
  }

  setSalaryTrackerData(data: any) {
    console.log(data)
    this.advPayId = data.adv_pay_id;

    this.salaryTrackerForm.patchValue({
      emp_name: data.emp_name,
      amount: data.advance_amount,
      tenure: data.tenure,
      payment_mode: data.payment_mode ?? '',
      transfer_data: data.transfer_data ?? ''
    });

    if (data.accountant_confirmation === 'Confirmed') {
      this.salaryTrackerForm.disable();
      this.hideSubmitButton = true;
    } else {
      this.salaryTrackerForm.enable();
      this.salaryTrackerForm.get('emp_name')?.disable();
      this.salaryTrackerForm.get('amount')?.disable();
      this.salaryTrackerForm.get('tenure')?.disable();
      this.hideSubmitButton = false;
    }
  }

  accountantConfiramationAdvSalary() {
    this.isSubmitted = true;

    if (this.salaryTrackerForm.invalid) {
      this.toastr.error("Please select payment mode and enter transfer data");
      return;
    }

    this.isLoading = true;

    const payload = {
      adv_pay_id: this.advPayId,
      payment_mode: this.salaryTrackerForm.get('payment_mode')?.value,
      transfer_data: this.salaryTrackerForm.get('transfer_data')?.value
    };

    this.service.post('accountant/confirm-advance-salary', payload)
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.toastr.success("Accountant confirmation saved successfully");

            this.getAllAdvSalary(this.currentPage);

            this.salaryTrackerForm.reset();
            this.isSubmitted = false;
            this.modalService.closeModal();
          } else {
            this.toastr.error("Something went wrong");
          }

          this.isLoading = false;
        },

        error: (err) => {
          this.toastr.error("Server error");
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  statusButtonRenderer(params: any) {
    let status = params.value;

    const button = document.createElement('button');
    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'default';
    button.style.height = '30px'; //Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '97%';
    button.style.marginTop = '6px';

    //Convert Approved → Confirm (UI only)
    if (status === 'Approved') {
      button.innerHTML = `<span style="font-size:11px;font-weight:600;">Confirmation</span><br><span style="font-size:10px;">Pending</span>`;
      button.style.flexDirection = 'column';
      button.style.lineHeight = '0.6';
    }

    // Conditional styling
    if (status === 'pending') {
      button.style.backgroundColor = '#FFF291'; // light red
      button.style.color = '#721c24'; // dark red text
      button.style.border = '1px solid #f5c6cb';
      button.style.borderRadius = '20px';
    } else if (status === 'Approved') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
      button.style.borderRadius = '20px';
    } else if (status === 'Confirm') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
      button.style.borderRadius = '20px';
    } else if (status === 'Rejected') {
      button.style.backgroundColor = '#FFAFAF'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #FFAFAF';
      button.style.borderRadius = '20px';
    }

    return button;
  }

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  updateStatus(data: any) {
    if (confirm("Do you want to update Status?") == true) {
      const payload = {
        adv_pay_id: this.advPayId,
        status: data
      }
      this.service.post(`update/advancesaraly`, payload).subscribe((res: any) => {
        if (res.status === 'success') {
          this.toastr.success("Advance salary status updated successfully");
          this.getAllAdvSalary();
          this.modalService.closeModal();
        }
      }, (error) => {
        console.error('Error:', error);
      });
    }
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
    this.service.post('fetch/allcompanyrequest', {
      company_id: this.selectedCompanyId,
      start_date: this.startDate,
      end_date: this.endDate,
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
            download: 'AdvPayment.csv'
          });
          link.click();

          this.toastr.success('Data exported successfully!');
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.warning('No data found to export');
        } else {
          this.toastr.error('Error while exporting data');
        }
        this.isLoading = false;
      }
    });
  }

  generatePageNumbers() {
    const total = this.lastPage;
    const current = this.currentPage;
    const delta = 2; // number of pages before/after current
    const range: (number | string)[] = [];

    // Always show first page
    range.push(1);

    // Add left ellipsis if needed
    if (current - delta > 2) {
      range.push('...');
    }

    // Pages around current
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    // Add right ellipsis if needed
    if (current + delta < total - 1) {
      range.push('...');
    }

    // Always show last page
    if (total > 1) {
      range.push(total);
    }

    this.pagesToShow = range;
  }

  goToPage(page: number | string) {
    if (page === '...') return;
    if (page !== this.currentPage) {
      this.currentPage = page as number;
      this.getAllAdvSalary(this.currentPage); // call your API here
      this.generatePageNumbers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllAdvSalary(this.currentPage);
      this.generatePageNumbers();
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getAllAdvSalary(this.currentPage);
      this.generatePageNumbers();
    }
  }
}
