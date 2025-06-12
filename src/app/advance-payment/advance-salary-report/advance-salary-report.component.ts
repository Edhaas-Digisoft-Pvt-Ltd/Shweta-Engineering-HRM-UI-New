import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-advance-salary-report',
  templateUrl: './advance-salary-report.component.html',
  styleUrls: ['./advance-salary-report.component.css']
})
export class AdvanceSalaryReportComponent {
  searchValue: string = '';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  today: string = new Date().toISOString().split('T')[0];
  displayApprovedData!: FormGroup;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  selectedEmployee: any;
  employees: any  = [];
  EditAdvancePaymentData!: any;

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

  constructor(private fb: FormBuilder, private service: HrmserviceService) {}

  ngOnInit() {
    this.initializeColumns()
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; 
      this.displayApprovedData = this.fb.group({
          id: [{ value: '', disabled: true }],
          employeeName: [{ value: '', disabled: true }],
          company: [{ value: '', disabled: true }],
          department: [{ value: '', disabled: true }],
          role: [{ value: '', disabled: true }],
          requestData: [{ value: '', disabled: true }],
          status: [{ value: '', disabled: true }],
          tenure: [{ value: '', disabled: true }],
          amount: [{ value: '', disabled: true }],
          reason: [{ value: '', disabled: true }],
          EMIStartDate: [{ value: '', disabled: true }],
          installmentAmount: [{ value: '', disabled: true }],
        })
    this.searchEmployeeAdvanceSalary()
  }

  searchEmployeeAdvanceSalary() {
    const code = this.searchValue?.trim();
    if (!code) {
      this.rowData = []; 
      return;
    }

    const payload = {
      employee_id: code,
      year: this.selectedYear,
      month: this.selectedMonth,
    };

    this.service.post('emp/advancesaraly/report', payload).subscribe(
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


  // getemployees () {
  //    this.service.post('all/employee', {}).subscribe((res: any) => {
  //     console.log(res)
  //     if (res.status == "success") {
  //       this.employees = res.data
  //     }
  //   },
  //     (error) => {
  //       console.error('Error fetching companies:', error);
  //     }
  //   );
  // }

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
    if (status === 'pending') {
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

  initializeColumns() {
    this.columnDefs = [
     { headerName: 'ID', field: 'employee_code', sortable: true, filter: true, maxWidth: 150 },
      { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true, maxWidth:180 },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true, maxWidth:150 },
      { headerName: 'Adv. Amount', field: 'advance_amount', sortable: true, filter: true, maxWidth:150 },
      { headerName: 'Remaining Amount', field: 'remaining_balance', sortable: true, filter: true, maxWidth:190 },
      { headerName: 'EMI', field: 'emi', sortable: true, filter: true, maxWidth:100 },
      { headerName: 'Status', field: 'status', sortable: true, filter: true, maxWidth:150,
        cellRenderer: this.statusButtonRenderer,
      },
    ];  
    this.columnDefs.push({
      headerName: 'Actions',
      maxWidth:120,
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-outline-dark mb-1" data-bs-toggle="modal" data-bs-target="#salaryReport">
          <i class="bi bi-eye "></i>
        </button>`;
      },
      onCellClicked: (event: any) => {
        this.getSingleAdvanceSalary(event.data.adv_pay_id);
      },  
    });
  }

  
  getSingleAdvanceSalary(data:any) {
     this.service.post('single/advancesaraly',{adv_pay_id: data}).subscribe((res: any) => {
      if(res.status === 'success'){
        const singleAdvanceSalary = res.data[0];
          this.EditAdvancePaymentData = {
            id: singleAdvanceSalary?.employee_code,
            employeeName: singleAdvanceSalary?.emp_name,
            company: singleAdvanceSalary?.company_name,
            department: singleAdvanceSalary?.department_name,
            role: singleAdvanceSalary?.designation_name,
            requestData: singleAdvanceSalary?.apply_date,
            status: singleAdvanceSalary?.status,
            tenure: singleAdvanceSalary?.tenure,
            amount: singleAdvanceSalary?.advance_amount,
            reason: singleAdvanceSalary?.remarks,
            EMIStartDate: singleAdvanceSalary?.updated_on,
            installmentAmount:singleAdvanceSalary?.emi,
          } 
        this.displayApprovedData.patchValue(this.EditAdvancePaymentData);  
      }
    })
  }

  calculatePaidAmount(): number {
    const total = +this.displayApprovedData.get('amount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    return total - remaining;
  }

}
