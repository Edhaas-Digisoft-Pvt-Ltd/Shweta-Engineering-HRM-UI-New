import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { LeaverequestactionComponent } from '../leaverequestaction/leaverequestaction.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
  // @ViewChild('leaveModal') leaveModalRef!: ElementRef;

  // leave request data 
  leaveRequestData = {
    employeeName: 'John Doe',
    startDate: '2025-04-10',
    endDate: '2025-04-12',
    leaveType: 'Casual Leave',
    status: 'Pending', // or 'Approved', 'Rejected'
    noOfDays: '2',
    department: 'HR',
    leavereason: 'Personal work',
  };

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

  constructor(private router: Router, private fb: FormBuilder) { }

  // leave request form : 
  ngOnInit(): void {
    this.leaveRequestForm = this.fb.group({
      employeeName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      leaveType: ['', Validators.required],
      status: ['', Validators.required],
      noOfDays: ['', Validators.required],
      department: ['', Validators.required],
      leavereason: ['', Validators.required]
    });
    this.leaveRequestData = {
      employeeName: 'John Doe',
      startDate: '2025-04-10',
      endDate: '2025-04-12',
      leaveType: 'Casual Leave',
      status: 'Pending', // or 'Approved', 'Rejected'
      noOfDays: '2',
      department: 'HR',
      leavereason: 'Personal work',
    };
    this.leaveRequestForm.patchValue(this.leaveRequestData);

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
    { headerName: 'Name', field: 'name', sortable: true, filter: true },
    { headerName: 'Company Name', field: 'companyname', sortable: true, filter: true },
    // { headerName: 'Role', field: 'role', sortable: true, filter: true },
    { headerName: 'Department', field: 'department', sortable: true, filter: true },
    { headerName: 'Start Date', field: 'startDate', sortable: true, filter: true },
    { headerName: 'End Date', field: 'endDate', sortable: true, filter: true },
    { headerName: 'Day Count', field: 'dayCount', sortable: true, filter: true },

    {
      headerName: 'Leave Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const status = params.value;
        let backgroundColor = '#6c757d'; // Default gray
        let textColor = '#000';

        if (status === 'Accepted') backgroundColor = '#CAFFEA';
        else if (status === 'Rejected') backgroundColor = '#FFAFAF';
        else if (status === 'Pending') {
          backgroundColor = '#FFF291';
          textColor = '#716300';
        }

        return `<span style="background-color:${backgroundColor}; color:${textColor}; 
               padding:0px ; margin:5px ;border-radius:20px; display:flex; justify-content:center; align-items:center;width:95%; height:30px">
                ${status}
              </span>`;
      }
    },

    // { headerName: 'Contact', field: 'contact', sortable: true, filter: true },
    {
      headerName: 'Actions',
      cellStyle: { border: '1px solid #ddd' },
      minWidth: 180,
      maxWidth: 400,
      cellRenderer: LeaverequestactionComponent,

    }
  ];


  rowData = [
    {
      name: 'Shivani',
      role: 'Frontend Developer',
      companyname: 'abc',
      department: 'UI/UX',
      status: 'Pending',
      joinDate: '2024-03-01',
      contact: '9876543210',
      startDate: '2025-04-10',
      endDate: '2025-04-12',
      dayCount: 3
    },
    {
      name: 'Mansi',
      role: 'Backend Developer',
      department: 'API Services',
      companyname: 'abc',
      status: 'Accepted',
      joinDate: '2023-11-15',
      contact: '9123456789',
      startDate: '2025-04-01',
      endDate: '2025-04-03',
      dayCount: 3
    },
    {
      name: 'Mrunal',
      role: 'Full Stack Developer',
      department: 'Engineering',
      companyname: 'abc',
      status: 'Rejected',
      joinDate: '2024-06-20',
      contact: '9988776655',
      startDate: '2025-03-25',
      endDate: '2025-03-27',
      dayCount: 3
    },
    {
      name: 'Shivani',
      role: 'Frontend Developer',
      department: 'UI/UX',
      companyname: 'abc',
      status: 'Pending',
      joinDate: '2024-03-01',
      contact: '9876543210',
      startDate: '2025-04-05',
      endDate: '2025-04-05',
      dayCount: 1
    },
    {
      name: 'Anuradha',
      role: 'Frontend Developer',
      department: 'UI/UX',
      companyname: 'abc',
      status: 'Pending',
      joinDate: '2024-03-01',
      contact: '9876543210',
      startDate: '2025-04-08',
      endDate: '2025-04-09',
      dayCount: 2
    }
  ];

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
    
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

  openModal() {
    const modalId = `#leaveModal${this.params.node.id}`;
    const modalElement = document.querySelector(modalId) as HTMLElement;

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  openLeaveRequestModal(data: any) {
    this.leaveRequestForm.patchValue(data); // Patch selected row data
    this.leaveRequestForm.disable();        // Make form readonly

    const modalElement = document.getElementById('leaveRequestModal');
    if (modalElement) {
      const bootstrapModal = new bootstrap.Modal(modalElement);
      bootstrapModal.show();
    }
  }

  updateStatus(data: any) {
    alert("update")
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


