import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ManageBonusIncentiveBtnComponent } from './manage-bonus-incentive-btn/manage-bonus-incentive-btn.component';
@Component({
  selector: 'app-manage-bonus-and-incentive',
  templateUrl: './manage-bonus-and-incentive.component.html',
  styleUrls: ['./manage-bonus-and-incentive.component.css'],
})
export class ManageBonusAndIncentiveComponent implements OnInit {
  // columnDefs: ColDef[] = [];
  addForm : any;
  editForm  : any;
  gridApi: any;
  selectedRow: any;
  constructor(private fb: FormBuilder) {
     this.addForm = this.fb.group({
      companyId: [
        '',
        [
          Validators.required
        ],
      ],
      employeeName: [
        '',
        [
          Validators.required
        ],
      ],
      date: [
        '',
        [
          Validators.required
        ],
      ],
      bonusAmt: [
        '',
        [
          Validators.required
        ],
      ],
      incentiveAmt: [
        '',
        [
          Validators.required
        ],
      ],
    });
    this.editForm = this.fb.group({
      companyId: [
        '',
        [
          Validators.required
        ],
      ],
      employeeName: [
        '',
        [
          Validators.required
        ],
      ],
      date: [
        '',
        [
          Validators.required
        ],
      ],
      bonusAmt: [
        '',
        [
          Validators.required
        ],
      ],
      incentiveAmt: [
        '',
        [
          Validators.required
        ],
      ],
    });
  }
  ngOnInit(): void {

  }
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
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: this.statusButtonRenderer,
      maxWidth: 150,
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
  // rowData = [
  //   {
  //     name: 'John Doe',
  //     date: '2025-05-01',
  //     bonusAmt: '123456',
  //     incentiveAmt: '123456',
  //     status: 'Approved',
  //     createdOn: '2025-05-01',
  //   },
  // ];
  rowData: any[] = [];
  //   gridApiActive: any;
  //  onGridReady(params: { api: any }) {
  //     this.gridApiActive = params.api;
  //   }

   onGridReady(params: any) {
    this.gridApi = params.api;
  }

  frameworkComponents = {
    // buttonCellRenderer: CreateModuleBtnComponent,
  };


  defaultColDef: ColDef = {
    sortable: false,

    flex: 1,
    resizable: true,
  };
  gridOptions = {
    rowHeight: 45,
    rowClass: 'custom-row-class',
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
  };
  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '97%';
    button.style.marginTop = '6px';

    // Conditional styling
    if (status === 'Pending') {
      button.style.backgroundColor = '#FFF291'; // light red
      button.style.color = '#721c24'; // dark red text
      button.style.border = '1px solid #f5c6cb';
      button.style.borderRadius = '20px';
    } else if (status === 'Approved') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
      button.style.borderRadius = '20px';
    } else if (status === 'Rejected') {
      button.style.backgroundColor = '#FFAFAF'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #FFAFAF';
      button.style.borderRadius = '20px';
    }

    return button;
  }

  updateStatus(data: any) {
    alert('update');
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
    if (this.addForm.invalid) {
      alert('Please fill all details to proceed!');
      return;
    }
    this.rowData.push(this.addForm.value);
    this.gridApi.setRowData(this.rowData);
    this.addForm.reset();
    const modal = (window as any).bootstrap.Modal.getInstance(
      document.getElementById('BonusAndIncentiveModal')
    );
    modal.hide();
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
    if (this.editForm.invalid) {
      alert('Please fill all details to proceed!');
      return;
    }
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
