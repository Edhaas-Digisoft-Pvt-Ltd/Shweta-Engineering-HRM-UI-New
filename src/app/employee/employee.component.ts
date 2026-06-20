import { Component, ElementRef, HostListener } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { EmployeeActionComponent } from './employee-action/employee-action.component';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ModalServiceService } from '../modal-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var bootstrap: any;
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {

  gridApiActive!: GridApi;
  searchValue: string = '';
  employee: any = [];
  Employee_Data: any;
  CompanyNames: any[] = [];
  selectedCompanyId: any[] = ['all'];
  companyDropdownOpen: boolean = false;
  rowData: any = [];
  importExcelCompanyId: string = '';
  isLoading: boolean = false;
  searchTimeout: any;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;
  changePasswordForm!: FormGroup;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  employee_id: any;

  constructor(private router: Router, private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService, private elementRef: ElementRef) { }

  ngOnInit() {
    // this.selectedCompanyId = this.CompanyIdService.selectedCompanyId();
    const savedCompanyId = this.service.selectedCompanyId();
    this.selectedCompanyId = savedCompanyId
      ? (Array.isArray(savedCompanyId) ? savedCompanyId : [savedCompanyId])
      : ['all'];

    this.changePasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
      ]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // this.getEmployee();
    this.getPagination();
    this.getCompanyNames();
  }

  hasAccess(module: string, permission: string): boolean {
    return this.service.hasPermission(module, permission);
  }

  openImportModal(): void {
    this.modalService.openModal('importEmployeeModal')
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
    this.service.setCompanyId(this.selectedCompanyId);
    this.currentPage = 1;
    this.getEmployee();
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

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, minWidth: 160, },
    { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true, minWidth: 180, },
    // { headerName: 'Department', field: 'department_name', sortable: true, filter: true },
    // { headerName: 'Designation', field: 'designation_name', sortable: true, filter: true },
    { headerName: 'Role', field: 'role_name', sortable: true, filter: true },
    { headerName: 'Contact', field: 'emp_contact', sortable: true, filter: true },
    { headerName: 'Joining Date', field: 'doj', sortable: true, filter: true },
    // { headerName: 'Status', field: 'status', sortable: true, filter: true, cellRenderer: (params: { value: any; }) => {
    //   const status = params.value;
    //   const className = status === 'Active' ? 'status-active' : 'status-inactive';
    //   return `<span class="${className}">${status}</span>`;
    // }},
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: (params: any) => {

        const status = params.data.status;
        // console.log(status);

        const button = document.createElement('button');

        // Set the text of the button
        button.innerText = status === 'active' ? 'Active' : 'Inactive';

        // Apply the styles based on the status
        if (status === 'active') {
          button.style.backgroundColor = '#CAFFEA';  // Green
          button.style.color = '#000';
        } else if (status === 'Inactive') {
          button.style.backgroundColor = '#FFAFAF';  // Blue
          button.style.color = '#000';
        }

        // Additional button styling
        button.style.border = 'none';
        button.style.padding = '8px 16px';
        button.style.borderRadius = '14px';
        button.style.cursor = 'pointer';
        button.style.margin = '10px auto';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.height = "28px";
        button.style.width = "100px";



        // Optional: Add event listener for button click if needed
        button.addEventListener('click', () => {
          console.log(`Button for ${status} clicked!`);
        });

        return button;  // Return the button to be rendered
      }
    },
    {
      headerName: 'Action',
      field: 'employee_id',
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: EmployeeActionComponent,
      cellRendererParams: {
        viewEmployee: (field: any) => this.editApp(field),
        openChangePassword: (empId: any) => this.openChangePasswordModal(empId)
      },
    }
  ];

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  downloadTemplate(): void {
    const userConfirmed = confirm("Do you want to download the employee template?");
    if (userConfirmed) {
      const headers = ['role_id', 'emp_title', 'emp_name', 'emp_email', 'emp_gender', 'department_id',
        'designation_id', 'bank_name', 'account_num', 'ifsc_code', 'doj', 'emp_contact', 'emp_address', 'aadhaar_number', 'pan_number',
        'basic_salary', 'house_rent_allowances', 'conveyance_allowances', 'medical_allowances',
        'special_allowances', 'PF Employee Applicable', 'PF Employer Applicable', 'ESIC Employee APPlicable', 'Transfer Type'];
      const exampleRow = [
        '3', 'mr', 'abc', 'abc@gmail.com', 'male', '1', '2', 'SBI', '458438236526', 'SBIN0005088', '2/1/2022', '9999999999',
        'Pune', '8245 1245 4587', 'DHTFG5432R', '200000', '18000', '1000', '1000', '1000', 'Yes/No', 'Yes/No', 'Yes/No', 'NEFT/ IFT'];

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
      const workbook: XLSX.WorkBook = { Sheets: { 'Template': worksheet }, SheetNames: ['Template'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Employee_Template.xlsx');

      this.toastr.success('Download successfully !');
    }
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.getEmployee();
    }, 500);
  }

  create_user() {
    this.router.navigate(['/authPanal/CreateEmployee']);
  }

  // getting all data from api : 
  getEmployee(page: number = 1): void {
    this.isLoading = true;
    let company_id = this.selectedCompanyId;
    this.service.post("company/employee", { company_id, page: page, isexport: false, search: this.searchValue || '' }).subscribe((res: any) => {
      if (res.status == 'success') {
        this.rowData = res.data.map((item: any) => ({
          employee_id: item.employe_id,
          employee_code: item.employee_code,
          emp_name: item.emp_name,
          emp_contact: item.emp_contact,
          doj: item.doj,
          department_name: item.department_name,
          designation_name: item.designation_name,
          role_name: item.role_name,
          status: item.status === "Active" ? "active" : "Inactive",
        }))
        this.totalRows = res.pagination.total;
        this.currentPage = res.pagination.page;
        this.lastPage = res.pagination.last_page;
        this.generatePageNumbers(this.paginationvalue);
      } else {
        this.rowData = [];
        this.toastr.warning('Data Not Found')
      }
      this.isLoading = false;
    }, (error) => {
      this.rowData = [];
      console.error('Error fetching employees:', error);
      this.isLoading = false;
    });
  }

  selectedFile: File | null = null;

  onFileChange(event: any) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    this.selectedFile = file;

    const formData = new FormData();
    formData.append('upload_file', file);
    formData.append('company_id', this.importExcelCompanyId);

    this.service.post('import/employee/excel', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success('File uploaded successfully!');
        const skippedInfo = res.skipped?.map((row: any) => `Row ${row.row}: skipped due to ${row.reason}`).join('\n');
        if (skippedInfo) this.toastr.warning(skippedInfo);
        this.modalService.closeModal();
        this.importExcelCompanyId = '';
        this.getEmployee();
      } else {
        const skippedInfo = res.skipped?.map((row: any) => `Row ${row.row}: skipped due to ${row.reason}`).join('\n');
        this.toastr.error(skippedInfo || 'Upload failed.');
        this.importExcelCompanyId = '';
        this.modalService.closeModal();
      }

      fileInput.value = '';
    });
  }

  // const skippedInfo = res.skipped?.map((row: any) => `Row ${row.row}: ${row.reason}`).join('\n');
  // this.toastr.warning(`${message}\n${skippedInfo}`, 'Upload Notice');

  editApp(params: any) {

    alert(params);
    // this.service.post(`fetchsingleemployee`,{ "employe_id": params}).subscribe((res: any) => {
    //   this.Employee_Data = res.data ;
    //   console.log("employee component data : ",this.Employee_Data);

    // });
    console.log("editApp", params);
  }

  exportExcel() {
    this.isLoading = true;
    let company_id = this.selectedCompanyId;
    this.service.post('company/employee', { company_id, isexport: true, }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data.length) {
          const rows = res.data.map((r: any) => [
            r.employee_code,
            r.emp_name,
            r.emp_email,
            r.role_id,
            r.bank_name,
            r.account_num,
            r.ifsc_code,
            r.doj,
            r.basic_salary,
            r.house_rent_allowances,
            r.conveyance_allowances,
            r.special_allowances,
            r.annual_gross_salary,
            r.monthly_gross_salary,
          ]);

          const csvArray: string[][] = [
            ['Employee Code', 'Employee Name', 'Employee Email', 'Role Id', 'Bank Name', 'Account Number', 'IFSC Code',
              'Doj', 'Basic Salary', 'House Rent Allowances', 'Conveyance Allowances', 'Special Allowances', 'Annual Gross Salary', 'Monthly Gross Salary'],
            ...rows
          ];

          const csv = csvArray
            .map((row: string[]) => row.map((v: string | number | null) => `"${v ?? ''}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'Employee.csv'
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

        this.getEmployee();
      } else {
        this.paginationvalue = 10;
        this.getEmployee();
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
      this.getEmployee(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getEmployee(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getEmployee(this.currentPage);
    }
  }

  //password change
  openChangePasswordModal(empId: any) {
    this.employee_id = empId;

    this.changePasswordForm.reset();
    this.submitted = false;

    this.showPassword = false;
    this.showConfirmPassword = false;

    const modal = new bootstrap.Modal(
      document.getElementById('changePasswordModal')
    );
    modal.show();
  }

  get f() {
    return this.changePasswordForm.controls;
  }
  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirm_password')?.value;

    return pass === confirm ? null : { mismatch: true };
  }

  changePassword() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      this.toastr.error('Please fix validation errors');
      return;
    }

    // Confirm dialog
    if (!confirm('Are you sure you want to change password?')) {
      return;
    }

    const payload = {
      emp_id: this.employee_id,
      new_password: this.changePasswordForm.value.password
    };

    this.service.post('update/password', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Password updated successfully');

          this.changePasswordForm.reset();
          this.submitted = false;

          this.modalService.closeModal(); // or bootstrap close
        } else {
          this.toastr.error(res.message || 'Failed to update password');
        }
      },
      error: () => {
        this.toastr.error('Server error');
      }
    });
  }
}
