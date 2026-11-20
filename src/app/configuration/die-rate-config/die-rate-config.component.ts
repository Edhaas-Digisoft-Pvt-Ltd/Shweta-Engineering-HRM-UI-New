import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-die-rate-config',
  templateUrl: './die-rate-config.component.html',
  styleUrls: ['./die-rate-config.component.css']
})
export class DieRateConfigComponent implements OnInit {
  rowData: any = [];
  selectedRowData: any;
  EditDieRateForm!: FormGroup;
  isEditSubmitted = false;
  searchText = '';
  filteredRows: any[] = [];

  columnDefs: ColDef[] = [
    { headerName: 'Die Number', field: 'die_number', sortable: true, filter: true },
    { headerName: 'Remark', field: 'remark', sortable: true, filter: true },
    { headerName: 'Rate', field: 'die_rate', sortable: true, filter: true },
    {
      headerName: 'Action',
      sortable: false,
      filter: false,
      cellRenderer: () =>
        `<button type="button" class="btn btn-sm mb-1 edit-btn" style="background-color:#C8E3FF">
        <i class="bi bi-pencil"></i>
        </button>`,
      onCellClicked: (params) => {
        const target = params.event?.target as HTMLElement;
        if (target?.closest('.edit-btn')) {
          this.openEditModal(params.data);
        }
      }
    },
  ];

  public defaultColDef: ColDef = {
    editable: false,
    flex: 1,
    resizable: true,
  };

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    this.getDieRateData();

    this.EditDieRateForm = this.fb.group({
      die_number: [{ value: '', disabled: true }],
      remark: [{ value: '', disabled: true }],
      die_rate: ['', [Validators.required, Validators.min(0)]],
    });
  }

  getDieRateData() {
    this.service.post('fetch-die-rate', {}).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.rowData = res.data;
          this.applyFilter();
        }
      },
      (error) => console.error(error)
    );
  }

  openEditModal(rowData: any) {
    this.selectedRowData = rowData;
    this.isEditSubmitted = false;

    this.EditDieRateForm.patchValue({
      die_number: rowData.die_number,
      remark: rowData.remark,
      die_rate: rowData.die_rate,
    });

    const modalElement = document.getElementById('editdieratemodal');
    if (modalElement) {
      (bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement)).show();
    }
  }

  editDieRate() {
    this.isEditSubmitted = true;

    if (!this.EditDieRateForm.valid) {
      this.toastr.error('Please enter a valid die rate!!');
      return;
    }

    const payload = {
      id: this.selectedRowData.id,
      die_rate: this.EditDieRateForm.value.die_rate
    };

    this.service.post('edit-die-rate', payload).subscribe(
      () => {
        this.toastr.success('Die rate updated successfully');
        this.closeModal();
        this.getDieRateData();
      },
      () => this.toastr.error('Failed to update die rate')
    );
  }

  closeModal() {
    const modalElement = document.getElementById('editdieratemodal');
    if (modalElement) {
      bootstrap.Modal.getInstance(modalElement)?.hide();
    }
  }

  applyFilter() {
    const text = this.searchText.trim().toLowerCase();

    this.filteredRows = !text
      ? [...this.rowData]
      : this.rowData.filter((row: any) =>
        (row.die_number ?? '').toString().toLowerCase().includes(text) ||
        (row.remark ?? '').toString().toLowerCase().includes(text)
      );
  }
}