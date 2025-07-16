import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { CalendarOption } from '@fullcalendar/angular/private-types';
// import * as bootstrap from 'bootstrap';
import dayGridPlugin from '@fullcalendar/daygrid';
declare var bootstrap: any;
import { ManageBonusIncentiveBtnComponent } from '../compnay-setup/bonus-and-incentive/manage-bonus-and-incentive/manage-bonus-incentive-btn/manage-bonus-incentive-btn.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ColDef,
  GridApi,
  ColumnApi,
  GridReadyEvent,
  ColGroupDef,
  GridOptions,
} from 'ag-grid-community';

@Component({
  selector: 'app-demo2',
  templateUrl: './demo2.component.html',
  styleUrls: ['./demo2.component.css'],
})
export class Demo2Component {
  addForm: FormGroup;
  editForm: FormGroup;
  rowData: any[] = [];
  gridApi: any;
  selectedRow: any;

  columnDefs: ColDef[] = [
    {
      headerName: 'Employee Name',
      field: 'employeeName',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Date',
      field: 'date',
      sortable: true,
      filter: true,
      maxWidth: 150,
    },
    {
      headerName: 'Bonus Amount',
      field: 'bonusAmt',
      sortable: true,
      filter: true,
      maxWidth: 200,
    },
    {
      headerName: 'incentive Amount',
      field: 'incentiveAmt',
      sortable: true,
      filter: true,
      maxWidth: 200,
    },

    {
      headerName: 'Created On',
      field: 'createdOn',
      sortable: true,
      filter: true,
      maxWidth: 200,
    },
    {
      headerName: 'Actions',
      cellRenderer: ManageBonusIncentiveBtnComponent,
      cellRendererParams: {
        onEdit: this.onEdit.bind(this),
        onDelete: this.onDelete.bind(this),
      },
    },
  ];

  constructor(private fb: FormBuilder) {
    this.addForm = this.fb.group({
      companyId: ['', [Validators.required]],
      employeeName: ['', [Validators.required]],
      date: ['', [Validators.required]],
      bonusAmt: ['', [Validators.required]],
      incentiveAmt: ['', [Validators.required]],
    });

    this.editForm = this.fb.group({
      companyId: ['', [Validators.required]],
      employeeName: ['', [Validators.required]],
      date: ['', [Validators.required]],
      bonusAmt: ['', [Validators.required]],
      incentiveAmt: ['', [Validators.required]],
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  comapnyName = [
    {
      name: 'Hrishikesh',
      value: 'hrishikesh',
    },
    {
      name: 'Onkar',
      value: 'onkar',
    },
    {
      name: 'Sonal',
      value: 'sonal',
    },
  ];
  employeeName = [
    {
      name: 'Hrishikesh',
      value: 'hrishikesh',
    },
    {
      name: 'Onkar',
      value: 'onkar',
    },
    {
      name: 'Sonal',
      value: 'sonal',
    },
  ];

  addData() {
    this.rowData.push(this.addForm.value);
    this.gridApi.setRowData(this.rowData);
    this.addForm.reset();
  }

  onEdit(row: any) {
    this.selectedRow = row;
    this.editForm.patchValue(row);
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('editModal')
    );
    modal.show();
  }

  onDelete(row: any) {
    this.rowData = this.rowData.filter((d) => d.id !== row.id);
    this.gridApi.setRowData(this.rowData);
  }

  updateData() {
    const index = this.rowData.findIndex((d) => d.id === this.selectedRow.id);
    if (index !== -1) {
      this.rowData[index] = {
        ...this.selectedRow,
        ...this.editForm.getRawValue(),
      };
      this.gridApi.setRowData(this.rowData);
    }

    const modal = (window as any).bootstrap.Modal.getInstance(
      document.getElementById('editModal')
    );
    modal.hide();
  }
}
