import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payroll-status',
  templateUrl: './payroll-status.component.html',
  styleUrls: ['./payroll-status.component.css']
})
export class PayrollStatusComponent {
  CompanyNames: any = [] ;
   selectedCompanyId : any = 1 ;
   selectedYear: any;
   selectedMonth: any;
   rowData: any = [];
   selectedRowData: any[] = [];
   activeTab: string = 'tab1';
   
   today: string = new Date().toISOString().split('T')[0];
   constructor(private router: Router, private service: HrmserviceService, private toastr: ToastrService) {}
 
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
 
   selectTab(tab: string) {
     this.activeTab = tab;
   }
 
 
   ngOnInit() {
     this.selectedYear = new Date().getFullYear();
     this.selectedMonth = new Date().getMonth() + 1;
     const currentDate = new Date();
     this.today = currentDate.toISOString().split('T')[0];
     this.getCompanyNames();
     this.getpayrollList();
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
     this.getpayrollList();
   }
 
   getpayrollList() {
     this.service.post('get/payroll_status', { 
       company_id: this.selectedCompanyId, 
       year: this.selectedYear,
       month: this.selectedMonth,
     }).subscribe((res: any) => {
       console.log(res)
       try {
         if (res.status === 'success') {
           this.rowData = res.data.map((item:any)=>({
             employee_code: item.employee_code,
             employeeName : item.emp_name,
             grossAmount : item.gross_salary,
             overTime : item.total_overtime,
             netAmount : item.net_salary,
             deduction : item.deduction,
             employe_id : item.employe_id
           }));
         } 
       } catch (error) {
         console.log(error);
       }
     })
   }
 
   ApproveRejectPayrollList() {
     
   }
 
   columnDefs: ColDef[] = [
     {
       headerName: 'Employee Code',
       field: 'employee_code',
       sortable: true,
       filter: true,
     },
     {
       headerName: 'Employee Name',
       field: 'employeeName',
       sortable: true,
       filter: true,
     },
 
     {
       headerName: 'Gross Amount',
       field: 'grossAmount',
       sortable: true,
       filter: true,
     },
     {
       headerName: 'Over Time',
       field: 'overTime',
       sortable: true,
       filter: true,
     },
     {
       headerName: 'Deductions',
       field: 'deduction',
       sortable: true,
       filter: true,
     },
     {
       headerName: 'Net Amount',
       field: 'netAmount',
       sortable: true,
       filter: true,
     },
     {
       headerName: 'Status',
       field: 'status',
       sortable: true,
       filter: true,
     },
   ];

   gridOptions = {
     rowHeight: 45,
     rowClass: 'custom-row-class',
     pagination: false,
     paginationPageSize: 10,
     paginationPageSizeSelector: [10, 50, 100],
   };
 

 

}
