import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-bonus-and-incentive',
  standalone: true,
  template: `
    <div class="d-flex w-100">
      <button (click)="editID(params)" class="btn btn-outline-dark me-3" title="Edit" data-bs-toggle="modal"
        data-bs-target="#editBonusIncentiveModal">
        <i class="bi bi-pencil-fill"></i>
      </button>
      <button (click)="StatusEditId(params)" class="btn btn-outline-dark me-3" title="Edit" data-bs-toggle="modal"
        data-bs-target="#requestBonusIncentiveModal">
        <i class="bi bi-power"></i>
      </button>
  `,
})
export class EditBonusAndIncentiveComponent {
 params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  StatusEditId(params: any) {
    if (this.params.editStatusCallback) {
      this.params.editStatusCallback(params.data);
    }
  }

  editID(params: any) {
    if (this.params.editCallback) {
      this.params.editCallback(params.data);
    }
  }
}
