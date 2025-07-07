import { Component } from '@angular/core';

@Component({
  selector: 'app-leave-setup-btn',
  standalone: true,
   template: `
    <div class="d-flex w-100">
      <button (click)="editID(params)" class="btn btn-sm mb-1" title="Edit" data-bs-toggle="modal"
        data-bs-target="#exampleModal2" style="background-color:#C8E3FF">
        <i class="bi bi-eye"></i>
      </button>
      <button (click)="deleteID(params)" class="btn btn-sm mb-1 ms-2" style="background-color:#C8E3FF"><i class="bi bi-trash"></i></button>
    </div>
  `,
})
export class LeaveSetupBtnComponent {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  deleteID(params: any) {
    if (this.params.deleteCallback) {
      this.params.deleteCallback(params.data.leave_id);
    }
  }

  editID(params: any) {
    if (this.params.editCallback) {
      this.params.editCallback(params.data.leave_id);
    }
  }
}
