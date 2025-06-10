import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-manage-bonus-and-incentive',
  templateUrl: './manage-bonus-and-incentive.component.html',
  styleUrls: ['./manage-bonus-and-incentive.component.css'],
})
export class ManageBonusAndIncentiveComponent {
  // columnDefs: ColDef[] = [];

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'id', sortable: true, filter: true },
     {
      headerName: 'Employee Name',
      field: 'name',
      sortable: true,
      filter: true,
    },
    { headerName: 'Date', field: 'date', sortable: true, filter: true },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: this.statusButtonRenderer,
    },
    {
      headerName: 'Actions',
      cellStyle: { border: '1px solid #ddd' },

      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#advanceRequestModal">
  <i class="bi bi-pencil"></i>
</button>`;
      },
    },
  ];
  rowData = [
    {
      id: 'EMP001',
      date: '2025-05-01',
      name: 'John Doe',
      company: 'Company A',
      department: 'Finance',
      role: 'Accountant',
      amount: 50000,
      tenure: '6 months',
      status: 'Approved',
    },

  ];
  gridApiActive: any;
 onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }
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
}
