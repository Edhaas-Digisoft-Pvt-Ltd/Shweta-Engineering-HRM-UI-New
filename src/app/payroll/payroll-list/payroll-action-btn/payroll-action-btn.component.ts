import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-action-btn',
  template: `
    <div class="">
      <button class="btn btn-sm ms-2 btn-view" (click)="viewPayroll()"><i class="bi bi-eye"></i></button>
    </div>
  `,
  styles: [''],
})
export class PayrollActionBtnComponent implements ICellRendererAngularComp {
  params: any;
  employeeID : any;
  tempPayrollID : any

  constructor(private router: Router) {}

  agInit(params: any): void {
    this.params = params;
    this.employeeID = params.data.employe_id; 
    this.tempPayrollID = params.data.temp_payroll_id; 
  }

  refresh(): boolean {
    return false;
  }

  viewPayroll() {
    this.router.navigate(['/authPanal/payrollSummary'],{
      queryParams: { id: this.employeeID, temp_payroll_id: this.tempPayrollID}
    });
  }

  printEmployee() {
    alert('Employee In details');
    console.log('Employee In details:', this.params.data);
    this.router.navigate(['/authPanal/EditEmployee']);
  }
}
