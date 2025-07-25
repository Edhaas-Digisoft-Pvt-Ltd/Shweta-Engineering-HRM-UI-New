import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { LeaveSetupBtnComponent } from './leave-setup-btn/leave-setup-btn.component';
declare var bootstrap: any;
@Component({
  selector: 'app-leave-setup',
  templateUrl: './leave-setup.component.html',
  styleUrls: ['./leave-setup.component.css']
})
export class LeaveSetupComponent {
  today = new Date().toISOString().split('T')[0];
  title: String = "Company Demo";
  CompanyDetails: any[] = [];
  leaveData: any[] = []; // Leave data populated
  optionsArray: any;
  selectedValue: any = 1; // Default selected1
  activeTab: string = 'tab1';
  selectedLeaveID: any;
  valData: any;
  companyForm: FormGroup;
  readonly NoWhitespaceRegExp: RegExp = new RegExp("\\S");
  Companydata: any = {};
  LeaveRule: FormGroup;
  EditLeaveRule: FormGroup;
  selectedLogoFile: any;
  isSubmitted = false;
  isEditSubmitted = false;
  CompanyNames: any = [];
  selectedCompanyId: any;
  rowData: any = [];
  columnDefs: ColDef[] = [];
  gridApiActive: any;
  singleleave: any;
  companyId: any;
  leaveId: any;
  isLoading: boolean = false;

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Name', field: 'leave_name', sortable: true, filter: true, maxWidth: 250, },
      { headerName: 'Leave Type', field: 'leave_type', sortable: true, filter: true, maxWidth: 220, },
      { headerName: 'No. of Leaves', field: 'leave_count', sortable: true, filter: true, maxWidth: 200 },
      { headerName: 'Is Carry Forward', field: 'leave_carryforwad', sortable: true, filter: true },
    ];
    this.columnDefs.push({
      headerName: 'Actions',
      cellStyle: { border: '1px solid #ddd' },
      cellRenderer: LeaveSetupBtnComponent,
      cellRendererParams: {
        editCallback: (leaveId: string) => this.openEditModal(leaveId),
        deleteCallback: (leaveId: string) => this.deleteLeaveRule(leaveId),
      },
    });
  }


  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) {
    this.companyForm = this.fb.group({
      // Company Name: Only letters, numbers, spaces, dots, and ampersands (e.g., TCS, Infosys Ltd., H&M)
      companyName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]{2,}$/),
          Validators.pattern(this.NoWhitespaceRegExp)
        ]
      ],

      // Company Logo: Required (file/image input)
      companyLogo: [null, Validators.required],
      masterCompanyList: [{ value: '', disabled: true, }, Validators.required],
      radioChoice: ['yes'],

      companyDescription: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]{2,}$/)
        ]
      ],

      // Incorporation Date: Required (can use custom date validator for past dates only)
      IncorporationDate: ['', Validators.required, Validators.max]
    });
    this.companyForm.get('radioChoice')?.valueChanges.subscribe(value => {
      const textInputControl = this.companyForm.get('masterCompanyList');
      if (value === 'yes') {
        textInputControl?.disable();
      } else {
        textInputControl?.enable();
      }
    });

    this.LeaveRule = this.fb.group({
      companyid: [null, [
        Validators.required,
        // Validators.pattern(/^\d+$/)  // only digits allowed (CompanyID is numeric)
      ]],

      leavenumber: ['', [
        Validators.required,
        // Validators.max(20),
        Validators.pattern(/^\d+$/)  // only digits
      ]],
      leavename: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[A-Za-z ]+$/),  // letters and spaces only
        this.noWhitespaceValidator
      ]],
      leavetype: [null, [
        Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        this.noWhitespaceValidator
      ]]
    });

    this.EditLeaveRule = this.fb.group({
      leavenumber: ['', [
        Validators.required,
        // Validators.max(30),
        Validators.min(1),
        Validators.pattern(/^\d+$/)
      ]],
      leavename: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[A-Za-z ]{2,}$/),
        this.noWhitespaceValidator
      ]],
      leavetype: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        this.noWhitespaceValidator
      ]]
    });
  }


  ngOnInit() {
    this.selectedCompanyId = this.service.selectedCompanyId();

    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.getCompanyData();
    this.getleaveData(this.selectedValue);
    this.getCompanyNames();
    this.getAllLeaves();
    this.initializeColumns();
  }

  getAllLeaves() {
    this.isLoading = true;
    this.rowData = [];
    this.service.post("fetch/companyleave", { company_id: this.selectedCompanyId }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.rowData = res.data.map((item: any) => ({
          leave_name: item.leave_name,
          leave_type: item.leave_type,
          leave_count: item.leave_count,
          leave_carryforwad: item.leave_carryforwad,
          leave_id: item.leave_id
        }));
      }
      this.isLoading = false;
    },
      (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.toastr.warning('Data Not Found');
        } else {
          console.error(error);
        }
      }
    );
    this.isLoading = false;
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.getAllLeaves()
  }

  noWhitespaceValidator(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }



  getCompanyData() {
    this.service.post("fetch/company", {}).subscribe((res: any) => {
      this.Companydata = res.Data;
    });
  }

  // getting company name
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

  getleaveData(id: any) {

    this.service.post("/leavesetup", {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.leaveData = res.data.filter((item: any) => item.CompanyID == id);
        if (this.leaveData.length != 0) {
          this.leaveData
        }
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
      console.log('Selected file:', this.selectedLogoFile);
    }
    this.companyForm.patchValue({ companyLogo: file.name });
  }

  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modalElement: any) => {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  }

  addCompany() {
    this.isSubmitted = true;
    if (this.companyForm.valid) {

      if (!this.selectedLogoFile) {
        this.toastr.error('Please select a company logo!');
        return;
      }

      const current_data: any = {
        ParentCompanyID: 1,
        CompanyName: this.companyForm.value.companyName,
        CompanyLocation: "Pune",
        TaxRuleID: 1,
        SettingID: 1,
        CompanyDescription: this.companyForm.value.companyDescription,
        CompanyLogo: this.selectedLogoFile.name,
        IncorporationDate: this.companyForm.value.IncorporationDate
      };

      console.log("Company Data: ", current_data);

      this.service.post("/addcompany", current_data).subscribe({
        next: (res) => {
          this.toastr.success('Form Submitted Successfully!');
          this.closeAllModals();
          this.getCompanyData();
          this.companyForm.reset(); // reset only after success
          this.selectedLogoFile = null;
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to add company.');
        }
      });

    } else {
      // this.companyForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields !');
    }
  }

  addLeaveRule() {
    this.isSubmitted = true;
    if (this.LeaveRule.valid) {
      let current_data: any = {
        "company_id": this.LeaveRule.value.companyid,
        "leave_type": this.LeaveRule.value.leavetype,
        "leave_name": this.LeaveRule.value.leavename,
        "leave_count": this.LeaveRule.value.leavenumber,
      }

      this.service.post("create/leave", current_data).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.toastr.success('Leave Rule Added!');
            this.LeaveRule.reset();
            this.isSubmitted = false;
            this.closeAllModals();
            this.getAllLeaves();
          }
        },
        (error) => {
          console.error(error);
          this.toastr.error('Something went wrong!');
        }
      );
    } else {
      this.toastr.error('Invalid Credentials!');
      this.LeaveRule.markAllAsTouched();
    }
  }

  openEditModal(id: any) {
    this.service.post("fetch-specific/emp-leave", { leave_id: id }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.leaveId = res.data.leave_id
        this.companyId = res.data.company_id
        this.EditLeaveRule.patchValue({
          leavetype: res.data.leave_type,
          leavename: res.data.leave_name,
          leavenumber: res.data.leave_count,
        })
      }
    },
      (error) => {
        console.error('Error fetching leave request:', error);
      }
    );
  }

  editLeaveData() {
    this.isEditSubmitted = true;
    if (this.EditLeaveRule.valid) {

      let current_data: any = {
        "leave_id": this.leaveId,
        "company_id": this.companyId,
        "leave_type": this.EditLeaveRule.value.leavetype,
        "leave_name": this.EditLeaveRule.value.leavename,
        "leave_count": this.EditLeaveRule.value.leavenumber,
      };

      this.service.post("update/leave", current_data).subscribe(
        (res: any) => {
          this.toastr.success(res.data);
          this.closeAllModals();
          this.getAllLeaves()
        },
        (error) => {
          console.error('Error:', error);
          this.toastr.error('Something went wrong!');
        }
      );
    } else {
      this.EditLeaveRule.markAllAsTouched();
      this.toastr.error('Invalid Credentials!');
      this.isEditSubmitted = false;
    }
  }

  deleteLeaveRule(id: any) {
    if (confirm("Are you sure?")) {
      this.service.post("delete/leave", { leave_id: id }).subscribe((res: any) => {
        this.toastr.success(res.data);
        this.getAllLeaves();
      },
        (error) => {
          console.error('Error fetching leave request:', error);
        }
      );
    }
  }
}
