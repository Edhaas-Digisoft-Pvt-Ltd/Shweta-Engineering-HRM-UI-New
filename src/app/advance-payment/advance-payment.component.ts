import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from '../hrmservice.service';

@Component({
  selector: 'app-advance-payment',
  templateUrl: './advance-payment.component.html',
  styleUrls: ['./advance-payment.component.css'],
})
export class AdvancePaymentComponent {
  constructor(private fb: FormBuilder, private service: HrmserviceService) {}
  today: string = new Date().toISOString().split('T')[0];
  title: String = 'Company Demo';
  role: string = '';
  // EditAdvancePayment
  EditAdvancePayment!: FormGroup;

  activeTab: string = 'tab1';
  gridApiActive: any;


  


  columnDefs: ColDef[] = [];

  ngOnInit() {
    this.test()
    this.getAllAdvPayment();
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    // this.initializeGrids();

    this.role = this.service.getRole();
    this.initializeColumns();
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }


  getAllAdvPayment() {
    this.service.post('all/advancesaraly', {}).subscribe((res: any) => {
      try {
        if (res.status == 'success') {
          console.log(res.data);

        }
      } catch (error) {
        console.log(error);

      }
    })
  }

  test() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      try {
        if (res.status == "success") {
          console.log(res.data);
        }
      } catch (error) {
        console.log(error);

      }
    })
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
    alert('month change');
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
      // { headerName: 'Company', field: 'company', sortable: true, filter: true },
      {
        headerName: 'Department',
        field: 'department',
        sortable: true,
        filter: true,
      },
      { headerName: 'Role', field: 'role', sortable: true, filter: true },
      { headerName: 'Amount', field: 'amount', sortable: true, filter: true },
      { headerName: 'Tenure', field: 'tenure', sortable: true, filter: true },
      // { headerName: 'EMI Start Date', field: 'emiStartDate', sortable: true, filter: true },
      // { headerName: 'Next Due Date', field: 'nextDueDate', sortable: true, filter: true },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        filter: true,
        cellRenderer: this.statusButtonRenderer,
      },
    ];
    if (this.role !== 'accountant') {
      this.columnDefs.push({
        headerName: 'Actions',
        cellStyle: { border: '1px solid #ddd' },

        cellRenderer: (params: any) => {
          return `<button type="button" class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#advanceRequestModal">
  <i class="bi bi-pencil"></i>
</button>`;
        },
      });
    }
  }

  rowData = [
    {
      id: 'EMP001',
      date: '2025-05-01',
      name: 'John Doe',
      company: 'Company A',
      department: 'Finance',
      role: 'Accountant',
      amount: 50000,
      tenure: '6 months',
      status: 'Approved',
    },
    {
      id: 'EMP002',
      date: '2025-05-01',
      name: 'Jane Smith',
      company: 'Company B',
      department: 'HR',
      role: 'HR Manager',
      amount: 40000,
      tenure: '4 months',
      status: 'Pending',
    },
    {
      id: 'EMP003',
      date: '2025-05-01',
      name: 'Amit Sharma',
      company: 'Company C',
      department: 'IT',
      role: 'Software Engineer',
      amount: 60000,
      tenure: '8 months',
      status: 'Rejected',
    },
  ];


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
    if (status === 'Pending') {
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

  updateStatus(data: any) {
    alert("update")

  }
}
