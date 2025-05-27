import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { EditLeaveRequestComponent } from './edit-leave-request/edit-leave-request.component';

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
  selectedCompanyId : any = 1 ;
  rowData : any = [];
  leaveRequestData!: any;
  empLeaveId : any;

  // @ViewChild('leaveModal') leaveModalRef!: ElementRef;

  // leave request data 
  singleleaveRequestData: any;

  // leaves data 
  leaveBalance = {
    casual: {
      total: 8,
      taken: 5,
      balance: 3
    },
    sick: {
      total: 8,
      taken: 2,
      balance: 6
    }
  };

  CompanyNames: any = [] ;
  selectedValue: any = 1 ; // Default selected

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private service: HrmserviceService) { }

  // leave request form : 
  ngOnInit(): void {
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

  }

  agInit(params: any): void {
    this.params = params;
  }


  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Name', field: 'emp_name',},
    { headerName: 'Company Name', field: 'company_name',},
    { headerName: 'Department', field: 'department_name',},
    { headerName: 'Start Date', field: 'start_date',},
    { headerName: 'End Date', field: 'end_date',},
    { headerName: 'Day Count', field: 'apply_leave_count',},

    {
      headerName: 'Leave Status',
      field: 'leave_status',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const status = params.value;
        let backgroundColor = '#6c757d'; // Default gray
        let textColor = '#000';

        if (status === 'Approved') backgroundColor = '#CAFFEA';
        else if (status === 'Rejected') backgroundColor = '#FFAFAF';
        else if (status === 'pending') {
          backgroundColor = '#FFF291';
          textColor = '#716300';
        }

        return `<span style="background-color:${backgroundColor}; color:${textColor}; 
               padding:0px ; margin:5px ;border-radius:20px; display:flex; justify-content:center; align-items:center;width:95%; height:30px">
                ${status}
              </span>`;
      }
    },

    {
      headerName: 'Actions',
      cellStyle: { border: '1px solid #ddd' },
      minWidth: 180,
      maxWidth: 400,
      cellRenderer: EditLeaveRequestComponent,
      cellRendererParams: {
        editCallback: (leaveId: any) => this.onViewLeaveClick(leaveId), 
      }
    }
  ];

  onViewLeaveClick(params: any) {
    this.empLeaveId = params;
     this.service.post(`single/leave/request`,{ "tbl_emp_leave_id": this.empLeaveId}).subscribe((res: any) => {
       if (res.status === 'success') {
        this.singleleaveRequestData = res.data[0]; 
        this.leaveRequestData = {
          employeeName: this.singleleaveRequestData?.emp_name,
          startDate: this.singleleaveRequestData?.start_date,
          endDate: this.singleleaveRequestData?.end_date,
          leaveType: this.singleleaveRequestData?.leave_type,
          status: this.singleleaveRequestData?.leave_status, // or 'Approved', 'Rejected'
          noOfDays: this.singleleaveRequestData?.apply_leave_count,
          department: this.singleleaveRequestData?.department_name,
          leavereason: this.singleleaveRequestData?.leave_reason,
        };
        this.leaveRequestForm.patchValue(this.leaveRequestData);    
       }
    });
  }
 
  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
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

  getLeaveRequests(){
     this.service.post('leave/request', { company_id: this.selectedCompanyId }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.rowData = res.data.map((item:any)=>({
            emp_name:item.emp_name,
            company_name:item.company_name,
            department_name:item.department_name,
            start_date:item.start_date,
            end_date:item.end_date,
            apply_leave_count : item.apply_leave_count,
            leave_status:item.leave_status,
            tbl_emp_leave_id: item.tbl_emp_leave_id,
        }));
        } 
      },
       (error) => {
        console.error('Error fetching leave request:', error);
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

  // search feild code :
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



  refresh(params: any): boolean {
    return true;
  }

  updateStatus(data: any) {
    if(confirm("Do you want to update Status?") == true){
      const payload = {
        tbl_emp_leave_id : this.empLeaveId,
        leave_status : data
      }
      this.service.post(`update/leave/request`,payload).subscribe((res: any) => {
        if(res.status === 'success'){
          this.getLeaveRequests()
           const modalElement = document.getElementById('leaveRequestModal');
            if (modalElement) {
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              if (modalInstance) {
                modalInstance.hide();
              }
            }
        }
      },(error) => {
        console.error('Error fetching leave request:', error);
      });
    }
  }

  submitForm() {
    if (this.leaveRequestForm.valid) {
      console.log('Form submitted:', this.leaveRequestForm.value);

      // Perform your action here (e.g., send data to server)
    } else {
      this.leaveRequestForm.markAllAsTouched();
      alert("Please fil form properly !!!");

    }
  }

  
}


