import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { EmployeeActionComponent } from '../employee-action/employee-action.component';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {
  gridApiActive: any;
  searchValue: string = '';
  CompanyNames: any ;
  selectedValue: string = 'Company A';
  employee: any = [];
  Employee_Data: any;
  selectedCompanyId: any = 1;
  rowData: any = [];
  
  constructor(private router: Router, private service: HrmserviceService) { }

  ngOnInit() {
    this.getEmployee();
    this.getCompanyNames();
  }

  getCompanyNames() {
    let company_id = this.selectedCompanyId;
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        // this.optionsArray = res.map((company: any) => company.CompanyName); // <-- only CompanyName
        this.CompanyNames = res.Data;
        console.log(this.CompanyNames);
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
    { headerName: 'Contact', field: 'emp_contact', sortable: true, filter: true },
    { headerName: 'Joining Date', field: 'doj', sortable: true, filter: true },
    { headerName: 'Department', field: 'department_name', sortable: true, filter: true },
    { headerName: 'Role', field: 'designation_name', sortable: true, filter: true },
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
        button.style.height ="28px";
        button.style.width ="100px";

        
    
        // Optional: Add event listener for button click if needed
        button.addEventListener('click', () => {
          console.log(`Button for ${status} clicked!`);
        });
    
        return button;  // Return the button to be rendered
      }
    },
    {
      headerName: 'Actions',
      field: 'employee_id',
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: EmployeeActionComponent,
      cellRendererParams: {
        viewEmployee : (field: any) => this.editApp(field),  
        // deleteCallback: (appId: string) => this.deleteApp(appId),
      },
    }
  ];



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

    let company_id = this.selectedCompanyId ;
    this.service.post("company/employee", {company_id}).subscribe((res: any) => {
      console.log(res.Data)
      if (res.status == 'success') {
        this.rowData = res.Data.map((item:any)=>({
          employee_id:item.employe_id,
          employee_code:item.employee_code,
          emp_name:item.emp_name,
          emp_contact:item.emp_contact,
          doj:item.doj,
          department_name:item.department,
          designation_name : item.designation,
          status:item.status ==="Active"?"active":"Inactive",
        }));
      }
      
    });
  }

  onOptionSelected() {
    console.log('Selected option:', this.selectedValue);
  }

  editApp(params :any ){

    alert(params);
    this.service.post(`fetchsingleemployee`,{ "employe_id": params}).subscribe((res: any) => {
      this.Employee_Data = res.data ;
      console.log(this.Employee_Data);

    });
    console.log("editApp",params);
  }
}
