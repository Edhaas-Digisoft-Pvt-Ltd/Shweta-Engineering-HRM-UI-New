import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-action',
  template: `
    <div class="d-flex align-items-center  mt-1">
     <button class="btn btn-sm " >
        <i class="bi bi-printer"></i>
      </button>
      <button class="btn btn-sm  me-2" (click)="viewEmployee()" style="background-color:#C8E3FF"
      >
        <i class="bi bi-eye"></i>
      </button>
     
    </div>
  `,
  styles: [`
    button {
      cursor: pointer;
    }
  `]
})
export class EmployeeActionComponent implements ICellRendererAngularComp {
  params: any;
  employeID : any;
  constructor(private router: Router) {}

  agInit(params: any): void {
    this.params = params;
    this.employeID = params.data.employee_id; // or the correct property name
    console.log("employee_action :",this.params.data);
    console.log(this.employeID);
  }
  

  refresh(): boolean {
    return false;
  }

  viewEmployee() {
    this.router.navigate(['/authPanal/EmployeeDashboard'],{
    queryParams: { id: this.employeID }
  });
    console.log(this.employeID);
  }

}
