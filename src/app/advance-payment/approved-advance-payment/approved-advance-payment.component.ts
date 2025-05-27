import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { EmployeeActionComponent } from 'src/app/employee/employee-action/employee-action.component';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-approved-advance-payment',
  templateUrl: './approved-advance-payment.component.html',
  styleUrls: ['./approved-advance-payment.component.css'],
})
export class ApprovedAdvancePaymentComponent {
  today: string = new Date().toISOString().split('T')[0];
  title: String = 'Company Demo';
  activeTab: string = 'tab1';
  gridApiActive: any;
  role: string = '';
  columnDefs: ColDef[] = [];

  advanceSalaryData = {
    id: '#0001',
    employeeName: 'Hrishikesh Vinayak Kadam',
    company: 'Company A',
    department: 'Design',
    role: 'Jr Designer',
    requestDate: '09/04/25',
    tenure: '6 Month',
    amount: 10000,
    paidAmount: 5000,
    firstInstallmentDate: '07/05/25',
    installmentEndDate: '07/11/25',
    lastInstallmentPaid: '09/05/25',
    nextInstallmentDue: '09/06/25',
  };

  constructor(private fb: FormBuilder, private service: HrmserviceService) {}

  ngOnInit() {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    // this.initializeGrids();
    this.role = this.service.getRole();
    this.initializeColumns();
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
  }

  // columnDefs: any[] = [];
  // rowData: any[] = [];
  monthlyColumnDefs: any[] = [];
  monthlyRowData: any[] = [];

  // gridApiActive: any;

  financialYears = [2022, 2023, 2024, 2025];
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  days = Array.from({ length: 31 }, (_, i) => i + 1);

  selectedYear: number = new Date().getFullYear();
  selectedMonth: string = this.months[new Date().getMonth()];
  monthIndex1Based = this.months.indexOf(this.selectedMonth);
  //  for selecting company
  optionsArray: string[] = ['Company A', 'Company B', 'Company C'];
  selectedValue: string = 'Company A'; // Default selected

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

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
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
    // alert("month change")
    console.log('Month Change');
  }

  public defaultColDef: ColDef = {
    editable: true,
    // flex: 1,
    resizable: true,
  };
  initializeColumns() {
    this.columnDefs = [
      { headerName: 'ID', field: 'id', sortable: true, filter: true },
      { headerName: 'Date', field: 'date', sortable: true, filter: true },
      {
        headerName: 'Employee Name',
        field: 'name',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Total Amount',
        field: 'amount',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Remaining Amount',
        field: 'remainingAmount',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'First Installment Date',
        field: 'tenure',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Next Due Date',
        field: 'nextDueDate',
        sortable: true,
        filter: true,
      },
      { headerName: 'Tenure', field: 'tenure', sortable: true, filter: true },
    ];
    if (this.role !== 'accountant') {
      this.columnDefs.push({
        headerName: 'Actions',
        cellStyle: { border: '1px solid #ddd' },

        cellRenderer: (params: any) => {
          return `<button type="button" class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#advanceSalaryModalinfo">
  <i class="bi bi-pencil"></i>
</button>`;
        },
      });
    }
  }

  rowData = [
    {
      id: 1,
      date: '2025-04-13',
      name: 'Shivani',
      amount: 100000,
      remainingAmount: 50000,
      tenure: '12 Months',
      emiStartDate: '2025-05-01',
      nextDueDate: '2025-06-01',
      status: 'Approved',
      joinDate: '2025-03-09',
      contact: '9078121214',
    },
    {
      id: 2,
      date: '2025-04-13',
      name: 'Mansi',
      amount: 80000,
      remainingAmount: 20000,
      tenure: '10 Months',
      emiStartDate: '2025-05-01',
      nextDueDate: '2025-06-01',
      status: 'Approved',
      joinDate: '2025-03-09',
      contact: '9078121214',
    },
    {
      id: 3,
      date: '2025-04-13',
      name: 'Mrunal',
      amount: 120000,
      remainingAmount: 60000,
      tenure: '18 Months',
      emiStartDate: '2025-05-01',
      nextDueDate: '2025-06-01',
      status: 'Approved',
      joinDate: '2025-03-09',
      contact: '9078121214',
    },
  ];

  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '18px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '100%';
    button.style.marginTop = '6px';

    // Conditional styling
    if (status === 'Pending') {
      button.style.backgroundColor = '#FFF291'; // light red
      button.style.color = '#721c24'; // dark red text
      button.style.border = '1px solid #f5c6cb';
    } else if (status === 'Approved') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
    }

    return button;
  }

  // update function
  updateStatus(data: any) {
    alert('update');
  }
}
