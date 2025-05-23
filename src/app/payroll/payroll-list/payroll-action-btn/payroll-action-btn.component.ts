import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-action-btn',
  template: `
    <div class="">
      <button class="btn btn-sm btn-print" ><i class="bi bi-printer"></i></button>
      <button class="btn btn-sm ms-2 btn-view" (click)="viewEmployee()"><i class="bi bi-eye"></i></button>
    </div>
  `,
  styles: [''],
})
export class PayrollActionBtnComponent implements ICellRendererAngularComp {
  params: any;

  constructor(private router: Router) {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  viewEmployee() {
    // alert("View Employee")
    console.log('View Employee:', this.params.data);
    this.router.navigate(['/authPanal/payrollSummary']);
  }

  printEmployee() {
    alert('Employee In details');
    console.log('Employee In details:', this.params.data);
    this.router.navigate(['/authPanal/EditEmployee']);
  }
}
