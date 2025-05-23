import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
declare var bootstrap: any;
@Component({
  selector: 'app-leave-setup',
  templateUrl: './leave-setup.component.html',
  styleUrls: ['./leave-setup.component.css']
})
export class LeaveSetupComponent {
  // today: string = '';ta
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
  CompanyNames: any;
  selectedCompanyId: any = 1;
  toastr: any;

  constructor(private fb: FormBuilder, private service: HrmserviceService) {
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

      companyid: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/)  // only digits allowed (CompanyID is numeric)
      ]],

      leavenumber: ['', [
        Validators.required,
        Validators.max(20),
        Validators.pattern(/^\d+$/)  // only digits
      ]],
      leavename: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[A-Za-z ]+$/),  // letters and spaces only
        this.noWhitespaceValidator
      ]],
      leavetype: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        this.noWhitespaceValidator
      ]]
    });

    this.EditLeaveRule = this.fb.group({
      leavenumber: ['', [
        Validators.required,
        Validators.max(30),
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
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.getCompanyData();
    this.getleaveData(this.selectedValue);
    this.getCompanyNames();
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);
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
        this.CompanyNames = res.Data
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
        "leave_count": this.LeaveRule.value.leavenumber
      }


      this.service.post("create/leave", current_data).subscribe((res) => {
        this.toastr.success('Leave Rule Added !');
        this.getleaveData(this.LeaveRule.value.companyid)
        this.closeAllModals();
      });

      console.log(this.LeaveRule.value);
      this.LeaveRule.reset();

    } else {
      this.LeaveRule.markAllAsTouched();

    }

  }

  openEditModal(leave: any) {
    console.log(leave); // Check if leave.LeaveID exists

    if (leave.LeaveID) {
      this.EditLeaveRule.patchValue({
        leavenumber: leave.NoOfLeave,
        leavename: leave.LeaveName,
        leavetype: leave.LeaveType,
      });
      this.selectedLeaveID = leave.LeaveID;
      // Pass LeaveID to editData function
      // this.editData(leave.LeaveID);
    } else {
      console.error('LeaveID is undefined!');
    }
  }

  editLeaveData(LeaveID: any) {
    // Check if LeaveID is defined
    if (!LeaveID) {
      console.error('LeaveID is not defined!');
      return;
    }

    this.isEditSubmitted = true;
    if (this.EditLeaveRule.valid) {

      let current_data: any = {
        "CompanyID": 1,
        "LeaveType": this.EditLeaveRule.value.leavetype,
        "LeaveName": this.EditLeaveRule.value.leavename,
        "NoOfLeave": this.EditLeaveRule.value.leavenumber,
        "IsCarryForward": "Yes"
      };

      console.log('Form Data:', current_data);  // Log to verify form data

      // Make the PUT request with LeaveID
      this.service.put(`updateleavesetup/${LeaveID}`, current_data).subscribe(
        (res: any) => {
          console.log('Response:', res);
          this.toastr.success('Data updated successfully!');
          this.closeAllModals();
        },
        (error) => {
          console.error('Error:', error);
          this.toastr.error('Error updating data!');
        }
      );
    } else {
      this.EditLeaveRule.markAllAsTouched();
      this.toastr.error('Invalid Credentials!');
      // this.EditLeaveRule.reset();
      this.isEditSubmitted = false;

    }
  }

  deleteLeaveRule(LeaveID: any, CompanyID: any) {
    if (confirm("Are you sure?")) {
      this.service.delete(`deleteleavesetup/${LeaveID}`).subscribe(
        (res) => {
          console.log(res);
          this.toastr.success("Data deleted successfully !")
          this.getleaveData(CompanyID);
        },
        (err) => {
          console.error(err);
          alert("Error deleting data");
        }
      );
    }
  }
}
