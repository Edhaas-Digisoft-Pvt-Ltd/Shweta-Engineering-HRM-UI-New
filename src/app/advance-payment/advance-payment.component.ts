import { Component } from '@angular/core';
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
  constructor(private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService, private router: Router,) { }
  today: string = new Date().toISOString().split('T')[0];
  title: String = 'Company Demo';
  role: string = '';
  // EditAdvancePayment
  EditAdvancePayment!: FormGroup;

  activeTab: string = 'tab1';
  gridApiActive!: GridApi;
  CompanyNames: any = [];
  selectedCompanyId: any;
  selectedYear: any;
  selectedMonth: any;
  rowData: any = [];
  columnDefs: ColDef[] = [];
  advPayId: any;
  monthlyColumnDefs: any[] = [];
  monthlyRowData: any[] = [];
  EditAdvancePaymentData!: any;
  isLoading: boolean = false;

  // Pagination & grid APIs
  gridApi!: GridApi;
  gridColumnApi: any;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];

  ngOnInit() {
    this.selectedCompanyId = this.service.selectedCompanyId();

    this.getCompanyNames();
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
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
    })
  }

  openModel() {
    this.modalService.openModal('advanceRequestModal')
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
        this.CompanyNames = res.data
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.getAllAdvSalary();
  }

  getAllAdvSalary(page: number = 1) {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('fetch/allcompanyrequest', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
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
            adv_pay_id: item.adv_pay_id
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
  onYearMonthChange() {
    this.getAllAdvSalary();
  }

  public defaultColDef: ColDef = {
    editable: true,
    // flex: 1,
    resizable: true,
  };

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, maxWidth: 150, },
      {
        headerName: 'Employee Name',
        field: 'emp_name',
        sortable: true,
        filter: true,
      },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true },
      { headerName: 'Amount', field: 'advance_amount', sortable: true, filter: true },
      { headerName: 'Tenure', field: 'tenure', sortable: true, filter: true, maxWidth: 110 },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        filter: true,
        cellRenderer: this.statusButtonRenderer,
      },
    ];
    if (this.hasAccess('Advance Payment', 'ApproveOrReject')) {
      this.columnDefs.push({
        headerName: 'Actions',
        maxWidth: 160,
        cellStyle: { border: '1px solid #ddd' },
        cellRenderer: (params: any) => {
          return `<button type="button" class="btn btn-sm mb-1" style="background-color:#C8E3FF">
              <i class="bi bi-pencil"></i>
            </button>`;
        },
        onCellClicked: (event: any) => {
          this.getSingleAdvanceSalary(event.data.adv_pay_id);
          this.openModel();
        },
      });
    }
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
          requestData: singleAdvanceSalary?.apply_date,
          status: singleAdvanceSalary?.status,
          tenure: singleAdvanceSalary?.tenure,
          amount: singleAdvanceSalary?.advance_amount,
          reason: singleAdvanceSalary?.remarks,
          EMIStartDate: singleAdvanceSalary?.updated_on,
          installmentAmount: singleAdvanceSalary?.emi,
        }
        this.EditAdvancePayment.patchValue(this.EditAdvancePaymentData);
      }
    })
    this.isLoading = false;
  }

  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '97%';
    button.style.marginTop = '6px';

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

  exportExcel() {
    this.isLoading = true;
    this.service.post('fetch/allcompanyrequest', {
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
