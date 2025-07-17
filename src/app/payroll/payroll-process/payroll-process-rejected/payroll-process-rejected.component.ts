import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
declare var bootstrap: any;

@Component({
  selector: 'app-payroll-process-rejected',
  templateUrl: './payroll-process-rejected.component.html',
  styleUrls: ['./payroll-process-rejected.component.css']
})
export class PayrollProcessRejectedComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  CompanyNames: any = [];
  selectedCompanyId: any = 1;
  selectedYear: any;
  selectedMonth: any;
  rowData: any = [];
  selectedRowData: any[] = [];
  gridApiActive!: GridApi;
  activeTab: string = 'tab1';
  columnDefs: ColDef[] = [];
  selectedEmployeesForModal: any[] = [];

  today: string = new Date().toISOString().split('T')[0];
  constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) { }

  rowSelection: string = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

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

  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modalElement: any) => {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  }

  ngOnInit() {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.getCompanyNames();
    this.getRejectedPayroll();
    this.initializeColumns();
  }

  getMonthName(monthId: number): string {
    const month = this.months.find(m => m.id === monthId);
    return month ? month.value : '';
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
    this.getRejectedPayroll();
  }

  onYearMonthChange() {
    this.getRejectedPayroll();
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  getRejectedPayroll() {
    this.rowData = [];
    this.service.post('fetch/rejected/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
    }).subscribe((res: any) => {
      console.log(res)
      try {
        if (res.status === 'success') {
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            emp_name: item.emp_name,
            department: item.department_name, 
            role: item.role_name,
            presentDays: item.present_days,
            absentDays: item.absent_days,
            hours: item.total_hours,
            overTime: item.total_overtime,
            employe_id: item.employe_id,
            bonus_incentive_amount: item.bonus_incentive_amount ? `₹${item.bonus_incentive_amount}` : '-',
            advance_salary: item.advance_salary ? `₹${item.advance_salary}` : '-',
            net_salary: item.net_salary ? `₹${item.net_salary}` : '-',
          }));
        }
      } catch (error) {
        console.log(error);
      }
    })
  }

  processAction() {
    if (this.selectedRowData.length === 0) {
      this.toastr.warning('Please select at least one employee.');
      return;
    }

    const payrolls = this.selectedRowData.map((emp: any) => ({
      employee_id: emp.employe_id,
      year: this.selectedYear,
      month: this.selectedMonth,
    }));
    const payload = { payrolls };
    console.log('payloadArray', payload)
    this.service.post("craete/payroll", payload).subscribe({
      next: (res) => {
        this.toastr.success('Payroll processed successfully.');
        this.getRejectedPayroll();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to process payroll.');
      }
    });
  }

  initializeColumns() {
    this.columnDefs = [
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
        minWidth: 80,
      },
      {
        headerName: 'A',
        field: 'absentDays',
        sortable: true,
        filter: true,
        minWidth: 80,
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
    ]
  }

  gridOptions = {
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: false,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
  };


  onSelectionChanged(event: any): void {
    this.selectedRowData = event.api.getSelectedRows();
  }

  openEditModal() {
    if (this.selectedRowData.length === 0) {
      this.toastr.warning('Please select at least one employee.');
      return;
    }
    console.log('hi   ',this.selectedEmployeesForModal);
    
    this.selectedEmployeesForModal = [...this.selectedRowData];

    const modalElement = document.getElementById('rejectpayrollModalinfo');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('upload_file', file);

    // console.log('Importing Excel for:', this.selectedEmployee);

    this.service.post('import/attendance', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success(res.data);
        this.getRejectedPayroll();
        this.closeAllModals();
      } else {
        console.log(res.error);
      }
    });

    this.fileInput.nativeElement.value = '';
  }

}
