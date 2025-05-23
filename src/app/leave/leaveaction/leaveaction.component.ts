import { Component } from '@angular/core';

@Component({
  selector: 'app-leaveaction',
  template: `
    <div class="d-flex align-items-center  mt-1">
      <button class="btn btn-sm me-2" style="background-color:#C8E3FF" >
        <i class="bi bi-eye"></i>
      </button>
      <button class="btn btn-sm " style="background-color:#C8E3FF" >
        <i class="bi bi-printer"></i>
      </button>
    </div>
  `,
  styleUrls: ['./leaveaction.component.css']
})
export class LeaveactionComponent  {

}
