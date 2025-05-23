import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance-action',
  template: `
  <div class="d-flex align-items-center mt-1">
      <button class="btn btn-sm btn-info me-2">
        <i class="bi bi-eye"></i>
      </button>
    </div>
`,
  styleUrls: ['./attendance-action.component.css']
})
export class AttendanceActionComponent {
  params: any;
  static savedColumnDefs: any[];
  static savedRowData: any[];

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return true;
  }
}
