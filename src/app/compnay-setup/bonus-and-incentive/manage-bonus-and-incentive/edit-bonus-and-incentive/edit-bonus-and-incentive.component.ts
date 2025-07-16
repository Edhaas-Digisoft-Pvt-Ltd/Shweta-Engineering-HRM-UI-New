import { Component } from '@angular/core';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-edit-bonus-and-incentive',
  standalone: true,
   templateUrl: './edit-bonus-and-incentive.component.html',
})
export class EditBonusAndIncentiveComponent {
  params: any;
  role: string = '';
  constructor( private service: HrmserviceService) {}

  agInit(params: any): void {
    this.params = params;
    this.role = this.service.getRole();
    console.log(this.role);
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
