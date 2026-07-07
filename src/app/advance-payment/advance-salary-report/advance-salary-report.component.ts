import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

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
  employees: any = [];
  EditAdvancePaymentData!: any;
  isLoading: boolean = false;
  gridApi: any;
  selectedCompanyId: any = 1;
  CompanyNames: any = [];
  selectedAdvpayid: number = 0;
  tabledata: any = [];

  years: number[] = [];

  generateyears() {
    const startYear = 2025;
    const currentYear = new Date().getFullYear();

    this.years = [];

    for (let year = startYear; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

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
    this.getCompanyNames();
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
      remainingBalance: [{ value: '', disabled: true }],
    })
    this.generateyears();
  }

  onYearMonthChange() {
    this.searchEmployeeAdvanceSalary();
  }

  getPaidEmiCount(): number {
    if (!this.selectedAdvpayid || !this.tabledata[this.selectedAdvpayid]) return 0;
    return this.tabledata[this.selectedAdvpayid].filter((e: { date: any; EMI: any; }) => e.date && e.EMI).length;
  }

  searchEmployeeAdvanceSalary() {
    this.rowData = [];
    const search = this.searchValue?.trim();
    if (!search) {
      this.rowData = [];
      this.toastr.error('Please Enter Employee Code or Name');
      return;
    }

    const payload = {
      search: search,     
      year: this.selectedYear,
    };

    this.service.post('emp/advancesaraly/report', payload).subscribe(
      (res: any) => {
        if (res.status === 'success' && res.data.length > 0) {
          const transformedData = res.data.map((item: any) => ({
            ...item,
            emi_status: item.emi_status ?? 'Ongoing',
          }));

          this.rowData = transformedData;
        } else {
          this.rowData = [];
          // this.toastr.warning('Data Not Found');
        }
      },
      (error) => {
        this.rowData = [];
        if (error.status === 404) {
          // this.toastr.warning('Data Not Found');
        } else {
          this.toastr.error(error);
        }
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
    } else if (status === 'Ongoing') {
      button.style.backgroundColor = '#faffafff'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #f7ffafff';
      button.style.borderRadius = '20px';
    } else if (status === 'Completed') {
      button.style.backgroundColor = '#c2ffafff'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #bfffafff';
      button.style.borderRadius = '20px';
    }

    return button;
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, maxWidth: 150 },
      { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true, maxWidth: 180 },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true, maxWidth: 150, valueFormatter: this.service.dateFormatter },
      { headerName: 'Adv. Amount', field: 'advance_amount', sortable: true, filter: true, maxWidth: 150 },
      { headerName: 'Remaining Amount', field: 'remaining_balance', sortable: true, filter: true, maxWidth: 190 },
      { headerName: 'EMI', field: 'emi', sortable: true, filter: true, maxWidth: 100 },
      {
        headerName: 'Status', field: 'status', sortable: true, filter: true, maxWidth: 150,
        cellRenderer: this.statusButtonRenderer,
      },
    ];
    this.columnDefs.push({
      headerName: 'Actions',
      maxWidth: 120,
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-sm mb-1" data-bs-toggle="modal" data-bs-target="#salaryReport" style="background-color:#C8E3FF">
          <i class="bi bi-eye "></i>
        </button>`;
      },
      onCellClicked: (event: any) => {
        this.getSingleAdvanceSalary(event.data.adv_pay_id);
      },
    });
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
  }

  getSingleAdvanceSalary(data: any) {
    this.selectedAdvpayid = data;
    this.service.post('single/report/advancesaraly', { adv_pay_id: data }).subscribe((res: any) => {
      if (res.status === 'success') {
        const advanceInfo = res.data.advance_info;
        const emiHistory = res.data.emi_history

        this.EditAdvancePaymentData = {
          id: advanceInfo?.employee_code,
          employeeName: advanceInfo?.emp_name,
          company: advanceInfo?.company_name,
          department: advanceInfo?.department_name,
          role: advanceInfo?.designation_name,
          requestDate: this.service.formatToDDMMYYYY(advanceInfo?.apply_date),
          status: advanceInfo?.status,
          tenure: advanceInfo?.tenure,
          amount: advanceInfo?.advance_amount,
          reason: advanceInfo?.remarks,
          EMIStartDate: advanceInfo?.updated_on,
          installmentAmount: advanceInfo?.emi,
          remainingBalance: advanceInfo?.remaining_balance,
          advanceAmount: advanceInfo?.advance_amount,
          firstInstallmentDate: advanceInfo?.deducted_on,
        };

        this.displayApprovedData.patchValue(this.EditAdvancePaymentData);

        if (this.selectedAdvpayid !== null) {
          const paidEmis = emiHistory.map((item: any) => ({
            date: item.year_month,
            installment_amount: item.installment_amount,
            installment_status: item.installment_status,
            remarks: item.remarks ? item.remarks : '-',
          }))
            .reverse();

          this.tabledata[this.selectedAdvpayid] = paidEmis;
        }
      } else {
        this.toastr.warning('Something went wrong!');
      }
    });
  }

  calculatePaidAmount(): number {
    const total = +this.displayApprovedData.get('amount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    return total - remaining;
  }

}
