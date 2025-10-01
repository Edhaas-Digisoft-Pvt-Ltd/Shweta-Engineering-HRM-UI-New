import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { EditLeaveRequestComponent } from './edit-leave-request/edit-leave-request.component';
import { ToastrService } from 'ngx-toastr';
import { ModalServiceService } from 'src/app/modal-service.service';

declare var bootstrap: any;

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css']
})
export class LeaveRequestComponent {
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

  // @ViewChild('leaveModal') leaveModalRef!: ElementRef;

  // leaves data 
  // leaveBalance = {
  //   casual: {
  //     total: 8,
  //     taken: 5,
  //     balance: 3
  //   },
  //   sick: {
  //     total: 8,
  //     taken: 2,
  //     balance: 6
  //   }
  // };

  CompanyNames: any = [];
  selectedValue: any = 1;

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.selectedCompanyId = this.service.selectedCompanyId();

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
    this.getLeaveRequests();

    if (sessionStorage.getItem('roleName') == 'admin') {
      this.router.navigate(['/authPanal/Leave']);
      return;
    } else {
      alert('Please Login To Proceed');
      sessionStorage.clear();
      this.router.navigate(['']);
      return;
    }
  }

  agInit(params: any): void {
    this.params = params;
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
    { headerName: 'Department', field: 'department_name', sortable: true, filter: true },
    {
      headerName: 'Actions',
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: EditLeaveRequestComponent,
      cellRendererParams: {
        editCallback: (leaveId: any) => this.getSingleLeaveRequest(leaveId),
      }
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
          noOfDays: singleleaveRequestData?.apply_leave_count,
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
    this.getLeaveRequests();
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  getLeaveRequests() {
    this.isLoading = true;
    this.rowData = [];
    this.service.post('leave/request', { company_id: this.selectedCompanyId }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.rowData = res.data.map((item: any) => ({
            employee_code: item.employee_code,
            emp_name: item.emp_name,
            company_name: item.company_name,
            department_name: item.department_name,
            start_date: item.start_date,
            end_date: item.end_date,
            apply_leave_count: item.apply_leave_count,
            leave_status: item.leave_status,
            tbl_emp_leave_id: item.tbl_emp_leave_id,
          }));
        } else {
          this.toastr.warning('Data Not Found')
        }
        this.isLoading = false;
      },
      (error) => {
        if (error.status === 400) {
          this.toastr.warning('Data Not Found');
        } else {
          console.error(error);
        }
        this.isLoading = false;
      }
    );
  }

  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '18px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '100%';
    button.style.marginTop = '6px';


    // Conditional styling
    if (status === 'Deactive') {
      button.style.backgroundColor = '#f8d7da';  // light red
      button.style.color = '#721c24';           // dark red text
      button.style.border = '1px solid #f5c6cb';
    } else if (status === 'Active') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
    }

    return button;
  }

  create_user() {
    // alert("Create User");
    this.router.navigate(['/authPanal/CreateEmployee']);
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
        leave_status: data
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

  exportExcel() {
    this.gridApiActive.exportDataAsCsv({
      columnKeys: ['employee_code', 'emp_name', 'department_name'],
      fileName: 'LeaveRequests.csv',
    });
  }

}


