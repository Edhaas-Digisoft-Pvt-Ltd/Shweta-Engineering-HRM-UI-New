import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { IRowNode } from 'ag-grid-community';

@Component({
  selector: 'app-payroll-approved',
  templateUrl: './payroll-approved.component.html',
  styleUrls: ['./payroll-approved.component.css']
})
export class PayrollApprovedComponent {
  CompanyNames: any = [];
  selectedCompanyId: any = 1;
  selectedYear: any;
  selectedMonth: any;
  today: string = new Date().toISOString().split('T')[0];
  rowData: any = [];
  selectedRowData: any[] = [];
  gridApi: any;
  gridColumnApi: any;
  activeTab: string = 'tab1';
  isLoading: boolean = false;

  constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) { }

  rowSelection: string = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  years = [2023, 2024, 2025];
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

  selectTab(tab: string) {
    this.activeTab = tab;
  }


  ngOnInit() {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.getCompanyNames();
    this.ApprovePayrollList();
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
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.ApprovePayrollList();
  }

  onYearMonthChange() {
    this.ApprovePayrollList();
  }

  ApprovePayrollList() {
    this.isLoading = true;
    this.service.post('fetch/approved/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
    }).subscribe(
      (res: any) => {
        try {
          if (res.status === 'success' && res.data && res.data.length > 0) {
            this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            department: item.department_name,
            role: item.role_name,
            presentDays: item.present_days,
            absentDays: item.absent_days,
            hours: item.total_hours,
            overTime: item.total_overtime + ' hrs',
            employe_id: item.employe_id,
            bonus_incentive_amount: item.bonus_incentive_amount ? `₹ ${item.bonus_incentive_amount}` : 'NA',
            advance_salary: item.advance_salary ? `₹ ${item.advance_salary}` : 'NA',
            net_salary: item.net_salary  ? `₹ ${item.net_salary}` : 'NA',
            }));
          } else {
            this.rowData = [];
            this.toastr.warning('Data Not Found');
          }
        } catch (error) {
          console.log(error);
          this.rowData = []; 
        }
      },
      (error) => {
       this.isLoading = false;
        this.rowData = [];
        if (error.status === 404) {
          this.toastr.warning('Data Not Found');
        } else {
          console.error(error);
        }
      }
    );
    this.isLoading = false;
  }

  columnDefs: ColDef[] = [
      {
        headerName: '',
        maxWidth: 50,
        checkboxSelection: true, 
        headerCheckboxSelection: true,
      },
      {
        headerName: 'Emp Code',
        field: 'employee_code',
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      {
        headerName: 'Department',
        field: 'department',
        sortable: true,
        filter: true,
        minWidth: 140,
      },
      {
        headerName: 'P',
        field: 'presentDays',
        sortable: true,
        filter: true,
        maxWidth: 70,
      },
      {
        headerName: 'A',
        field: 'absentDays',
        sortable: true,
        filter: true,
        maxWidth: 70,
      },
       {
        headerName: 'OT(hrs)',
        field: 'overTime',
        sortable: true,
        filter: true,
        minWidth: 100,
      },
      {
        headerName: 'hours',
        field: 'hours',
        sortable: true,
        filter: true,
        minWidth: 100,
      },
      {
        headerName: 'B & I',
        field: 'bonus_incentive_amount',
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      {
        headerName: 'Adv Salary',
        field: 'advance_salary',
        sortable: true,
        filter: true,
        minWidth: 140,
      },
      {
        headerName: 'Net Salary',
        field: 'net_salary',
        sortable: true,
        filter: true,
        minWidth: 140,
      },
  ];

  onSelectionChanged(event: any): void {
    this.selectedRowData = event.api.getSelectedRows();
    console.log('Selected rows:', this.selectedRowData);
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
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: false,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
  };


  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  exportSelectedRowsToCSV() {
    const selectedNodes: IRowNode<any>[] = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node: IRowNode<any>) => node.data);

    if (selectedData.length === 0) {
      this.toastr.warning('Please select at least one row to export.');
      return;
    }

    this.gridApi.exportDataAsCsv({
      onlySelected: true,
      columnKeys: ['employee_code', 'department', 'presentDays', 'absentDays', 'overTime', 'hours', 'bonus_incentive_amount','advance_salary', 'net_salary'],
      fileName: 'payrollApproved.csv',
    });
  }

}
