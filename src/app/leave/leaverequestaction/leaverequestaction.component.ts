import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var bootstrap: any;

@Component({
  selector: 'app-leaverequestaction',
  templateUrl: './leaverequestaction.component.html',
  styleUrls: ['./leaverequestaction.component.css']
})
export class LeaverequestactionComponent implements ICellRendererAngularComp {
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

  viewLeave() {
    this.viewClicked.emit(this.data); // send selected row data to parent
  }
}

