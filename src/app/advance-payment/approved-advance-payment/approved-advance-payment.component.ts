import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  rowData: any = [];
  CompanyNames: any = [] ;
  selectedCompanyId : any = 1 ;
  selectedYear: any;
  selectedMonth: any;
  displayApprovedData!: FormGroup;
  approvedData!: any;

  constructor(private fb: FormBuilder, private service: HrmserviceService) {}

  ngOnInit() {
    const currentDate = new Date();
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    // this.initializeGrids();
    this.role = this.service.getRole();
    this.initializeColumns();
    this.getCompanyNames();
    this.getAllApprovedRequest();

    this.displayApprovedData = this.fb.group({
      id: [{ value: '', disabled: true }],
      employeeName: [{ value: '', disabled: true }],
      company: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      requestDate: [{ value: '', disabled: true }],
      tenure: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      firstInstallmentDate: [{ value: '', disabled: true }],
      installmentEndDate: [{ value: '', disabled: true }],
      lastInstallmentDate: [{ value: '', disabled: true }],
      installmentDueDate: [{ value: '', disabled: true }],
      remainingBalance: [{value: '', disabled: true}],
      advanceAmount: [{value: '', disabled: true}]
    })
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.getAllApprovedRequest();
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

  getAllApprovedRequest() {
    this.service.post('all/approvedrequest', { 
      // company_id: this.selectedCompanyId, 
      // year: this.selectedYear,
      // month: this.selectedMonth
    }).subscribe((res: any) => {
      try {
        if (res.status === 'success') {
          this.rowData = res.data.map((item:any)=>({
            emp_id:item.employee_code,
            emp_name:item.emp_name,
            apply_date:item.apply_date,
            advance_amount:item.advance_amount,
            remaining_balance:item.remaining_balance,
            emi: item.emi,
            updated_on:item.updated_on,
            deducted_on:item.deducted_on,
            status: item.status,
            tenure : item.tenure,
            adv_pay_id: item.adv_pay_id
          }));
        } 
      } catch (error) {
        console.log(error);
      }
    })
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
  days = Array.from({ length: 31 }, (_, i) => i + 1);
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
      { headerName: 'ID', field: 'emp_id', sortable: true, filter: true, maxWidth: 160 },
      {
        headerName: 'Employee Name',
        field: 'emp_name',
        sortable: true,
        filter: true,
        maxWidth:200
      },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true, maxWidth:150 },
      {
        headerName: 'Adv. Amount',
        field: 'advance_amount',
        sortable: true,
        filter: true,
        maxWidth:150
      },
      {
        headerName: 'Remaining Amount',
        field: 'remaining_balance',
        sortable: true,
        filter: true,
        maxWidth:190
      },
      {
        headerName: 'EMI',
        field: 'emi',
        sortable: true,
        filter: true,
        maxWidth:120
      },
      // {
      //   headerName: 'Updated On',
      //   field: 'updated_on',
      //   sortable: true,
      //   filter: true,
      //   maxWidth:140
      // },
      //   {
      //   headerName: 'Deducted On',
      //   field: 'deducted_on',
      //   sortable: true,
      //   filter: true,
      //   maxWidth:150
      // },
      // { headerName: 'Status', field: 'status', cellRenderer: this.statusButtonRenderer, sortable: true, filter: true,  maxWidth:140},
      { headerName: 'Tenure', field: 'tenure', sortable: true, filter: true,  maxWidth:110},
    ];
      this.columnDefs.push({
        headerName: 'Actions',
        maxWidth:120,
        cellStyle: { border: '1px solid #ddd' },
        cellRenderer: (params: any) => {
          return `<button type="button" class="btn btn-outline-dark mb-1" data-bs-toggle="modal" data-bs-target="#advanceSalaryModalinfo">
           <i class="bi bi-eye-fill"></i>
          </button>`;
        },
        onCellClicked: (event: any) => {
          this.getSingleApprovedData(event.data.adv_pay_id);
        },  
      });
  }

  getSingleApprovedData(data:any) {
     this.service.post('single/report/advancesaraly',{adv_pay_id: data}).subscribe((res: any) => {
      if(res.status === 'success'){
        const singleApprovedData = res.data[0];
          this.approvedData = {
            id: singleApprovedData?.employee_code,
            employeeName: singleApprovedData?.emp_name,
            company: singleApprovedData?.company_name,
            department: singleApprovedData?.department_name,
            role: singleApprovedData?.designation_name,
            requestDate: singleApprovedData?.apply_date,
            status: singleApprovedData?.status,
            tenure: singleApprovedData?.tenure,
            amount: singleApprovedData?.advance_amount,
            reason: singleApprovedData?.remarks,
            EMIStartDate: singleApprovedData?.updated_on,
            installmentAmount: singleApprovedData?.emi,
            remainingBalance: singleApprovedData?.remaining_balance,
            advanceAmount: singleApprovedData?.advance_amount,
            firstInstallmentDate: singleApprovedData?.deducted_on, 
          } 
        this.displayApprovedData.patchValue(this.approvedData);  
      }
    })
  }
  
  calculatePaidAmount(): number {
    const total = +this.displayApprovedData.get('amount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    return total - remaining;
  }

  calculatePaidPercentage(): number {
    const advance = +this.displayApprovedData.get('advanceAmount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    if (advance === 0) return 0;
    return Math.round(((advance - remaining) / advance) * 100);
  }

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

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  // update function
  updateStatus(data: any) {
    alert('update');
  }
}
