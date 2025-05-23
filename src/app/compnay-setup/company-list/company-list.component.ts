import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
declare var bootstrap: any;
@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent {

  today = new Date().toISOString().split('T')[0];
  title: String = "Company Demo";
  CompanyDetails: any = [];
  MasterCompanyNames: any = [];
  leaveData: any[] = [];
  selectedValue: any = "1"; // Default selected1
  activeTab: string = 'tab1';
  selectedLeaveID: any;
  valData: any;
  companyForm: FormGroup;
  EditcompanyForm : FormGroup;
  readonly NoWhitespaceRegExp: RegExp = new RegExp("\\S");
  Companydata: any = {};
  selectedLogoFile: any;
  isSubmitted = false;
  isEditSubmitted = false;
  selectedId: any;
  textInputControl: any;




  constructor(private router: Router, private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      companyLogo: ['', Validators.required],
      radioChoice: ['yes', Validators.required],
      masterCompanyList: [{ value: '', disabled: true, }, Validators.required],
      IncorporationDate: ['', Validators.required],
      companyDescription: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9,\s]+$/)]],
      companyAddress: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9,\s]+$/)]],
    });
    this.EditcompanyForm = this.fb.group({
      // Company Name: Only letters, numbers, spaces, dots, and ampersands (e.g., TCS, Infosys Ltd., H&M)
      EditcompanyName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]{2,}$/),
          Validators.pattern(this.NoWhitespaceRegExp)
        ]
      ],

      // Company Logo: Required (file/image input)
      EditcompanyLogo: [null, Validators.required],
      EditcompanyAddress: ['', Validators.required],
      EditmasterCompanyList: [{ value: '', disabled: true,},Validators.required],
      radioChoice: ['yes'],

      EditcompanyDescription: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]{2,}$/)
        ]
      ],

      // Incorporation Date: Required (can use custom date validator for past dates only)
      EditIncorporationDate: ['', Validators.required, Validators.max]
    });

    this.companyForm.get('radioChoice')?.valueChanges.subscribe(value => {
      this.textInputControl = this.companyForm.get('masterCompanyList');
      if (value === 'yes') {
        this.textInputControl?.disable();
      } else {
        this.textInputControl?.enable();
      }
    });
  }
  CompanyNameList = [
    {
      name:'hrishikesh',
    },
    {
      name:'Onkar',
    },
    {
      name:'sonal',
    },
    {
      name:'Shivani',
    },
  ]
  ngOnInit() {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.getCompanyData();
    this.getCompanyNames();
  }

  onMasterCompanyChange(event: Event): void {
    this.selectedId = (event.target as HTMLSelectElement).value;
    console.log('Selected Master Company ID:', this.selectedId);
  }

  noWhitespaceValidator(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }


  getCompanyData() {
    this.service.post("fetch/company", {}).subscribe((res: any) => {
      this.CompanyDetails = res.Data;
    });
  }

  getCompanyNames() {
    this.service.post('master-companies', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.MasterCompanyNames = res.Data
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
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

  // addCompany() {
  //   this.isSubmitted = true;
  //   if (this.companyForm.valid) {

  //     if (!this.selectedLogoFile) {
  //       this.toastr.error('Please select a company logo!');
  //       return;
  //     }

  //     const current_data: any = {
  //       ParentCompanyID: 1,
  //       CompanyName: this.companyForm.value.companyName,
  //       CompanyLocation: "Pune",
  //       TaxRuleID: 1,
  //       SettingID: 1,
  //       CompanyDescription: this.companyForm.value.companyDescription,
  //       CompanyLogo: this.selectedLogoFile.name,
  //       IncorporationDate: this.companyForm.value.IncorporationDate
  //     };

  //     console.log("Company Data: ", current_data);

  //     this.service.post("/addcompany", current_data).subscribe({
  //       next: (res) => {
  //         this.toastr.success('Form Submitted Successfully!');
  //         this.closeAllModals();
  //         this.getCompanyData();
  //         this.companyForm.reset(); // reset only after success
  //         this.selectedLogoFile = null;
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.toastr.error('Failed to add company.');
  //       }
  //     });

  //   } else {
  //     this.toastr.error('Please fill all required fields !');
  //     console.log(this.companyForm.value);
  //   }
  // }
redirect(){
    this.router.navigate(['/authPanal/CompanyDashboard/'])
  }

  addCompany() {
    this.isSubmitted = true;
    if (this.textInputControl == 'yes') {
      if (this.companyForm.valid && this.selectedLogoFile) {
        const current_data = {
          master_id: this.selectedId,
          company_name: this.companyForm.value.companyName,
          tax_id: this.selectedId,
          payroll_id: this.selectedId,
          company_desc: this.companyForm.value.companyDescription,
          company_location: this.companyForm.value.companyAddress,
          company_logo: this.selectedLogoFile.name,
          company_founded: this.companyForm.value.IncorporationDate,
        };

        console.log("Company Data to Submit:", current_data);

        this.service.post("create/company", current_data).subscribe({
          next: (res) => {
            this.toastr.success('Form Submitted Successfully!');
            this.closeAllModals();
            this.getCompanyData();
            this.companyForm.reset();
            this.isSubmitted = false;
            this.selectedLogoFile = null;
          },
          error: (err) => {
            console.error("API Error:", err);
            this.toastr.error('Failed to add company.');
          }
        });
      } else {
        if (!this.selectedLogoFile) {
          this.toastr.error('Please select a company logo!');
        }

        const invalidControls = Object.keys(this.companyForm.controls).filter(control =>
          this.companyForm.get(control)?.invalid
        );

        console.warn("Invalid Fields:", invalidControls);
        this.toastr.error('Please fill all required fields correctly!');
      }
    }
    else {
      if (this.companyForm.valid && this.selectedLogoFile) {
        const current_data = {
          master_company_name: this.companyForm.value.companyName,
          company_initials: "xyz",
        };

        console.log("Company Data to Submit:", current_data);

        this.service.post("create/master-companie", current_data).subscribe({
          next: (res) => {
            this.toastr.success('Form Submitted Successfully!');
            this.closeAllModals();
            this.getCompanyData();
            this.companyForm.reset();
            this.isSubmitted = false;
            this.selectedLogoFile = null;
          },
          error: (err) => {
            console.error("API Error:", err);
            this.toastr.error('Failed to add company.');
          }
        });
      }
      console.log("Form Values on Submit Attempt:", this.companyForm.value);


    }

  }}
