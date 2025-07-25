import { Component } from '@angular/core';
import { ICellEditorAngularComp, ICellRendererAngularComp } from 'ag-grid-angular';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-edit-bonus-and-incentive',
  // standalone: true,
  template: `
    <div class="d-flex w-100">
      <button
        *ngIf="showIconAccountant"
        (click)="editID(params)"
        class="btn btn-sm mb-1 me-3"
        title="Edit"
        data-bs-toggle="modal"
        data-bs-target="#editBonusIncentiveModal"
        style="background-color:#C8E3FF"
      >
        <i class="bi bi-pencil"></i>
      </button>

      <button
       *ngIf="showIconAdmin"
        (click)="StatusEditId(params)"
        class="btn btn-sm mb-1 me-3"
        title="Edit"
        data-bs-toggle="modal"
        data-bs-target="#requestBonusIncentiveModal"
        style="background-color:#C8E3FF"
      >
        <i class="bi bi-power"></i>
      </button>
    </div>
  `,
  styleUrls: ['./edit-bonus-and-incentive.component.css'],
})
export class EditBonusAndIncentiveComponent implements ICellRendererAngularComp {
  params: any;
  role: string = '';
  showIconAccountant = false
  showIconAdmin = false
  constructor(private service: HrmserviceService) {}
  getValue() {
    throw new Error('Method not implemented.');
  }
  isPopup?(): boolean {
    throw new Error('Method not implemented.');
  }
  getPopupPosition?(): 'over' | 'under' | undefined {
    throw new Error('Method not implemented.');
  }
  isCancelBeforeStart?(): boolean {
    throw new Error('Method not implemented.');
  }
  isCancelAfterEnd?(): boolean {
    throw new Error('Method not implemented.');
  }
  focusIn?(): void {
    throw new Error('Method not implemented.');
  }
  focusOut?(): void {
    throw new Error('Method not implemented.');
  }
  afterGuiAttached?(): void {
    throw new Error('Method not implemented.');
  }

  agInit(params: any): void {
    this.params = params;
    this.role = this.service.getRole();
    if(this.role == "accountant"){
      this.showIconAccountant = true
    }
    if(this.role == "admin"){
      this.showIconAdmin = true
    }
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
