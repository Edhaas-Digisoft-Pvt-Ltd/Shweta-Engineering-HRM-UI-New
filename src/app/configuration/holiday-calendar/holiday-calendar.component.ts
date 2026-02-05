import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-holiday-calendar',
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.css']
})
export class HolidayCalendarComponent {


  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  HolidayForm!: FormGroup;
  selectedRowData: any;
  isSubmitted = false;
  financialYears: any[] = [];
  selectedFyId!: number;
  financialYear: any = null;
  financialYearCode: string = '';
  financialYearId: number | null = null;

  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true
  };

  constructor(
    private fb: FormBuilder,
    private service: HrmserviceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeColumns();

    this.HolidayForm = this.fb.group({
      holiday_date: ['', Validators.required],
      title: ['', Validators.required]
    });

    this.getFinancialYears();
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Holiday Date', field: 'holiday_date' },
      { headerName: 'Title', field: 'title' },
      {
        headerName: 'Action',
        cellRenderer: (params: any) => {
          return `
            <button class="btn btn-sm mb-1 me-1 edit-btn" style="background-color:#C8E3FF"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm mb-1 delete-btn" style="background-color:#C8E3FF"><i class="bi bi-trash"></i></button>
          `;
        },
        onCellClicked: (params: any) => {
          const target = params.event.target.closest('button');

          if (target?.classList.contains('edit-btn')) {
            this.openEditModal(params.data);
          }

          if (target?.classList.contains('delete-btn')) {
            this.deleteHoliday(params.data);
          }
        }
      }
    ];
  }

  getHolidays() {
    this.rowData = [];
    this.service.post('fetch-holidays', {
      fy_id: this.selectedFyId
    }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.rowData = res.data;
        }
      }
    );
  }

  openAddModal() {
    this.selectedRowData = null;
    this.isSubmitted = false;
    this.HolidayForm.reset();

    const modal = new bootstrap.Modal(
      document.getElementById('holidayModal')!
    );
    modal.show();
  }

  openEditModal(row: any) {
    this.selectedRowData = row;
    this.isSubmitted = false;

    this.HolidayForm.patchValue({
      holiday_date: row.holiday_date,
      title: row.title
    });

    const modal = new bootstrap.Modal(
      document.getElementById('holidayModal')!
    );
    modal.show();
  }

  saveHoliday() {
    this.isSubmitted = true;

    if (this.HolidayForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    if (this.selectedRowData) {
      this.updateHoliday();
    } else {
      this.addHoliday();
    }
  }

  addHoliday() {
    const payload = {
      fy_id: this.selectedFyId,
      ...this.HolidayForm.value
    };
    this.service.post('add-holidays', payload).subscribe(
      () => {
        this.toastr.success('Holiday added successfully');
        this.refreshGrid();
      },
      () => this.toastr.error('Failed to add holiday')
    );
  }

  updateHoliday() {
    const payload = {
      holiday_id: this.selectedRowData.holiday_id,
      fy_id: this.selectedFyId,
      ...this.HolidayForm.value
    };

    this.service.post('edit-holidays', payload).subscribe(
      () => {
        this.toastr.success('Holiday updated successfully');
        this.refreshGrid();
      },
      () => this.toastr.error('Failed to update holiday')
    );
  }

  deleteHoliday(row: any) {
    if (!confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    this.service.post('delete-holidays', { holiday_id: row.holiday_id }).subscribe(
      () => {
        this.toastr.success('Holiday deleted successfully');
        this.getHolidays();
      },
      () => this.toastr.error('Failed to delete holiday')
    );
  }

  refreshGrid() {
    bootstrap.Modal.getInstance(
      document.getElementById('holidayModal')!
    )?.hide();

    this.getHolidays();
  }

  getFinancialYears() {
    this.service.post('fetch-financial-years', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.financialYears = res.data;

        const currentFy = this.financialYears.find((f: any) => f.is_current == 1);
        if (currentFy) {
          this.selectedFyId = currentFy.fy_id;
          this.financialYearCode = currentFy.fy_code;
          this.getHolidays();
        }
      }
    });
  }

}
