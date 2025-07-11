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
  isProcess: any = false;
  columnDefs: ColDef[] = [];
  selectedEmployee: any = null;
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

  ngOnInit() {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.getCompanyNames();
    this.getRejectedPayroll();
    this.initializeColumns();

    this.rowData = [
      {
        employeeName: 'John Doe',
        department: 'HR',
        presentDays: 22,
        absentDays: 2,
        hours: 176,
        overTime: 8,
        bonus: 1500,
        incentive: 1000,
        advance_salary: 2000,
        net_salary: 35000,
        employe_id: 1,
      },
      {
        employeeName: 'Jane Smith',
        department: 'Finance',
        presentDays: 21,
        absentDays: 3,
        hours: 168,
        overTime: 5,
        bonus: 2000,
        incentive: 1200,
        advance_salary: 1500,
        net_salary: 37000,
        employe_id: 2,
      },
      {
        employeeName: 'Robert Johnson',
        department: 'IT',
        presentDays: 20,
        absentDays: 4,
        hours: 160,
        overTime: 10,
        bonus: 2500,
        incentive: 1500,
        advance_salary: 3000,
        net_salary: 39000,
        employe_id: 3,
      },
      {
        employeeName: 'Emily Davis',
        department: 'Marketing',
        presentDays: 23,
        absentDays: 1,
        hours: 184,
        overTime: 6,
        bonus: 1800,
        incentive: 1100,
        advance_salary: 1000,
        net_salary: 36000,
        employe_id: 4,
      }
    ];

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
    // this.rowData = [];
    // this.service.post('fetch/payroll', {
    //   company_id: this.selectedCompanyId,
    //   year: this.selectedYear,
    //   month: this.selectedMonth,
    // }).subscribe((res: any) => {
    //   console.log(res)
    //   try {
    //     if (res.status === 'success') {
    //       this.rowData = res.data.map((item: any) => ({
    //         employeeName: item.emp_name,
    //         department: item.department_name,
    //         role: item.role_name,
    //         presentDays: item.present_days,
    //         absentDays: item.absent_days,
    //         hours: item.total_hours,
    //         overTime: item.total_overtime,
    //         employe_id: item.employe_id,
    //         bonus: item.bonus,
    //         incentive: item.incentive,
    //         advance_salary: item.advance_salary,
    //         net_salary: item.net_salary
    //       }));
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // })
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
        headerName: 'Emp Name',
        field: 'employeeName',
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
      // {
      //   headerName: 'Role',
      //   field: 'role',
      //   sortable: true,
      //   filter: true,
      // },
      {
        headerName: 'PD',
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
        headerName: 'hours',
        field: 'hours',
        sortable: true,
        filter: true,
        minWidth: 100,
      },
      {
        headerName: 'OT',
        field: 'overTime',
        sortable: true,
        filter: true,
        minWidth: 100,
      },

      {
        headerName: 'Bonus',
        field: 'bonus',
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      {
        headerName: 'Incentive',
        field: 'incentive',
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


  // onSelectionChanged(event: any): void {
  //   this.selectedRowData = event.api.getSelectedRows();
  //   console.log('Selected rows:', this.selectedRowData);
  // }

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


  onSelectionChanged(event: any): void {
    this.selectedRowData = event.api.getSelectedRows();
    console.log('Selected rows:', this.selectedRowData);
  }

  openEditModal() {
    if (this.selectedRowData.length === 0) {
      this.toastr.warning('Please select at least one employee.');
      return;
    }

    this.selectedEmployeesForModal = [...this.selectedRowData];

    // Open modal manually using Bootstrap
    const modalElement = document.getElementById('rejectpayrollModalinfo');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  exportExcel() {
    console.log('called')
    if (this.gridApiActive) {
      this.gridApiActive.exportDataAsCsv();
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('upload_file', file);

    console.log('Importing Excel for:', this.selectedEmployee); // Optional use

    this.service.post('import-attendance', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success(res.data);
        this.getRejectedPayroll();
      } else {
        console.log(res.error);
      }
    });

    this.fileInput.nativeElement.value = '';
  }

}
