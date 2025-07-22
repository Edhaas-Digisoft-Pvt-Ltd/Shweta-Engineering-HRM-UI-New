import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-bonuse-and-insentive-reports',
  templateUrl: './bonuse-and-insentive-reports.component.html',
  styleUrls: ['./bonuse-and-insentive-reports.component.css']
})
export class BonuseAndInsentiveReportsComponent {

  searchValue: string = '';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  today: string = new Date().toISOString().split('T')[0];
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  isLoading: boolean = false;
  gridApi: any;

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

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    this.initializeColumns()
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
  }

  onYearMonthChange() {
    this.searchEmployeeBonusIncentive();
  }

  searchEmployeeBonusIncentive() {
    this.rowData = [];
    const code = this.searchValue?.trim();
    if (!code) {
      this.rowData = [];
      this.toastr.error('Please Enter Employee Code');
      return;
    }

    const payload = {
      employee_code: code,
      year: this.selectedYear,
      month: this.selectedMonth,
    };

    this.service.post('emp/bonus-incentive/report', payload).subscribe(
      (res: any) => {
        if (res.status === 'success' && res.data.length > 0) {
          this.rowData = res.data;
        } else {
          this.rowData = [];
        }
      },
      (error) => {
        console.error('Error fetching salary report:', error);
        this.rowData = [];
      }
    );
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  emptyInput() {
    this.searchValue = '';
    window.location.reload();
  }

  public defaultColDef: ColDef = {
    editable: true,
    resizable: true,
  };

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

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true },
      { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true, minWidth:280 },
      { headerName: 'Date', field: 'bonus_incentive_date', sortable: true, filter: true, },
      { headerName: 'Bonus', field: 'bonus_amount', sortable: true, filter: true },
      { headerName: 'Incentive', field: 'incentive_amount', sortable: true, filter: true, },
      {
        headerName: 'Status', field: 'status', sortable: true, filter: true,
        cellRenderer: this.statusButtonRenderer,
      },
    ];
  }

}
