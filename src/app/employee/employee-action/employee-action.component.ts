import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-employee-action',
 template: `
  <div class="d-flex align-items-center">
    
    <!-- View Button -->
    <button class="btn btn-sm me-2" 
            (click)="viewEmployee()" 
            style="background-color:#C8E3FF">
      <i class="bi bi-eye"></i>
    </button>

    <!-- Change Password Button -->
    <button class="btn btn-sm" 
            (click)="changePassword()" 
            style="background-color:#FFE5B4">
      <i class="bi bi-key"></i>
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
  employeID: any;
  constructor(private router: Router, private service: HrmserviceService) { }

  agInit(params: any): void {
    this.params = params;
    this.employeID = params.data.employee_id; // or the correct property name
    // console.log("employee_action :",this.params.data);
    // console.log(this.employeID);
  }


  refresh(): boolean {
    return false;
  }

  viewEmployee() {
    this.router.navigate(['/authPanal/EmployeeInDetail'],{
      queryParams: { id: this.employeID }
    });
    console.log(this.employeID);
    // this.service.setEmployeeId(this.employeID);
    // console.log('login page', this.employeID);
    // this.router.navigate(['/authPanal/EmployeeInDetail']);
  }

  changePassword() {
  this.params.openChangePassword(this.employeID);
}
}
