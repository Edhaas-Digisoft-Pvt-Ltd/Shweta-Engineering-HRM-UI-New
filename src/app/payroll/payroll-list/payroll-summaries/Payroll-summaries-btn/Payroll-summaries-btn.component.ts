import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-payroll-summaries-btn',
  template: `
    <button class="btn btn-sm btn-print" (click)="printEmployee()">
        <i class="bi bi-printer"></i>
      </button>
  `,
  styles: [
    `
     button {
      cursor: pointer;
    }
    `
  ]
})
export class PayrollSummariesBtnComponent implements ICellRendererAngularComp {
   params: any;


    constructor(private router: Router) {}

    agInit(params: any): void {
      this.params = params;
    }

    refresh(): boolean {
      return false;
    }



    printEmployee() {
      alert("Employee In details")
      console.log('Employee In details:', this.params.data);

    }

}
