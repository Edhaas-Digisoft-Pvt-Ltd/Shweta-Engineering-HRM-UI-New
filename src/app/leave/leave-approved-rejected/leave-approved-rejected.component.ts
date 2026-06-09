import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ToastrService } from 'ngx-toastr';
import { ModalServiceService } from 'src/app/modal-service.service';

@Component({
  selector: 'app-leave-approved-rejected',
  templateUrl: './leave-approved-rejected.component.html',
  styleUrls: ['./leave-approved-rejected.component.css']
})
export class LeaveApprovedRejectedComponent {
  today: string = new Date().toISOString().split('T')[0];
  gridApiActive: any;
  searchInputValue: any;
  params: any;
  leaveRequestForm!: FormGroup;
  selectedCompanyId: any;
  rowData: any = [];
  leaveRequestData!: any;
  empLeaveId: any;
  leaveBalance: any = {};
  previousLeaves: any;
  isLoading: boolean = false;
  activeTab: string = 'tab1';
  totalRows: number = 0;
  currentPage: number = 1;
  lastPage: number = 1;
  pagesToShow: (number | string)[] = [];
  paginationvalue: any;

  CompanyNames: any = [];
  selectedValue: any = 1;
  exportData: any;
  loggedInUser: any;

  startDate: string = this.getFirstDayOfMonth();
  endDate: string = this.getLastDayOfMonth();

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loggedInUser = sessionStorage.getItem('employeeId');

    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.selectedCompanyId = this.service.selectedCompanyId() ?? 'all';

    this.leaveRequestForm = this.fb.group({
      employeeName: [{ value: '', disabled: true }, Validators.required],
      startDate: [{ value: '', disabled: true }, Validators.required],
      endDate: [{ value: '', disabled: true }, Validators.required],
      leaveType: [{ value: '', disabled: true }, Validators.required],
      status: [{ value: '', disabled: true }, Validators.required],
      noOfDays: [{ value: '', disabled: true }, Validators.required],
      department: [{ value: '', disabled: true }, Validators.required],
      leavereason: [{ value: '', disabled: true }, Validators.required]
    });
    this.getCompanyNames();
    this.getPagination();
  }

  agInit(params: any): void {
    this.params = params;
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  openModel() {
    this.modalService.openModal('leaveRequestModal')
  }

  columnDefs: ColDef[] = [
    { headerName: 'Employee Code', field: 'employee_code', sortable: true, filter: true },
    { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true },
    { headerName: 'Start Date', field: 'start_date', sortable: true, filter: true },
    { headerName: 'End Date', field: 'end_date', sortable: true, filter: true },
    { headerName: 'Apply Date', field: 'created_at', sortable: true, filter: true },
    { headerName: 'Status', field: 'leave_status', cellRenderer: this.statusButtonRenderer, sortable: true, filter: true, maxWidth: 140 },
    {
      headerName: 'Actions',
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: (params: any) => {
        return `<button type="button" class="btn btn-sm mb-1" style="background-color:#C8E3FF">
              <i class="bi bi-eye"></i>
            </button>`;
      },
      onCellClicked: (event: any) => {
        this.getSingleLeaveRequest(event.data.tbl_emp_leave_id);
        this.openModel();
      },
    }
  ];

  getSingleLeaveRequest(params: any) {
    this.empLeaveId = params;
    this.service.post(`single/leave/request`, { "tbl_emp_leave_id": this.empLeaveId }).subscribe((res: any) => {
      if (res.status === 'success') {
        const singleleaveRequestData = res.current_leave;
        this.leaveRequestData = {
          employeeName: singleleaveRequestData?.emp_name,
          startDate: singleleaveRequestData?.start_date,
          endDate: singleleaveRequestData?.end_date,
          leaveType: singleleaveRequestData?.leave_name,
          status: singleleaveRequestData?.leave_status, // or 'Approved', 'Rejected'
          noOfDays: singleleaveRequestData?.total_leave_days,
          department: singleleaveRequestData?.department_name,
          leavereason: singleleaveRequestData?.leave_reason,
        };
        this.leaveRequestForm.patchValue(this.leaveRequestData);
        this.leaveBalance = res.leavebalnce[0];
        this.previousLeaves = res.previous_leaves;
      }
    });
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.getLeaveRequests();
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data;
        if (!this.selectedCompanyId) {
          this.selectedCompanyId = 'all'; // ADD
        }
      }
    });
  }

  getLeaveRequests(page: number = 1): void {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('leave/approved-rejected', {
      company_id: this.selectedCompanyId,
      start_date: this.startDate,
      end_date: this.endDate,
      page: page,
      isexport: false,
    }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            emp_name: item.emp_name,
            company_name: item.company_name,
            department_name: item.department_name,
            start_date: item.start_date,
            end_date: item.end_date,
            total_leave_days: item.total_leave_days,
            leave_status: item.leave_status,
            tbl_emp_leave_id: item.tbl_emp_leave_id,
            created_at: item.created_at ? item.created_at.split(' ')[0] : ''
          }));
          this.totalRows = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.lastPage = res.pagination.last_page;
          this.generatePageNumbers(this.paginationvalue);
        } else {
          this.toastr.warning('Data Not Found')
        }
        this.isLoading = false;
      },
      (error) => {
        if (error.status === 400) {
          // this.toastr.warning('Data Not Found');
        } else {
          console.error(error);
        }
        this.isLoading = false;
      }
    );
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
    this.getLeaveRequests();
  }

  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;
    button.style.padding = '6px 12px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'default';
    button.style.height = '30px';
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '97%';
    button.style.marginTop = '6px';

    // Conditional styling
    if (status === 'pending') {
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

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }
  onFilterBoxChange() {
    this.gridApiActive.setQuickFilter(this.searchInputValue);
  }
  searchValue(searchValue: any) {
    throw new Error('Method not implemented.');
  }
  emptyInput() {
    this.searchInputValue = '';
    window.location.reload();
  }

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };


  refresh(params: any): boolean {
    return true;
  }

  updateStatus(data: any) {
    if (confirm("Do you want to update Status?") == true) {
      const payload = {
        tbl_emp_leave_id: this.empLeaveId,
        leave_status: data,
        approved_by: this.loggedInUser,
      }
      this.service.post(`update/leave/request`, payload).subscribe((res: any) => {
        if (res.status === 'success') {
          this.toastr.success("Updated Successfully");
          this.getLeaveRequests()
          const modalElement = document.getElementById('leaveRequestModal');
          this.modalService.closeModal();
        }
      }, (error) => {
        console.error('Error fetching leave request:', error);
      });
    }
  }

  submitForm() {
    if (this.leaveRequestForm.valid) {
      console.log('Form submitted:', this.leaveRequestForm.value);

    } else {
      this.leaveRequestForm.markAllAsTouched();
      alert("Please fil form properly !!!");

    }
  }

  getFirstDayOfMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  getLastDayOfMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  exportExcel() {
    this.isLoading = true;
    this.service.post('leave/approved-rejected', {
      company_id: this.selectedCompanyId,
      start_date: this.startDate,
      end_date: this.endDate,
      isexport: true
    }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data.length) {
          const rows = res.data.map((r: any) => [
            r.employee_code,
            r.emp_name,
            r.department_name,
            r.start_date,
            r.end_date,
            r.total_leave_days,
            r.leave_status
          ]);

          const csvArray: string[][] = [
            ['Employee Code', 'Employee Name', 'Department', 'Start Date', 'End Date', 'Days', 'Status'],
            ...rows
          ];

          const csv = csvArray
            .map((row: string[]) => row.map((v: string | number | null) => `"${v ?? ''}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'LeaveRequests.csv'
          });
          link.click();

          this.toastr.success('Leave Requests exported successfully!');
        } else {
          this.toastr.warning('No data found to export');
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 400) {
          this.toastr.warning('No data found to export');
        } else {
          this.toastr.error('Error while exporting data');
        }
        this.isLoading = false;
      }
    });
  }

  getPagination() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data;

        this.getLeaveRequests();
      } else {
        this.paginationvalue = 10;
        this.getLeaveRequests();
      }
    });
  }

  getpaginationvalue() {
    this.service.post('get-pagination', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.paginationvalue = res.data
        this.generatePageNumbers(this.paginationvalue)
      }
    });
  }

  generatePageNumbers(pageWindow: number) {
    const total = this.lastPage;
    const current = this.currentPage;
    let startPage = current;
    let endPage = current + pageWindow - 1;

    if (endPage >= total) {
      endPage = total - 1;
      startPage = Math.max(2, total - pageWindow);
    }
    if (current === 1) {
      startPage = 2;
      endPage = Math.min(total - 1, pageWindow);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < total - 1) {
      pages.push('...');
    }
    if (total > 1) pages.push(total);

    this.pagesToShow = pages;
  }


  goToPage(page: number | string) {
    if (page === '...') return;
    if (page !== this.currentPage) {
      this.currentPage = page as number;
      this.getLeaveRequests(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getLeaveRequests(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.getLeaveRequests(this.currentPage);
    }
  }

}
