import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-setting-config',
    standalone: true,
    template: `
    <div class="d-flex w-100">
      <button (click)="editID()" class="btn btn-sm mb-1" title="Edit" style="background-color:#C8E3FF">
        <i class="bi bi-pencil"></i>
      </button>
    </div>
  `,
})
export class EditSettingConfigComponent {
    params: any;

    agInit(params: any): void {
        this.params = params;
    }

    refresh(params: any): boolean {
        this.params = params;
        return true;
    }

    editID() {
        if (this.params.editCallback) {
            this.params.editCallback(this.params.data);
        }
    }
}

