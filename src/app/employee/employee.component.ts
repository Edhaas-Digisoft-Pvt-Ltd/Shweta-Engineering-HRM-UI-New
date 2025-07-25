import { Component } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { EmployeeActionComponent } from './employee-action/employee-action.component';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

declare var bootstrap: any;
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {

  gridApiActive!: GridApi;
  searchValue: string = '';
  CompanyNames: any ;
  selectedValue: string = 'Company A';
  employee: any = [];
  Employee_Data: any;
  selectedCompanyId: any;
  rowData: any = [];
  importExcelCompanyId: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    // this.selectedCompanyId = this.CompanyIdService.selectedCompanyId();
    this.selectedCompanyId = this.service.selectedCompanyId();
    
    this.getEmployee();
    this.getCompanyNames();
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
    { headerName: 'Emp Code', field:'employee_code' ,sortable: true, filter: true, minWidth: 160, },
    { headerName: 'Employee Name', field:'emp_name' ,sortable: true, filter: true, minWidth: 180, },
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
        cellRenderer: (params:any) => {
          
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

  downloadTemplate(): void {
    const userConfirmed = confirm("Do you want to download the employee template?");
    if (userConfirmed) {
      const headers = ['role_id', 'emp_title', 'emp_name', 'emp_email', 'emp_gender', 'department_id', 'designation_id', 'CTC', 'statutory_list', 'bank_name', 'account_num', 'ifsc_code', 'doj', 'emp_contact', 'emp_address'];
      const exampleRow = [
        '3', 'mr', 'abc', 'abc@gmail.com', 'male', '1', '2', '4', 'xyz', 'SBI', '458438236526', 'SBIN0005088', '2/1/2022', '9999999999', 'Pune'
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
  getEmployee() {
    this.isLoading = true;
    let company_id = this.selectedCompanyId;
    this.service.post("company/employee", { company_id }).subscribe((res: any) => {
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
        }));
      } else {
        this.rowData = [];
        this.toastr.warning('Data Not Found')
      }
    }, (error) => {
      this.rowData = [];
      console.error('Error fetching employees:', error);
    });
    this.isLoading = false;
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
        this.closeAllModals();
        this.importExcelCompanyId = '';
        this.getEmployee();
      } else {
        const skippedInfo = res.skipped?.map((row: any) => `Row ${row.row}: skipped due to ${row.reason}`).join('\n');
        this.toastr.error(skippedInfo || 'Upload failed.');
        this.importExcelCompanyId = '';
        this.closeAllModals();
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
    console.log('called');

    if (this.gridApiActive) {
      this.gridApiActive.exportDataAsCsv({
        fileName: 'Employee_List.csv',
        columnKeys: [
          'employee_code',
          'emp_name',
          'emp_contact',
          'doj',
          'department_name',
          'designation_name',
          'status'
        ],
        allColumns: false,
        onlySelected: false,
      });
    } else {
      console.error('Grid API not initialized.');
    }
  }

}
