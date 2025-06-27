import { Component } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payroll-process',
  templateUrl: './payroll-process.component.html',
  styleUrls: ['./payroll-process.component.css'],
})
export class PayrollProcessComponent {
  CompanyNames: any = [];
  selectedCompanyId: any = 1;
  selectedYear: any;
  selectedMonth: any;
  rowData: any = [];
  selectedRowData: any[] = [];
  gridApiActive!: GridApi;

  today: string = new Date().toISOString().split('T')[0];
  constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) { }

  rowSelection: string = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  // financialYears = [2022, 2023, 2024, 2025];
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

  ngOnInit() {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.getCompanyNames();
    this.getPayrollProcess();
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

  onYearMonthChange() {
    this.getPayrollProcess();
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  getPayrollProcess() {
    this.service.post('fetch/payroll', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear,
      month: this.selectedMonth,
    }).subscribe((res: any) => {
      console.log(res)
      try {
        if (res.status === 'success') {
          this.rowData = res.data.map((item: any) => ({
            employeeName: item.emp_name,
            department: item.department_name,
            role: item.role_name,
            presentDays: item.present_days,
            absentDays: item.absent_days,
            hours: item.total_hours,
            overTime: item.total_overtime,
            employe_id: item.employe_id,
          }));
        }
      } catch (error) {
        console.log(error);
      }
    })
  }

  // processPayroll() {
  //   if (this.selectedRowData.length === 0) {
  //     this.toastr.warning('Please select at least one employee.');
  //     return;
  //   }

  //   this.selectedRowData.forEach((emp: any) => {
  //     const payload = {
  //       employee_id: emp.employe_id, 
  //       year: this.selectedYear,
  //       month: this.selectedMonth,
  //       // basic_salary: 20000, 
  //       // total_tax_deduction: 200, 
  //     };

  //     this.service.post("craete/payroll", payload).subscribe({
  //       next: () => {
  //         this.toastr.success(`Payroll processed successfully`);
  //         this.getPayrollProcess();
  //       },
  //       error: (err) => {
  //         console.error(err);
  //       }
  //     });
  //   });
  // }

  //for multiple selection
  processPayroll() {
    if (this.selectedRowData.length === 0) {
      this.toastr.warning('Please select at least one employee.');
      return;
    }

    const payrolls  = this.selectedRowData.map((emp: any) => ({
      employee_id: emp.employe_id,
      year: this.selectedYear,
      month: this.selectedMonth,
      // basic_salary: 20000, 
      // total_tax_deduction: 500, 
    }));
    const payload = { payrolls };
    console.log('payloadArray',payload)
    this.service.post("craete/payroll", payload).subscribe({
      next: (res) => {
        this.toastr.success('Payroll processed successfully.');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to process payroll.');
      }
    });
  }

  columnDefs: ColDef[] = [
    {
      headerName: '',
      maxWidth: 50,
      checkboxSelection: true, // Enables checkbox selection on rows
      headerCheckboxSelection: true, // Optional: if you want to select/unselect all
    },
    {
      headerName: 'Employee Name',
      field: 'employeeName',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Department',
      field: 'department',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Role',
      field: 'role',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Present Days',
      field: 'presentDays',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'Absent Days',
      field: 'absentDays',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'hours',
      field: 'hours',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'OT (in Hrs)',
      field: 'overTime',
      sortable: true,
      filter: true,
      maxWidth: 140,
    },
    {
      headerName: 'Gross Amount',
      field: 'grossAmount',
      sortable: true,
      filter: true,
      maxWidth: 150,
      // flex:1
    },
  ];

  onSelectionChanged(event: any): void {
   this.selectedRowData = event.api.getSelectedRows();
    console.log('Selected rows:', this.selectedRowData);
  }

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

  exportExcel() {
    console.log('called')
    if (this.gridApiActive) {
      this.gridApiActive.exportDataAsCsv();
    }
  }

}
