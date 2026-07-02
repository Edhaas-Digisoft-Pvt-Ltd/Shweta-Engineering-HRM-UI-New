import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-update-employee',
  templateUrl: './update-employee.component.html',
  styleUrls: ['./update-employee.component.css']
})
export class UpdateEmployeeComponent {

  CompanyNames: any = [];
  roles: any;
  selectedCompanyId: any = 1;
  multiStepForm: FormGroup;
  currentStep: number = 1;
  basic_salary = 0;
  house_rent_allowances = 0;
  conveyance_allowances = 0;
  medical_allowances = 0;
  special_allowances = 0;
  annual_gross_salary = 0;
  monthly_gross_salary = 0;
  value: number = 0;
  amount: number = 0;
  pf: number = 0;
  pt: number = 0;
  esi: number = 0;
  epf: number = 0;
  eesi: number = 0;
  ruleAmount: number = 0;
  salaryAmount: number = 0;
  departmentNames: any;
  designationNames: any;
  nextCheck: any = false;
  salaryComponents: { [key: string]: number } = {};
  salaryStructureForm: any;
  statutoryInfo: string[] = [];
  selectedStatutoryOptions: any[] = [];
  readonly NoWhitespaceRegExp: RegExp = new RegExp('\\S');
  salaryAmountChange: any;
  ctcChange: any;
  lwf: number = 0;
  isLoading: boolean = false;

  // new for update
  employe_id: any;
  fetchedEmployee: any = null;
  isIncrementDue: boolean = false;
  isIncrementChecked: boolean = false;

  //Document 
  docUploads: {
    [key: string]: {
      file: File | null;
      preview: string | null;
      error: string;
      uploading: boolean;
      uploaded: boolean;
      doc_id: number | null;
      existing: { doc_id: number; original_name: string; mime_type: string } | null;
      deleting: boolean;
      pendingDelete: boolean; // NEW
    }
  } = {
      aadhaar: { file: null, preview: null, error: '', uploading: false, uploaded: false, doc_id: null, existing: null, deleting: false, pendingDelete: false },
      pan_card: { file: null, preview: null, error: '', uploading: false, uploaded: false, doc_id: null, existing: null, deleting: false, pendingDelete: false },
      qr_code:  { file: null, preview: null, error: '', uploading: false, uploaded: false, doc_id: null, existing: null, deleting: false, pendingDelete: false }, 
    };

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private service: HrmserviceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.multiStepForm = this.fb.group({
      title: ['', Validators.required],
      emp_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z ]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email, this.gmailValidator]],
      address: ['', Validators.required],
      contact: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      gender: ['', Validators.required],
      company: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      join_date: ['', Validators.required],
      // work_pattern: ['', Validators.required],
      account_holder_name: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      bankName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      accountNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.minLength(9),
          Validators.maxLength(18),
        ],
      ],
      aadhaarNumber: [
        '',
        [Validators.required, Validators.pattern(/^[2-9]\d{3}\s?\d{4}\s?\d{4}\s*$/)],
      ],
      panNumber: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      ],
      ifsc: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
      ],
      transfer_type: [
        '',
        [Validators.required],
      ],
      basic_salary: [0, [Validators.required, Validators.min(1)]],
      house_rent_allowances: [0, [Validators.min(0)]],
      conveyance_allowances: [0, [Validators.min(0)]],
      medical_allowances: [0, [Validators.min(0)]],
      special_allowances: [0, [Validators.min(0)]],
      annual_gross_salary: [0, [Validators.min(0)]],
      monthly_gross_salary: [0, [Validators.min(0)]],
      salary: [0, [Validators.min(0)]],
      pf_employee_applicable: [false],
      pf_employer_applicable: [false],
      esic_employee_applicable: [false],
      status: ['Active', Validators.required],
    });

    this.salaryStructureForm = this.fb.group({
      salaryComponents: this.fb.group({}),
    });

    // read query param id (Option A)
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.employe_id = params['id'];
      }
    });
  }

  ngOnInit() {
    this.multiStepForm.get('annual_gross_salary')?.valueChanges.subscribe((value) => {
      this.annual_gross_salary = value;
    });
    this.getCompanyNames();
    this.getRoles();

    if (this.employe_id) {
      this.fetchEmployee();
    }

    this.multiStepForm.valueChanges.subscribe(values => {
      this.calculateGrossSalary(values);
    });
  }

  gmailValidator(control: any) {
    const value = control.value;
    if (value && !value.endsWith('@gmail.com')) {
      return { notGmail: true };
    }
    return null;
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data;
        // if we already fetched employee and it has company_id, set selected and load deps
        if (this.fetchedEmployee) {
          this.selectedCompanyId = this.fetchedEmployee.company_id;
          this.multiStepForm.patchValue({ company: this.selectedCompanyId }, { emitEvent: false });
          this.getDepartmentNames();
          this.getDesignationNames();
        }
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  getRoles() {
    this.service.post('fetch/roles', {}).subscribe((res: any) => {
      try {
        if (res.status == "success") {
          this.roles = res.data
        }
      } catch (error) {
        console.log(error);
      }
    })
  }

  getDepartmentNames() {
    this.service.post('fetch/department', { company_id: this.selectedCompanyId }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.departmentNames = res.data;
        }
      },
      (error) => {
        console.error('Error fetching department:', error);
        if (error.status == 400) {
          this.toastr.error('Department Not Available !');
          this.departmentNames = [];
        }
      }
    );
  }

  getDesignationNames() {
    this.service.post('fetch/designation', { company_id: this.selectedCompanyId }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.designationNames = res.data;
        }
      },
      (error) => {
        console.error('Error fetching designation:', error);
        if (error.status === 400) {
          this.toastr.error('Designation Not Available !');
          this.designationNames = [];
        }
      }
    );
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.getDepartmentNames();
    this.getDesignationNames();
  }

  fetchEmployee() {
    if (!this.employe_id) return;

    this.service.post('single/employee', { employe_id: this.employe_id }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.fetchedEmployee = res.data.employee;
          this.isIncrementDue = res.data.is_increment_due ?? false;
          this.isIncrementChecked = this.isIncrementDue;

          if (this.fetchedEmployee.company_id) {
            this.selectedCompanyId = this.fetchedEmployee.company_id;
            this.getDepartmentNames();
            this.getDesignationNames();
            this.multiStepForm.patchValue({ company: this.selectedCompanyId }, { emitEvent: false });
          }
          const fullName = this.fetchedEmployee.emp_name || '';

          this.multiStepForm.patchValue({
            title: this.fetchedEmployee.emp_title || '',
            emp_name: this.fetchedEmployee.emp_name || '',
            email: this.fetchedEmployee.emp_email || '',
            address: this.fetchedEmployee.emp_address || '',
            contact: this.fetchedEmployee.emp_contact || '',
            gender: this.fetchedEmployee.emp_gender || '',
            role: this.fetchedEmployee.role_id || '',
            department: this.fetchedEmployee.department_id || '',
            designation: this.fetchedEmployee.designation_id || '',
            join_date: this.fetchedEmployee.doj || '',
            // work_pattern: this.fetchedEmployee.work_pattern || '',
            account_holder_name: this.fetchedEmployee.account_holder_name || '',
            bankName: this.fetchedEmployee.bank_name || '',
            accountNumber: this.fetchedEmployee.account_num || '',
            aadhaarNumber: this.fetchedEmployee.aadhaar_number || '',
            panNumber: this.fetchedEmployee.pan_number || '',
            ifsc: this.fetchedEmployee.ifsc_code || '',
            transfer_type: this.fetchedEmployee.transfer_type || '',
            basic_salary: this.fetchedEmployee.basic_salary ?? 0,
            house_rent_allowances: this.fetchedEmployee.house_rent_allowances ?? 0,
            conveyance_allowances: this.fetchedEmployee.conveyance_allowances ?? 0,
            medical_allowances: this.fetchedEmployee.medical_allowances ?? 0,
            special_allowances: this.fetchedEmployee.special_allowances ?? 0,
            annual_gross_salary: parseFloat(this.fetchedEmployee.annual_gross_salary) || 0,
            monthly_gross_salary: parseFloat(this.fetchedEmployee.monthly_gross_salary) || 0,
            pf_employee_applicable: !!this.fetchedEmployee.pf_employee_applicable,
            pf_employer_applicable: !!this.fetchedEmployee.pf_employer_applicable,
            esic_employee_applicable: !!this.fetchedEmployee.esic_employee_applicable,
            status: this.fetchedEmployee.status,
          }, { emitEvent: false });

          // ['fname', 'lname', 'address', 'contact', 'role'].forEach(field => {
          //   this.multiStepForm.get(field)?.disable();
          // });

          // update component salary vars
          this.annual_gross_salary = parseFloat(this.fetchedEmployee.annual_gross_salary) || 0;
          this.monthly_gross_salary = parseFloat(this.fetchedEmployee.monthly_gross_salary) || 0;
          // inside fetchEmployee() next callback, after the patchValue block:
          this.fetchEmployeeDocs();
        } else {
          this.toastr.error('Unable to fetch employee data');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error(err.error?.data || err.error?.message || 'Something went wrong!');
      }
    });
  }

  nextStep() {
    if (this.currentStep < 6) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return (
          this.multiStepForm.controls['title'].valid &&
          this.multiStepForm.controls['emp_name'].valid &&
          this.multiStepForm.controls['email'].valid &&
          this.multiStepForm.controls['contact'].valid &&
          this.multiStepForm.controls['address'].valid &&
          this.multiStepForm.controls['gender'].valid &&
          this.multiStepForm.controls['status'].valid
        );
      case 2:
        return (
          this.multiStepForm.controls['role'].valid &&
          this.multiStepForm.controls['department'].valid &&
          this.multiStepForm.controls['designation'].valid &&
          this.multiStepForm.controls['join_date'].valid
          // this.multiStepForm.controls['work_pattern'].valid
        );
      case 3:
        return (
          this.multiStepForm.controls['account_holder_name'].valid &&
          this.multiStepForm.controls['bankName'].valid &&
          this.multiStepForm.controls['accountNumber'].valid &&
          this.multiStepForm.controls['aadhaarNumber'].valid &&
          this.multiStepForm.controls['panNumber'].valid &&
          this.multiStepForm.controls['ifsc'].valid &&
          this.multiStepForm.controls['transfer_type'].valid
        );
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }

  showStatutoryValues(): void {
    const values = this.multiStepForm.getRawValue();
    let message = 'Statutory Values:\n';
    for (const key of this.statutoryInfo) {
      message += `${key}: ${values[key] ?? 0}\n`;
    }
    alert(message);
  }

  onSubmit() {
    if (!this.multiStepForm.valid) {
      Object.keys(this.multiStepForm.controls).forEach(key => {
        if (this.multiStepForm.controls[key].invalid) {
          this.toastr.error(`${key.replace(/_/g, ' ')} is invalid or required`);
        }
      });
      this.multiStepForm.markAllAsTouched();
      return;
    }

    this.isLoading = true

    let formValues = this.multiStepForm.getRawValue();

    let payload = {
      "employee_id": this.employe_id,
      "company_id": this.selectedCompanyId,
      "emp_title": formValues.title,
      "emp_name": formValues.emp_name,
      "emp_email": formValues.email,
      "emp_gender": formValues.gender,
      "department_id": formValues.department,
      "designation_id": formValues.designation,
      "bank_name": formValues.bankName,
      "account_holder_name": formValues.account_holder_name,
      "account_num": formValues.accountNumber,
      "transfer_type": formValues.transfer_type,
      "aadhaar_number": (formValues.aadhaarNumber || '').toString().replace(/\s/g, ''),
      "pan_number": formValues.panNumber,
      "ifsc_code": formValues.ifsc,
      "doj": formValues.join_date,
      "emp_contact": formValues.contact,
      "emp_address": formValues.address,
      "role_id": formValues.role,

      "basic_salary": formValues.basic_salary,
      "house_rent_allowances": formValues.house_rent_allowances || 0,
      "conveyance_allowances": formValues.conveyance_allowances || 0,
      "medical_allowances": formValues.medical_allowances || 0,
      "special_allowances": formValues.special_allowances || 0,

      "annual_gross_salary": parseFloat(this.annual_gross_salary.toFixed(2)),
      "monthly_gross_salary": parseFloat(this.monthly_gross_salary.toFixed(2)),

      "pf_employee_applicable": formValues.pf_employee_applicable || false,
      "pf_employer_applicable": formValues.pf_employer_applicable || false,
      "esic_employee_applicable": formValues.esic_employee_applicable || false,
      "status": formValues.status,
      "is_increment": this.isIncrementChecked,
      "created_by": sessionStorage.getItem('employeeId') ?? null,
    };

    this.service.post("update/employee", payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Successfully Updated!');
          if (res.shopfloor_warning) {
            this.toastr.warning(res.shopfloor_warning, 'Shopfloor Sync Warning', { timeOut: 8000 });
          }
          this.handleDocOperations();
          // this.router.navigate(['/authPanal/Employee']);
          // this.isLoading = false;
        } else {
          this.toastr.error('Update failed!');
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.data || err.error?.message || 'Something went wrong!');
        this.isLoading = false;
      }
    });
  }

  calculateGrossSalary(values: any) {
    const total =
      Number(values.basic_salary || 0) +
      Number(values.house_rent_allowances || 0) +
      Number(values.conveyance_allowances || 0) +
      Number(values.medical_allowances || 0) +
      Number(values.special_allowances || 0);

    const annual = total;
    const monthly = total / 12;

    this.annual_gross_salary = annual;
    this.monthly_gross_salary = monthly;

    this.multiStepForm.patchValue({
      annual_gross_salary: annual,
      monthly_gross_salary: monthly,
    }, { emitEvent: false });
  }

  logTotalDeductions() {
    const total = this.selectedStatutoryOptions.reduce((sum, field) => {
      return sum + Number(field.value || 0);
    }, 0);
    return total;
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[A-Za-z]+$/;
    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  allowOnlyLettersAndSpace(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[A-Za-z\s]+$/;
    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[0-9]*$/;
    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbersAndSpace(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[0-9 ]*$/;
    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  allowNumbersCharacters(event: KeyboardEvent) {
    const char = event.key;
    const pattern = /^[A-Za-z0-9]$/;
    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  blockPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text') || '';
    if (!/^[A-Za-z]+$/.test(pasteData)) {
      event.preventDefault();
    }
  }

  formatAadhaar(event: any) {
    let input = event.target.value;
    let digits = input.replace(/\D/g, '');
    if (digits.length > 12) {
      digits = digits.substring(0, 12);
    }
    if (digits.length > 8) {
      digits = digits.replace(/(\d{4})(\d{4})(\d+)/, '$1 $2 $3');
    } else if (digits.length > 4) {
      digits = digits.replace(/(\d{4})(\d+)/, '$1 $2');
    }
    this.multiStepForm.get('aadhaarNumber')?.setValue(digits, { emitEvent: false });
  }

  formatPAN(event: any) {
    let value = event.target.value;
    value = value.replace(/[^a-zA-Z0-9]/g, '');
    value = value.toUpperCase();
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    this.multiStepForm.get('panNumber')?.setValue(value, { emitEvent: false });
  }

  formatIFSC(event: any) {
    let value = event.target.value;
    value = value.replace(/[^a-zA-Z0-9]/g, '');
    value = value.toUpperCase();
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    if (value.length >= 4) {
      const first4 = value.substring(0, 4);
      if (value.length === 5 && value.charAt(4) !== '0') {
        value = first4 + '0' + value.substring(4);
      }
    }
    this.multiStepForm.get('ifsc')?.setValue(value, { emitEvent: false });
  }

  toggleStatus(): void {
    const current = this.multiStepForm.get('status')?.value;
    const newStatus = current === 'Active' ? 'Inactive' : 'Active';
    this.multiStepForm.patchValue({ status: newStatus }, { emitEvent: false });
  }

  cleanEmployeeName(): void {
    const control = this.multiStepForm.get('emp_name');
    if (control) {
      const cleaned = control.value?.trim().replace(/\s+/g, ' ') || '';
      control.setValue(cleaned, { emitEvent: false });
    }
  }

  // Call this inside fetchEmployee() after patchValue, or separately in ngOnInit after employe_id is set
  fetchEmployeeDocs(): void {
    if (!this.employe_id) return;

    this.service.post('fetch/employee-documents', { employe_id: this.employe_id }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          (res.data as any[]).forEach(doc => {
            const slot = this.docUploads[doc.doc_type];
            if (slot) {
              slot.existing = {
                doc_id: doc.doc_id,
                original_name: doc.original_name,
                mime_type: doc.mime_type,
              };
              slot.doc_id = doc.doc_id;
            }
          });
        }
      },
      error: () => { /* silent — docs are optional */ }
    });
  }

  deleteExistingDoc(docType: string): void {
    const slot = this.docUploads[docType];
    if (!slot.existing) return;

    slot.doc_id = slot.existing.doc_id; // preserve for delete API call on submit
    slot.pendingDelete = true;
    slot.existing = null; // hide from UI → upload zone appears
  }

  onDocFileSelected(event: Event, docType: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const slot = this.docUploads[docType];

    slot.error = '';
    slot.uploaded = false;
    slot.doc_id = null;

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      slot.error = 'Only JPG, PNG or PDF allowed.';
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      slot.error = 'File must be under 2MB.';
      input.value = '';
      return;
    }

    slot.file = file;
    slot.preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
  }

  removeDocFile(docType: string): void {
    const slot = this.docUploads[docType];
    if (slot.preview) URL.revokeObjectURL(slot.preview);
    slot.file = null;
    slot.preview = null;
    slot.uploaded = false;
    slot.error = '';
    slot.doc_id = null;
  }

  openExistingDoc(docType: string): void {
    const slot = this.docUploads[docType];
    if (!slot.existing) return;

    const baseUrl = this.service['url'];
    const token = sessionStorage.getItem('AUTH') || '';
    const url = `${baseUrl}view/employee-document/${slot.existing.doc_id}`;

    fetch(url, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch document');
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // clean up after a short delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      })
      .catch(() => {
        this.toastr.error('Could not open document. Please try again.');
      });
  }

  openDocPreview(docType: string): void {
    const slot = this.docUploads[docType];
    if (!slot.file) return;
    const url = URL.createObjectURL(slot.file);
    window.open(url, '_blank');
  }

  uploadSingleDoc(empId: number, docType: string): Observable<any> {
    const slot = this.docUploads[docType];
    if (!slot.file) return of(null);

    const fd = new FormData();
    fd.append('employe_id', String(empId));
    fd.append('doc_type', docType);
    fd.append('document', slot.file, slot.file.name);
    slot.uploading = true;

    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.service['url'] + 'upload/employee-document', true);
      const token = sessionStorage.getItem('AUTH') || '';
      if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

      xhr.onload = () => {
        slot.uploading = false;
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.status === 'success') {
            slot.uploaded = true;
            slot.doc_id = res.data.doc_id;
            observer.next(res);
          } else {
            slot.error = res.data || 'Upload failed.';
            observer.next(null);
          }
        } catch { slot.error = 'Invalid server response.'; observer.next(null); }
        observer.complete();
      };
      xhr.onerror = () => {
        slot.uploading = false;
        slot.error = 'Network error.';
        observer.next(null);
        observer.complete();
      };
      xhr.send(fd);
    });
  }

  handleDocOperations(): void {
    const docTypes = Object.keys(this.docUploads);

    // Build delete observables for pendingDelete slots
    const deleteObs = docTypes
      .filter(t => this.docUploads[t].pendingDelete && this.docUploads[t].doc_id !== null)
      .map(t => this.service.deleteWithAuth(`delete/employee-document/${this.docUploads[t].doc_id}`));

    // Build upload observables for new files
    const uploadObs = docTypes
      .filter(t => this.docUploads[t].file !== null)
      .map(t => this.uploadSingleDoc(this.employe_id, t));

    const allOps = [...deleteObs, ...uploadObs];

    if (allOps.length === 0) {
      // No doc operations needed
      this.toastr.success('Successfully Updated!');
      this.isLoading = false;
      this.router.navigate(['/authPanal/Employee']);
      return;
    }

    forkJoin(allOps).subscribe({
      next: () => {
        this.toastr.success('Successfully Updated!');
        this.isLoading = false;
        this.router.navigate(['/authPanal/Employee']);
      },
      error: () => {
        // Employee was updated but doc ops had issues
        this.toastr.success('Employee updated!');
        this.toastr.warning('Some document operations failed. Please retry from this screen.', 'Doc Warning');
        this.isLoading = false;
        this.router.navigate(['/authPanal/Employee']);
      }
    });
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }
}
