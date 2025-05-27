import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var bootstrap: any;

@Component({
  selector: 'app-edit-leave-request',
  templateUrl: './edit-leave-request.component.html',
  styleUrls: ['./edit-leave-request.component.css']
})
export class EditLeaveRequestComponent implements ICellRendererAngularComp {
  params: any;
  leaveRequestForm: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return true;
  }

  openModal() {
    const modalId = `#leaveModal${this.params.node.id}`;
    const modalElement = document.querySelector(modalId) as HTMLElement;

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement); // ✅ this will now work
      modal.show();
    }
  }

  @Input() data: any;
  @Output() viewClicked = new EventEmitter<any>();

  editID(params: any) {
    if (this.params.editCallback) {
      this.params.editCallback(params.data.tbl_emp_leave_id);
    }
  }
}

