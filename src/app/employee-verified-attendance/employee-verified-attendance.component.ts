import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-verified-attendance',
  templateUrl: './employee-verified-attendance.component.html',
  styleUrls: ['./employee-verified-attendance.component.css']
})
export class EmployeeVerifiedAttendanceComponent {
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  isLoading: boolean = false;
  employee_id!: any;
  gridApi: any;

  startDate: string = this.getFirstDayOfMonth();
  endDate: string = this.getLastDayOfMonth();

  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true
  };

  constructor(private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    const isAdmin = sessionStorage.getItem('roleName') === 'Admin';

    if (!isAdmin) {
      const signalEmpId = this.service.EmployeeId();
      if (signalEmpId != null) {
        this.employee_id = signalEmpId;
      } else {
        this.employee_id = sessionStorage.getItem('employeeId');
      }
    }

    this.initializeColumns();
    this.fetchEmployeeAttendance();
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Date', field: 'attendance_date' },
      { headerName: 'CheckIn', field: 'check_in' },
      { headerName: 'CheckOut', field: 'check_out' },
      {
        headerName: 'Shift',
        field: 'shift_id',
        valueFormatter: (params: any) => {
          if (params.value == 1) return 'Morning';
          if (params.value == 2) return 'Evening';
          return params.value;
        }
      },
      { headerName: 'Status', field: 'status' },
      { headerName: 'OT Hours', field: 'over_time_hr' },
      {
        headerName: 'Late Mark',
        field: 'late_mark',
        valueFormatter: (params: any) => {
          return params.value == 1 ? 'Yes' : 'No';
        }
      },
    ];
  }

  fetchEmployeeAttendance() {
    const body: any = {
      employee_id: this.employee_id,
      start_date: this.startDate,
      end_date: this.endDate,
    };

    this.isLoading = true;

    this.service.post('employee/fetch-verified-attendance', body).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.rowData = res.status === 'success' ? res.data : [];
      },
      error: () => {
        this.isLoading = false;
        this.rowData = [];
        this.toastr.error('Error fetching attendance');
      }
    });
  }

  onDateRangeChange(): void {
    this.fetchEmployeeAttendance();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  getFirstDayOfMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  getLastDayOfMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }
}