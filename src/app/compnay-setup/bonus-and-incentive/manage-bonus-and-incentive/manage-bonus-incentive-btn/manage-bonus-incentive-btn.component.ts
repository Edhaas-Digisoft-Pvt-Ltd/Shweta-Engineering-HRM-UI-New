import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-manage-bonus-incentive-btn',
  template: `
    <button type="button" (click)="onEdit()" class="btn btn-outline-dark mb-1">
      <i class="bi bi-pencil"></i>
    </button>
    <!-- <button class="btn btn-warning btn-sm me-1" (click)="onEdit()">Edit</button> -->
    <!-- <button class="btn btn-danger btn-sm" (click)="onDelete()">Delete</button> -->
  `,
  styles: [],
})
export class ManageBonusIncentiveBtnComponent
  implements ICellRendererAngularComp
{
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onEdit() {
    this.params.onEdit(this.params.data);
  }

  onDelete() {
    this.params.onDelete(this.params.data);
  }
}
