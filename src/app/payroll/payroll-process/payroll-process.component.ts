import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-process',
  templateUrl: './payroll-process.component.html',
  styleUrls: ['./payroll-process.component.css'],
})
export class PayrollProcessComponent {
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
      headerName: 'Employee Name',
      field: 'employeeName',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Department',
      field: 'department',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Role',
      field: 'role',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Present Days',
      field: 'presentDays',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'Absent Days',
      field: 'absentDays',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'hours',
      field: 'hours',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'OT (in Hrs)',
      field: 'overTime',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'Gross Amount',
      field: 'grossAmount',
      sortable: true,
      filter: true,
      maxWidth: 150,
      // flex:1
    },
  ];

  onSelectionChanged(event: any): void {
    const selectedRows = event.api.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }

  rowData = [
    {
      employeeName: 'Shivani',
      department: 'Developer',
      role: 'front End',
      presentDays: '23',
      absentDays: '3',
      hours: '232',
      overTime: '112',
      grossAmount: '59,000',
    },
    {
      employeeName: 'Shivani',
      department: 'Developer',
      role: 'front End',
      presentDays: '23',
      absentDays: '3',
      hours: '232',
      overTime: '112',
      grossAmount: '59,000',
    },
    {
      employeeName: 'Shivani',
      department: 'Developer',
      role: 'front End',
      presentDays: '23',
      absentDays: '3',
      hours: '232',
      overTime: '112',
      grossAmount: '59,000',
    },
    {
      employeeName: 'Shivani',
      department: 'Developer',
      role: 'front End',
      presentDays: '23',
      absentDays: '3',
      hours: '232',
      overTime: '112',
      grossAmount: '59,000',
    },
    {
      employeeName: 'Shivani',
      department: 'Developer',
      role: 'front End',
      presentDays: '23',
      absentDays: '3',
      hours: '232',
      overTime: '112',
      grossAmount: '59,000',
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

  companies = [
    {
      name: 'Company A',
    },
    {
      name: 'Company B',
    },
    {
      name: 'Company C',
    },
    {
      name: 'Company D',
    },
  ];
}
