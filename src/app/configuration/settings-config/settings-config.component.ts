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
    this.initializeColumns();

    this.rowData = [];
    this.getSettingsdata();
    this.getStatutoryInfo();

    this.EditSettingForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      value: [{ value: '' }, Validators.required],
    })
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Name', field: 'name', sortable: true, filter: true },
      {
        headerName: 'Value', field: 'value', sortable: true, filter: true,
        valueFormatter: (params) =>
          params.data?.type === 'statutory'
            ? `${params.value} %`
            : params.value
      },
      {
        headerName: 'Action',
        cellRenderer: EditSettingConfigComponent,
        cellRendererParams: {
          editCallback: (rowData: any) => this.openEditModal(rowData),
        }
      },
    ];
  }

  getSettingsdata() {
    this.rowData = [];
    this.service.post('fetch-settings', {}).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data.length > 0) {
          const settingsData = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
            id: item.id,
            type: 'setting',
          }));
          this.rowData = [...this.rowData, ...settingsData];
        }
      } catch (error) {
        console.log(error);
      }
    },
      (error) => {
        console.error(error);
      })
  }

  getStatutoryInfo() {
    this.service.post('fetch-statutory-info', {}).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data.length > 0) {
          const statutoryInfoData = res.data.map((item: any) => ({
            name: item.statutory_name,
            value: Number(item.statutory_percentage),
            id: item.statutory_id,
            type: 'statutory'
          }));
          this.rowData = [...this.rowData, ...statutoryInfoData];
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
    this.selectedRowData = rowData;

    this.EditSettingForm.patchValue({
      name: rowData.name,
      value: rowData.value
    });

    this.EditSettingForm.patchValue(this.selectedRowData);

    const modalElement = document.getElementById('editsettingsmodal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement)
        || new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  updateSetting() {
    const payload = {
      id: this.selectedRowData.id,
      value: this.EditSettingForm.value.value
    };

    this.service.post('edit-settings', payload).subscribe(
      () => {
        this.toastr.success('Setting updated successfully');
        this.refreshGrid();
      },
      () => this.toastr.error('Failed to update setting')
    );
  }

  updateStatutory() {
    const payload = {
      statutory_id: this.selectedRowData.id,
      statutory_name: this.selectedRowData.name,
      statutory_percentage: this.EditSettingForm.value.value
    };

    this.service.post('update-statutory-info', payload).subscribe(
      () => {
        this.toastr.success('Statutory updated successfully');
        this.refreshGrid();
      },
      () => this.toastr.error('Failed to update statutory')
    );
  }

  refreshGrid() {
    const modalElement = document.getElementById('editsettingsmodal');
    if (modalElement) {
      bootstrap.Modal.getInstance(modalElement)?.hide();
    }

    this.rowData = [];
    this.getSettingsdata();
    this.getStatutoryInfo();
  }

  editSettingsData() {
    this.isEditSubmitted = true;

    if (!this.EditSettingForm.valid) {
      this.toastr.error('Please fill all required fields!!');
      return;
    }

    if (this.selectedRowData.type === 'setting') {
      this.updateSetting();
    } else if (this.selectedRowData.type === 'statutory') {
      this.updateStatutory();
    }
  }

}
