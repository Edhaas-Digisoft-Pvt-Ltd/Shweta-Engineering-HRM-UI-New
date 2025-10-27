import { Component } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { EmployeeActionComponent } from './employee-action/employee-action.component';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ModalServiceService } from '../modal-service.service';

declare var bootstrap: any;
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {

  gridApiActive!: GridApi;
  searchValue: string = '';
  CompanyNames: any;
  selectedValue: string = 'Company A';
  employee: any = [];
  Employee_Data: any;
  selectedCompanyId: any;
  rowData: any = [];
  importExcelCompanyId: string = '';
  isLoading: boolean = false;

  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  constructor(private router: Router, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService) { }

  ngOnInit() {
    // this.selectedCompanyId = this.CompanyIdService.selectedCompanyId();
    this.selectedCompanyId = this.service.selectedCompanyId();

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
        // this.optionsArray = res.map((company: any) => company.CompanyName); // <-- only CompanyName
        this.CompanyNames = res.data;
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.getEmployee();
  }

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, minWidth: 160, },
    { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true, minWidth: 180, },
    { headerName: 'Department', field: 'department_name', sortable: true, filter: true },
    { headerName: 'Role', field: 'designation_name', sortable: true, filter: true },
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
      const headers = ['role_id', 'emp_title', 'emp_name', 'emp_email', 'emp_gender', 'department_id', 'designation_id', 'bank_name', 'account_num', 'ifsc_code', 'doj', 'emp_contact', 'emp_address', 'basic_salary', 'house_rent_allowances', 'conveyance_allowances', 'medical_allowances', 'special_allowances'];
      const exampleRow = [
        '3', 'mr', 'abc', 'abc@gmail.com', 'male', '1', '2', 'SBI', '458438236526', 'SBIN0005088', '2/1/2022', '9999999999', 'Pune', '200000', '18000', '1000', '1000', '1000'
      ];

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


  onFilterBoxChange() {
    this.gridApiActive.setQuickFilter(this.searchValue);
  }

  create_user() {
    this.router.navigate(['/authPanal/CreateEmployee']);
  }

  // getting all data from api : 
  getEmployee(page: number = 1): void {
    this.isLoading = true;
    let company_id = this.selectedCompanyId;
    this.service.post("company/employee", { company_id, page: page, isexport: false, }).subscribe((res: any) => {
      if (res.status == 'success') {
        this.rowData = res.data.map((item: any) => ({
          employee_id: item.employe_id,
          employee_code: item.employee_code,
          emp_name: item.emp_name,
          emp_contact: item.emp_contact,
          doj: item.doj,
          department_name: item.department_name,
          designation_name: item.designation_name,
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

  onOptionSelected() {
    console.log('Selected option:', this.selectedValue);
  }

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

}
