import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { EditIncentiveConfigComponent } from './edit-incentive-config/edit-incentive-config.component';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-incentive-config',
  templateUrl: './incentive-config.component.html',
  styleUrls: ['./incentive-config.component.css']
})
export class IncentiveConfigComponent {
  rowData: any = [];
  columnDefs: ColDef[] = [];
  leaveId: any;
  selectedRowData: any;
  EditIncentiveForm!: FormGroup;
  isEditSubmitted = false;

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  // dummyData = [
  //   {
  //    'hours':'leass than 4',
  //    'incentive_rate':'0',
  //    'incentive_id': '1'
  //   },
  //   {
  //    'hours':'greater than or equal to 4 but less than 8',
  //    'incentive_rate':'100',
  //    'incentive_id': '2'
  //   },
  //   {
  //    'hours':'greater than or equal to 8  but less than 12',
  //    'incentive_rate':'200',
  //    'incentive_id': '3'
  //   },
  //   {
  //    'hours':'greater than or equal to 12',
  //    'incentive_rate':'300',
  //    'incentive_id': '4'
  //   },
  // ];

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    this.initializeColumns()
    this.getIncentiveData()

    this.EditIncentiveForm = this.fb.group({
      total_no_hours_worked: [{ value: '', disabled: true }, Validators.required],
      incentive_rate: [{ value: '' }, Validators.required],
    })
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Total no. of hours worked', field: 'total_no_hours_worked', sortable: true, filter: true },
      { headerName: 'Incentive per day', field: 'incentive_rate', sortable: true, filter: true },
      {
        headerName: 'Action',
        cellRenderer: EditIncentiveConfigComponent,
        cellRendererParams: {
          editCallback: (rowData: any) => this.openEditModal(rowData),
        }
      }
    ];
  }

  getIncentiveData() {
    this.rowData = [];
    this.service.post('fetch-incentive', {}).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data.length > 0) {
          this.rowData = res.data.map((item: any) => ({
            total_no_hours_worked: item.total_no_hours_worked,
            incentive_rate: item.incentive_rate,
            incentive_id: item.incentive_id,
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
      incentive_id: rowData.incentive_id,
      total_no_hours_worked: rowData.total_no_hours_worked,
      incentive_rate: rowData.incentive_rate,
    }

    this.EditIncentiveForm.patchValue(this.selectedRowData);

    const modalElement = document.getElementById('editIncentiveModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement)
        || new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  editIncentiveRate() {
    this.isEditSubmitted = true;
    if (this.EditIncentiveForm.valid) {
      let current_data: any = {
        "incentive_id": this.selectedRowData.incentive_id,
        "incentive_rate": this.EditIncentiveForm.value.incentive_rate,
      };

      this.service.post("edit-incentive", current_data).subscribe(
        (res: any) => {
          this.toastr.success("Edit Incentive Successfully!");

          const modalElement = document.getElementById('editIncentiveModal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement)
              || new bootstrap.Modal(modalElement);
            modalInstance.hide();
          }

          this.getIncentiveData();
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
