import { Component, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import * as XLSX from 'xlsx';
import { LeaveactionComponent } from '../leaveaction/leaveaction.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrmserviceService } from 'src/app/hrmservice.service';



@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent {
  @ViewChild('agGrid', { static: false }) agGrid!: AgGridAngular;
  rowData: any[] = [];
  activeTab: string = 'tab1';
  searchInputValue: string = " ";
  leaveData = [];
  optionsArray: string[] = ['Company A', 'Company B', 'Company C'];
  selectedValue: string = 'Company A';
  gridApiActive: any;

  //  columnDefs = [
  //   { headerName: 'Leave Name', field: 'leavename' },
  //   { headerName: 'Leave Type', field: 'leavetype' },
  //   { headerName: 'Leave Number', field: 'leavenumber' },
  //   {
  //     headerName: 'Icon',
  //     field: 'icon',
  //     cellRenderer: (params: any) => {
  //       return `<i class="${params.value}"></i>`;
  //     }
  //   }
  // ];

  // rowData = [
  //   {
  //     leavename: 'Sick Leaves',
  //     leavetype: 'leavebymonth',
  //     leavenumber: 2,
  //     icon: 'bi bi-check-circle text-success'
  //   },
  //   {
  //     leavename: 'Casual Leaves',
  //     leavetype: 'leavebyyear',
  //     leavenumber: 2,
  //     icon: 'bi bi-check-circle text-success'
  //   }
  // ];


  constructor(private service: HrmserviceService) {}

  ngOnInit() {
    const savedData = localStorage.getItem('todayGridData');
    if (savedData) {
      this.rowData = JSON.parse(savedData);
    }

  }

  
  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };


  getSelectedRows(): void {
    const selectedNodes = this.agGrid.api?.getSelectedNodes();
    const selectedData = selectedNodes?.map(node => node.data);
    console.log('Selected Rows:', selectedData);
    alert(JSON.stringify(selectedData, null, 2));
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  // filtering data from grid
  filterByStatus(status: string): void {
    if (this.agGrid && this.agGrid.api) {
      this.agGrid.api.setQuickFilter(''); // Reset any quick filter

      this.agGrid.api.setFilterModel({
        status: {
          type: 'equals',
          filter: status
        }
      });

      this.agGrid.api.onFilterChanged();
    }
  }

  clearStatusFilter(): void {
    if (this.agGrid && this.agGrid.api) {
      this.agGrid.api.setFilterModel(null); // Clear all filters
      this.agGrid.api.onFilterChanged();
    }
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  onFilterBoxChange() {
    this.gridApiActive.setQuickFilter(this.searchInputValue);
  }

  searchValue(searchValue: any) {
    throw new Error('Method not implemented.');
  }
  
  // emptyInput() {
  //   this.searchInputValue = '';
  //   window.location.reload();
  // }


}
