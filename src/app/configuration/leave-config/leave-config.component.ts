import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { EditLeaveBtnComponent } from './edit-leave-btn/edit-leave-btn.component';
import { ModalServiceService } from 'src/app/modal-service.service';

@Component({
  selector: 'app-leave-config',
  templateUrl: './leave-config.component.html',
  styleUrls: ['./leave-config.component.css']
})
export class LeaveConfigComponent {
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
  leaveTypes: any[] = [];
  currentYear: any;
  isLoading: boolean = false;
  lwpForm!: FormGroup;
  financialYear: any = null;
  financialYearCode: string = '';
  financialYearId: number | null = null;

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Leave Type', field: 'leave_name', sortable: true, filter: true, maxWidth: 250, },
      { headerName: 'Year Code', field: 'year_code', sortable: true, filter: true, maxWidth: 220, },
      { headerName: 'No. of Leaves', field: 'leave_count', sortable: true, filter: true, maxWidth: 200 },
      { headerName: 'Is Carry Forward', field: 'leave_carryforwad', sortable: true, filter: true },
      { headerName: 'Max Carry Forward', field: 'max_carry_forward', sortable: true, filter: true },
    ];
    // this.columnDefs.push({
    //   headerName: 'Actions',
    //   cellStyle: { border: '1px solid #ddd' },
    //   cellRenderer: EditLeaveBtnComponent,
    //   cellRendererParams: {
    //     editCallback: (leaveId: string) => this.openEditModal(leaveId),
    //     deleteCallback: (leaveId: string) => this.deleteLeaveRule(leaveId),
    //   },
    // });
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  constructor(private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService, private router: Router) {
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
      companyid: [null, Validators.required],
      leavetype: [null, Validators.required],
      year: [{ value: this.currentYear, disabled: true }],
      leavenumber: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(31),
        Validators.pattern(/^\d+$/)
      ]],
      carry_forward: ['FALSE', Validators.required],
      max_carry_forward: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(31)
      ]]
    });

    // Add this after LeaveRule is defined in constructor
    const maxCarryControl = this.LeaveRule.get('max_carry_forward');

    // Set default immediately
    maxCarryControl?.setValue(0);
    maxCarryControl?.disable();

    this.LeaveRule.get('carry_forward')?.valueChanges.subscribe(value => {
      if (value === 'FALSE') {
        maxCarryControl?.setValue(0);
        maxCarryControl?.disable();
      } else {
        maxCarryControl?.setValue('');
        maxCarryControl?.enable();
      }
    });

    this.EditLeaveRule = this.fb.group({
      leavetype: ['', [Validators.required]],             // leave_type_id
      year: [{ value: '', disabled: true }],
      leavenumber: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(31),
        Validators.pattern(/^\d+$/)
      ]],
      carry_forward: ['FALSE', Validators.required]
    });

    this.lwpForm = this.fb.group({
      leave_without_pay: [null]
    });

  }

  ngOnInit() {
    this.selectedCompanyId = this.service.selectedCompanyId();

    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.getCompanyData();
    // this.getleaveData(this.selectedValue);
    this.getCompanyNames();
    this.getAllLeaves();
    this.initializeColumns();
    this.getLeaveTypes();
    this.getRunningFinancialYear();
  }

  openModal() {
    this.modalService.openModal('addLeaveModal')
  }

  openModalLWP() {
    this.modalService.openModal('LWPModal');
    this.getLeaveWithoutPay();
  }

  getLeaveTypes() {
    this.isLoading = true;
    this.leaveTypes = [];

    this.service.post('fetch/leavetypes', {}).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.leaveTypes = res.data.map((item: any) => ({
            leave_type_id: item.leave_type_id,
            leave_types: item.leave_types
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
  }

  getAllLeaves() {
    this.isLoading = true;
    this.rowData = [];
    this.service.post("fetch/companyleave", { company_id: this.selectedCompanyId }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.rowData = res.data.map((item: any) => ({
          leave_name: item.leave_name,
          year_code: item.year_code,
          leave_count: item.leave_count,
          leave_carryforwad: item.leave_carryforwad,
          max_carry_forward: item.max_carry_forward,
        }));
      }
      this.isLoading = false;
    },
      (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          // this.toastr.warning('Data Not Found');
          this.isLoading = false;
        } else {
          console.error(error);
          this.isLoading = false;
        }
      }
    );
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
  // getting company name
  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data;

        if (this.CompanyNames.length > 0) {
          // If no valid company selected yet (or it's "all"), pick the first one
          const defaultCompany = (this.selectedCompanyId && this.selectedCompanyId !== 'all')
            ? this.CompanyNames.find((c: any) => c.company_id == this.selectedCompanyId) ?? this.CompanyNames[0]
            : this.CompanyNames[0];

          this.selectedCompanyId = defaultCompany.company_id;
          this.service.setCompanyId(this.selectedCompanyId);

          this.getAllLeaves(); // fire only after we have a real company_id
        }
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
          this.modalService.closeModal();
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
    this.LeaveRule.markAllAsTouched();

    if (this.LeaveRule.valid) {

      const formData = this.LeaveRule.value;

      const payload = {
        company_id: formData.companyid,
        leave_type_id: formData.leavetype,
        leave_count: formData.leavenumber,
        fy_id: this.financialYearId,
        leave_carryforwad: formData.carry_forward,
        // getRawValue() gets value even if control is disabled
        max_carry_forward: this.LeaveRule.getRawValue().max_carry_forward
      };

      this.service.post('create/leave', payload).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.toastr.success('Leave Rule Added Successfully!');
            this.LeaveRule.reset();
            this.isSubmitted = false;
            this.modalService.closeModal();
            this.getAllLeaves();
          }
        },
        (error) => {
          if (error.status === 409) {
            this.toastr.warning(error.error.message);
          } else {
            this.toastr.error('Something went wrong!');
          }
        }
      );
    }
  }

  openEditModal(id: any) {
    this.service.post("fetch/leave", { leave_id: id }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          const data = res.data;

          this.leaveId = data.leave_id;
          this.companyId = data.company_id;

          this.EditLeaveRule.patchValue({
            leavetype: data.leave_type_id,                 // leave_type_id
            year: data.year,
            leavenumber: data.leave_count,
            carry_forward: data.leave_carryforwad || 'FALSE'
          });
        }
      },
      (error) => {
        console.error('Error fetching leave request:', error);
        this.toastr.error('Failed to fetch leave details.');
      }
    );
  }

  editLeaveData() {
    this.isEditSubmitted = true;

    if (this.EditLeaveRule.valid) {
      const payload = {
        leave_id: this.leaveId,
        company_id: this.companyId,
        leave_type_id: this.EditLeaveRule.value.leavetype,
        leave_name: this.EditLeaveRule.value.leavename,
        leave_count: this.EditLeaveRule.value.leavenumber,
        leave_carryforwad: this.EditLeaveRule.value.carry_forward
      };

      this.service.post("update/leave", payload).subscribe(
        (res: any) => {
          this.toastr.success(res.message);
          this.modalService.closeModal();
          this.getAllLeaves();
        },
        (error) => {
          if (error.status === 409) {
            this.toastr.warning(error.error.message);
          } else {
            this.toastr.error('Something went wrong!');
          }
        }
      );
    } else {
      this.EditLeaveRule.markAllAsTouched();
      this.toastr.error('Invalid inputs!');
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

  allowOnlyLetters(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[A-Za-z ]+$/;

    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  addleaveWithoutPay() {
    const value = this.lwpForm.value.leave_without_pay;

    if (value === null) {
      this.toastr.error('Please select Yes or No');
      return;
    }

    const payload = {
      leave_without_pay: value
    };

    this.service.post('leave/save_lwp', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('LWP setting saved successfully');
          this.modalService.closeModal();
        }
      }
    });
  }

  getLeaveWithoutPay() {
    this.service.post('leave/get_lwp', {}).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {

          const lwp = res.data.find(
            (x: any) => x.lwp_type === 'leave_without_pay'
          );

          if (lwp) {
            this.lwpForm.patchValue({
              leave_without_pay: lwp.lwp_value === 1
            });
          }
        }
      },
      error: () => {
        this.toastr.error('Failed to load Leave Without Pay setting');
      }
    });
  }

  getRunningFinancialYear() {
    this.service.post('fetch/financialyear', {}).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.financialYear = res.data;
          this.financialYearCode = res.data.fy_code;
          this.financialYearId = res.data.fy_id;

          this.LeaveRule.patchValue({
            year: this.financialYearCode
          });

          this.EditLeaveRule.patchValue({
            year: this.financialYearCode
          });
        }
      },
      (error) => {
        console.error('Failed to fetch financial year', error);
        this.toastr.error('Unable to fetch financial year');
      }
    );
  }

}
