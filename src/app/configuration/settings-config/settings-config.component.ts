import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { EditSettingConfigComponent } from './edit-setting-config/edit-setting-config.component';

@Component({
  selector: 'app-settings-config',
  templateUrl: './settings-config.component.html',
  styleUrls: ['./settings-config.component.css']
})
export class SettingsConfigComponent {
  rowData: any = [];
  columnDefs: ColDef[] = [];
  selectedRowData: any;
  EditSettingForm!: FormGroup;
  isEditSubmitted = false;

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    this.initializeColumns()
    this.getSettingsdata()

    this.EditSettingForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      value: [{ value: '' }, Validators.required],
    })
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Name', field: 'name', sortable: true, filter: true },
      { headerName: 'Value', field: 'value', sortable: true, filter: true },
      {
        headerName: 'Action',
        cellRenderer: EditSettingConfigComponent,
        cellRendererParams: {
          editCallback: (rowData: any) => this.openEditModal(rowData),
        }
      }
    ];
  }

  getSettingsdata() {
    this.rowData = [];
    this.service.post('fetch-settings', {}).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data.length > 0) {
          this.rowData = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
            id: item.id,
          }))
        }
      } catch (error) {
        console.log(error);
      }
    },
      (error) => {
        console.error(error);
      })
  }

  openEditModal(rowData: any) {
    this.selectedRowData = {
      id: rowData.id,
      name: rowData.name,
      value: rowData.value,
    }

    this.EditSettingForm.patchValue(this.selectedRowData);

    const modalElement = document.getElementById('editsettingsmodal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement)
        || new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  editSettingsData() {
    this.isEditSubmitted = true;
    if (this.EditSettingForm.valid) {
      let current_data: any = {
        "id": this.selectedRowData.id,
        "value": this.EditSettingForm.value.value,
      };

      this.service.post("edit-settings", current_data).subscribe(
        (res: any) => {
          this.toastr.success("Edit Settings Successfully!");

          const modalElement = document.getElementById('editsettingsmodal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement)
              || new bootstrap.Modal(modalElement);
            modalInstance.hide();
          }

          this.getSettingsdata();
        },
        (error) => {
          console.error('Error:', error);
          this.toastr.error('Something went wrong!');
        }
      );
    } else {
      this.toastr.error('Please fill all required fields!!');
    }
  }

}
