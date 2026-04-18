import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { ModalServiceService } from '../modal-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-emp-leave-advsalary-report',
  templateUrl: './emp-leave-advsalary-report.component.html',
  styleUrls: ['./emp-leave-advsalary-report.component.css']
})
export class EmpLeaveAdvsalaryReportComponent {
  activeTab: string = 'tab1';
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
  employee_id!: any;
  years: number[] = [];
  leaveRowData: any[] = [];
  leaveColumnDefs: ColDef[] = [];
  leaveRequestForm!: FormGroup;
  leaveRequestData: any;
  previousLeaves: any[] = [];

  // years = [2023, 2024, 2025,2026];
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
  generateyears() {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();

    this.years = [];

    for (let year = startYear; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService, private modalService: ModalServiceService, private route: ActivatedRoute ) { }

  ngOnInit() {
    let role_name = sessionStorage.getItem('roleName')
    if (role_name == 'Operator' || role_name == 'Supervisor' || role_name === 'Manager' || role_name === 'Maintenance Manager'
      || role_name === 'Production Manager' || role_name === 'Quality Manager' || role_name === 'Data-Entry Operator'
      || role_name === 'Production Incharge' || role_name === 'Plant Incharge') {
      const signalEmpId = this.service.EmployeeId();
      if (signalEmpId != null) {
        this.employee_id = this.service.EmployeeId();
        console.log('from signal', this.employee_id);
      } else {
        this.employee_id = sessionStorage.getItem('employeeId');
        console.log('session storage', this.employee_id);
      }
    }
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

    this.leaveRequestForm = this.fb.group({
      employeeName: [{ value: '', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      leaveType: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }],
      noOfDays: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }],
      leavereason: [{ value: '', disabled: true }],
      cancelReason: ['', Validators.required]
    });

    this.searchEmployeeAdvanceSalary();
    this.generateyears();
    this.initializeColumns();
    this.initializeLeaveColumns();

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];

        if (this.activeTab === 'tab2') {
          this.searchEmployeeLeaves(); // 👈 load leaves automatically
        }
      }
    });
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'tab2') {
      this.searchEmployeeLeaves();
    }
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
    console.log('called');
    console.log('empid', this.employee_id);

    const payload = {
      employee_id: this.employee_id,
      year: this.selectedYear,
    };

    this.service.post('emp/advancesaraly/report', payload).subscribe(
      (res: any) => {
        if (res.status === 'success' && res.data.length > 0) {
          this.rowData = res.data;
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

  //advance salary
  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', sortable: true, filter: true, flex: 1 },
      { headerName: 'Emp Name', field: 'emp_name', sortable: true, filter: true, flex: 1 },
      { headerName: 'Apply Date', field: 'apply_date', sortable: true, filter: true, flex: 1 },
      { headerName: 'Adv. Amount', field: 'advance_amount', sortable: true, filter: true, flex: 1 },
      { headerName: 'Remaining Amt', field: 'remaining_balance', sortable: true, filter: true, flex: 1 },
      { headerName: 'EMI', field: 'emi', sortable: true, filter: true, flex: 0.8 },
      {
        headerName: 'Status', field: 'status', sortable: true, filter: true, flex: 1,
        cellRenderer: this.statusButtonRenderer,
      },
    ];
    this.columnDefs.push({
      headerName: 'Actions',
      flex: 1,
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

  //leaves
  initializeLeaveColumns() {
    this.leaveColumnDefs = [
      { headerName: 'Emp Code', field: 'employee_code', flex: 1 },
      { headerName: 'Emp Name', field: 'emp_name', flex: 1 },
      { headerName: 'Start Date', field: 'start_date', flex: 1 },
      { headerName: 'End Date', field: 'end_date', flex: 1 },
      {
        headerName: 'Apply Date',
        field: 'created_at',
        flex: 1,
        valueFormatter: (params: any) => {
          if (!params.value) return '';
          return params.value.split(' ')[0];
        }
      },
      { headerName: 'Days', field: 'total_leave_days', flex: 1 },
      { headerName: 'Reason', field: 'leave_reason', flex: 1 },
      {
        headerName: 'Status',
        field: 'leave_status',
        flex: 1,
        cellRenderer: this.statusButtonRenderer, // reuse same UI
      }
    ];
    this.leaveColumnDefs.push({
      headerName: 'Actions',
      maxWidth: 120,
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-sm"
              style="background-color:#C8E3FF">
              <i class="bi bi-eye"></i>
            </button>`;
      },
      onCellClicked: (event: any) => {
        this.openLeaveModal(event.data); // 👈 send row data
      }
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

  //adv salary
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
          requestDate: advanceInfo?.apply_date,
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

  //leaves
  searchEmployeeLeaves() {
    this.leaveRowData = [];

    const payload = {
      employee_id: this.employee_id,
      year: this.selectedYear,
    };

    this.service.post('emp/leaves/report', payload).subscribe(
      (res: any) => {
        if (res.status === 'success' && res.data.length > 0) {
          this.leaveRowData = res.data;
        } else {
          this.leaveRowData = [];
        }
      },
      (error) => {
        this.leaveRowData = [];
        if (error.status !== 404) {
          this.toastr.error('Error fetching leave data');
        }
      }
    );
  }

  calculatePaidAmount(): number {
    const total = +this.displayApprovedData.get('amount')?.value || 0;
    const remaining = +this.displayApprovedData.get('remainingBalance')?.value || 0;
    return total - remaining;
  }

  openLeaveModal(data: any) {
    this.modalService.openModal('leaveRequestModal')
    this.leaveRequestData = data;

    this.leaveRequestForm.patchValue({
      employeeName: data.emp_name,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.leave_status,
      leaveType: data.leave_name,
      noOfDays: data.total_leave_days,
      department: data.department_name,
      leavereason: data.leave_reason
    });

  }

  canShowCancelButton(): boolean {
    if (!this.leaveRequestData) return false;
    const status = this.leaveRequestData.leave_status;
    return status === 'pending' || status === 'Approved';
  }

  cancelLeave() {
    if (!this.leaveRequestData?.tbl_emp_leave_id) return;

    const cancelControl = this.leaveRequestForm.get('cancelReason');

    // Trigger validation UI
    cancelControl?.markAsTouched();

    if (cancelControl?.invalid) {
      this.toastr.warning('Please enter cancel reason');
      return;
    }

    const payload = {
      tbl_emp_leave_id: this.leaveRequestData.tbl_emp_leave_id,
      cancel_reason: cancelControl!.value
    };

    this.service.post('cancel/leave/request', payload).subscribe(
      (res: any) => {
        if (res.status === true || res.status === 'success') {
          this.toastr.success(res.message || 'Leave canceled successfully');
          this.searchEmployeeLeaves();
          this.modalService.closeModal();
        } else {
          this.toastr.warning(res.message);
        }
      },
      (error) => {
        if (error.error?.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Error canceling leave');
        }
      }
    );
  }
}
