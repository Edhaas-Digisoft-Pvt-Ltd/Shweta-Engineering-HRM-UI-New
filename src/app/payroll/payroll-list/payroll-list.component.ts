import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
// import { EmployeeActionComponent } from '../employee-action/employee-action.component';
import { PayrollActionBtnComponent } from './payroll-action-btn/payroll-action-btn.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.css'],
})
export class PayrollListComponent {
  constructor(private router: Router) {}

  rowSelection: string = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  columnDefs: ColDef[] = [
    {
      headerName: '',
      maxWidth: 50,
      checkboxSelection: true, // Enables checkbox selection on rows
      headerCheckboxSelection: true, // Optional: if you want to select/unselect all
    },
    {
      headerName: 'Date',
      field: 'date',
      sortable: true,
      filter: true,
      maxWidth: 100,
    },
    {
      headerName: 'Employee Name',
      field: 'employeeName',
      sortable: true,
      filter: true,
    },

    {
      headerName: 'Gross Amount',
      field: 'grossAmount',
      sortable: true,
      filter: true,
      maxWidth: 150
    },
    {
      headerName: 'Over Time (in Hrs)',
      field: 'overTime',
      sortable: true,
      filter: true,
      maxWidth: 150

    },
    {
      headerName: 'Total Hours (in Hrs)',
      field: 'joinDate',
      sortable: true,
      filter: true,
      maxWidth: 150
    },
    {
      headerName: 'Deductions',
      field: 'contact',
      sortable: true,
      filter: true,
      maxWidth: 150
    },
    {
      headerName: 'Net Amount',
      field: 'contact',
      sortable: true,
      filter: true,
      maxWidth: 150,
      // flex:1
    },

    {
      headerName: 'Actions',
      // field: 'inquiry_id',
      cellStyle: { border: '1px solid #ddd' },
      maxWidth: 100,
      cellRenderer: PayrollActionBtnComponent,
      cellRendererParams: {
        // clickedEdit: (field: any) => this.getqutation(field),
        // clickedView: (field: any) => this.viewqutation(field),
        // quotationEdit: (field: any) => this.editqutation(field),
      },
      flex:1

    },
  ];

  onSelectionChanged(event: any): void {
    const selectedRows = event.api.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }

  rowData = [
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },
    {
      date:'April 2025',
      employeeName: 'Shivani',
      department: 'computer',
      grossAmount: 'computer',
      overTime: '361.4',
      joinDate: '09-03-2025',
      contact: '9078121214',
    },

  ];



  create_user() {
    // alert("Create User");
    this.router.navigate(['/authPanal/CreateEmployee']);
  }
  gridOptions = {
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: false,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],


  };

}
