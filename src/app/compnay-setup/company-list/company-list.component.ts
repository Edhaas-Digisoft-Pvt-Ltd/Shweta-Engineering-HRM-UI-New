import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ModalServiceService } from 'src/app/modal-service.service';
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
  EditcompanyForm: FormGroup;
  readonly NoWhitespaceRegExp: RegExp = new RegExp("\\S");
  Companydata: any = {};
  selectedLogoFile: any;
  isSubmitted = false;
  isEditSubmitted = false;
  selectedId: any;
  textInputControl: any;
  rowData: any = [];
  columnDefs: ColDef[] = [];
  gridApiActive: any;
  selectedCompany: any = null;
  existingLogoUrl: string | null = null;
  removeExistingLogo = false;

  constructor(private router: Router, private fb: FormBuilder, private service: HrmserviceService, private modalService: ModalServiceService, private toastr: ToastrService) {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      companyLogo: ['', Validators.required],
      radioChoice: ['no', Validators.required],
      masterCompanyList: ['', Validators.required],
      // masterCompanyList: [{ value: '', disabled: true, }, Validators.required],
      IncorporationDate: ['', Validators.required],
      companyDescription: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9,\s]+$/)]],
      companyAddress: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9,\s]+$/)]],
    });

    this.EditcompanyForm = this.fb.group({
      EditcompanyName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]{2,}$/),
          Validators.pattern(this.NoWhitespaceRegExp)
        ]
      ],
      EditcompanyAddress: ['', Validators.required],
      EditmasterCompanyList: ['', Validators.required],
      radioChoice: ['yes'],
      EditcompanyDescription: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]{2,}$/)
        ]
      ],
      EditIncorporationDate: ['', Validators.required]
    });

    // this.companyForm.get('radioChoice')?.valueChanges.subscribe(value => {
    //   this.textInputControl = this.companyForm.get('masterCompanyList');
    //   if (value === 'yes') {
    //     this.textInputControl?.disable();
    //   } else {
    //     this.textInputControl?.enable();
    //   }
    // });
  }
  CompanyNameList = [
    {
      name: 'hrishikesh',
    },
    {
      name: 'Onkar',
    },
    {
      name: 'sonal',
    },
    {
      name: 'Shivani',
    },
  ]
  ngOnInit() {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.getCompanyData();
    this.getCompanyNames();
    this.initializeCompanyColumns();
  }

  initializeCompanyColumns() {
    this.columnDefs = [
      // {
      //   headerName: 'Logo',
      //   field: 'company_logo_url',
      //   cellRenderer: (params: any) => {
      //     if (!params.value) return '';
      //     return `<img src="${params.value}" style="height:40px;width:40px;border-radius:5px;" />`;
      //   },
      //   maxWidth: 100
      // },
      {
        headerName: 'Company Name',
        field: 'company_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Description',
        field: 'company_desc',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Location',
        field: 'company_location',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Founded',
        field: 'company_founded',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Action',
        field: 'action',
        sortable: false,
        filter: false,
        editable: false,
        suppressMovable: true,
        maxWidth: 120,
        cellRenderer: (params: any) => {
          const wrapper = document.createElement('div');
          wrapper.classList.add('d-flex', 'gap-2', 'align-items-center', 'h-100');

          const editBtn = document.createElement('button');
          editBtn.type = 'button';
          editBtn.classList.add('btn', 'btn-sm', 'action-btn-grid', 'edit-btn-grid', 'me-2');
          editBtn.style.backgroundColor = '#C8E3FF';
          editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
          editBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.onEditCompany(params.data);
          });

          wrapper.appendChild(editBtn);
          return wrapper;
        }
      }
    ];
  }

  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  openModal() {
    this.modalService.openModal('exampleModal')
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
      if (res.status === 'success') {
        this.rowData = res.data;
      }
    });
  }

  getCompanyNames() {
    this.service.post('master-companies', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.MasterCompanyNames = res.Data;
        // Auto-select first master company
        if (this.MasterCompanyNames?.length > 0) {
          const firstId = this.MasterCompanyNames[0].master_id;
          this.selectedId = firstId;
          this.companyForm.patchValue({ masterCompanyList: firstId });
        }
      }
    }, (error) => {
      console.error('Error fetching companies:', error);
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
  redirect() {
    this.router.navigate(['/authPanal/CompanyDashboard/'])
  }

  addCompany() {
    this.isSubmitted = true;

    const isMaster = this.companyForm.value.radioChoice === 'yes';

    if (this.companyForm.invalid) {
      this.toastr.error('Please fill all required fields correctly!');
      return;
    }

    if (!this.selectedLogoFile) {
      this.toastr.error('Please select a company logo!');
      return;
    }

    const formData = new FormData();

    if (!isMaster) {
      formData.append('master_id', this.selectedId);
      formData.append('tax_id', this.selectedId);
      formData.append('payroll_id', this.selectedId);
      formData.append('company_name', this.companyForm.value.companyName);
      formData.append('company_desc', this.companyForm.value.companyDescription);
      formData.append('company_location', this.companyForm.value.companyAddress);
      formData.append('company_founded', this.companyForm.value.IncorporationDate);
      formData.append('company_logo', this.selectedLogoFile);
    } else {
      formData.append('master_company_name', this.companyForm.value.companyName);
      const initials = this.generateCompanyInitials(this.companyForm.value.companyName);
      formData.append('company_initials', initials);
      formData.append('company_logo', this.selectedLogoFile);
    }

    const url = isMaster ? "create/master-companie" : "create/company";

    this.service.post(url, formData).subscribe({
      next: (res) => {
        this.toastr.success('Form Submitted Successfully!');
        this.modalService.closeModal();
        this.getCompanyData();
        this.getCompanyNames();
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

  resetCompanyForm() {
    this.companyForm.reset({
      companyName: '',
      companyLogo: '',
      radioChoice: 'yes',
      masterCompanyList: { value: '', disabled: true },
      IncorporationDate: '',
      companyDescription: '',
      companyAddress: ''
    });
    this.companyForm.get('masterCompanyList')?.disable();
  }

  generateCompanyInitials(name: string): string {
    if (!name) return '';

    const words = name.trim().split(/\s+/);

    const initials = words
      .map(word => word[0])
      .filter(char => /[A-Za-z]/.test(char))
      .join('')
      .toUpperCase();

    return initials;
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[A-Za-z ]+$/;

    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  blockPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text') || '';
    if (!/^[A-Za-z ]+$/.test(pasteData)) {
      event.preventDefault();
    }
  }

  allowNumbersCharacters(event: KeyboardEvent) {
    const char = event.key;
    const pattern = /^[A-Za-z0-9 ]$/;

    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  onEditCompany(company: any) {
    this.selectedCompany = company;
    this.selectedId = company.master_id;
    this.selectedLogoFile = null;
    this.removeExistingLogo = false;
    this.existingLogoUrl = company.company_logo_url || null;

    this.EditcompanyForm.patchValue({
      EditcompanyName: company.company_name,
      EditcompanyAddress: company.company_location,
      EditcompanyDescription: company.company_desc,
      EditIncorporationDate: company.company_founded,
      EditmasterCompanyList: company.master_id
    });

    const modalEl = document.getElementById('EditCompanyDetails');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  onDeleteExistingLogo(): void {
    this.removeExistingLogo = true;
    this.existingLogoUrl = null;
  }

  onEditFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
    }
  }

  onEditMasterCompanyChange(event: Event): void {
    this.selectedId = (event.target as HTMLSelectElement).value;
  }

  updateCompany() {
    this.isEditSubmitted = true;

    if (this.EditcompanyForm.invalid) {
      this.toastr.error('Please fill all required fields correctly!');
      return;
    }

    const id = this.selectedCompany?.company_id ?? this.selectedCompany?.id;
    if (!id) {
      this.toastr.error('Could not determine which company to update.');
      return;
    }

    // If user deleted the old logo but didn't pick a new one, block submit
    if (this.removeExistingLogo && !this.selectedLogoFile) {
      this.toastr.error('Please upload a new logo or keep the existing one.');
      return;
    }

    const formData = new FormData();
    formData.append('master_id', this.EditcompanyForm.value.EditmasterCompanyList);
    formData.append('company_name', this.EditcompanyForm.value.EditcompanyName);
    formData.append('company_desc', this.EditcompanyForm.value.EditcompanyDescription);
    formData.append('company_location', this.EditcompanyForm.value.EditcompanyAddress);
    formData.append('company_founded', this.EditcompanyForm.value.EditIncorporationDate);

    if (this.selectedLogoFile) {
      formData.append('company_logo', this.selectedLogoFile);
    }
    // if neither removed nor a new file picked, we simply don't send company_logo,
    // so backend leaves the existing one untouched

    this.service.post(`update/company/${id}`, formData).subscribe({
      next: (res) => {
        this.toastr.success('Company updated successfully!');
        this.closeAllModals();
        this.getCompanyData();
        this.isEditSubmitted = false;
        this.selectedCompany = null;
        this.selectedLogoFile = null;
        this.removeExistingLogo = false;
        this.existingLogoUrl = null;
      },
      error: (err) => {
        console.error('Update Error:', err);
        this.toastr.error('Failed to update company.');
      }
    });
  }
}
