import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-salary-increment',
  templateUrl: './salary-increment.component.html',
  styleUrls: ['./salary-increment.component.css']
})
export class SalaryIncrementComponent {
  gridApi: any;
  searchValue: string = '';
  isLoading: boolean = false;

  rowData: any[] = [];
  CompanyNames: any[] = [];
  selectedCompanyId: any[] = ['all'];
  companyDropdownOpen: boolean = false;

  constructor(private router: Router, private service: HrmserviceService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.selectedCompanyId = ['all'];

    this.getCompanyNames();
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.CompanyNames = res.data;
      }
      this.loadIncrementList();
    });
  }

  loadIncrementList() {
    this.isLoading = true;
    this.service.post('salary-increment-list', { company_id: this.selectedCompanyId }).subscribe({
      next: (res: any) => {
        this.rowData = res.status === 'success' ? res.data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.rowData = [];
        this.isLoading = false;
      }
    });
  }

  // ---- Company multi-select dropdown (same pattern as Leave Requests) ----

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
    this.loadIncrementList();
  }

  toggleCompany(companyId: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    let ids = this.isAllSelected()
      ? this.CompanyNames.map((c: any) => c.company_id)
      : [...this.selectedCompanyId];

    if (checked) {
      if (!ids.includes(companyId)) ids.push(companyId);
    } else {
      ids = ids.filter((id: any) => id !== companyId);
    }

    if (ids.length === this.CompanyNames.length) ids = ['all'];

    this.selectedCompanyId = ids.length ? ids : [];
    this.loadIncrementList();
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
      if (!clickedInside) this.companyDropdownOpen = false;
    }
  }

  // ---- ag-grid ----

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Emp Code', field: 'employee_code' },
    { headerName: 'Employee Name', field: 'employee_name' },
    { headerName: 'Company', field: 'company_name' },
    {
      headerName: 'Current Salary',
      field: 'current_salary',
      valueFormatter: (p: any) => p.value ? Number(p.value).toLocaleString('en-IN') : ''
    },
    {
      headerName: 'Action',
      sortable: false,
      filter: false,
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-sm mb-1" style="background-color:#C8E3FF">
              <i class="bi bi-pencil"></i>
            </button>`;
      },
      onCellClicked: (event: any) => {
        this.editEmployee(event.data.id);
      },
    }
  ];

  gridOptions = {
    pagination: true,
    paginationPageSize: 10,
  };

  onGridReady(params: { api: any }) {
    this.gridApi = params.api;
  }

  onSearchChange() {
    this.gridApi?.setQuickFilter(this.searchValue);
  }

  editEmployee(empId: any) {
    this.router.navigate(['/authPanal/UpdateEmployee'], { queryParams: { id: empId } });
  }

  exportExcel() {
    if (!this.rowData.length) return;

    const rows = this.rowData.map((r: any) => [
      r.emp_code,
      r.employee_name,
      r.company_name ?? '',
      r.current_salary,
      r.cycle_year,
      r.anniversary_date
    ]);

    const csvArray: string[][] = [
      ['Emp Code', 'Employee Name', 'Company', 'Current Salary', 'Cycle Year', 'Anniversary Date'],
      ...rows
    ];

    const csv = csvArray
      .map((row: string[]) => row.map((v: any) => `"${v ?? ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'SalaryIncrementDue.csv'
    });
    link.click();
  }
}