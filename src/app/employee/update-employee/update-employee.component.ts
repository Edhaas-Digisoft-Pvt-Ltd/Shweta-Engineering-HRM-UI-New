import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { ActivatedRoute, Router } from '@angular/router';

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
      fname: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(this.NoWhitespaceRegExp),
          Validators.pattern(/^[A-Za-z]+$/),
        ],
      ],
      lname: [
        '',
        [
          Validators.required,
          Validators.pattern(this.NoWhitespaceRegExp),
          Validators.pattern(/^[A-Za-z]+$/),
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

          if (this.fetchedEmployee.company_id) {
            this.selectedCompanyId = this.fetchedEmployee.company_id;
            this.getDepartmentNames();
            this.getDesignationNames();
            this.multiStepForm.patchValue({ company: this.selectedCompanyId }, { emitEvent: false });
          }

          const fullName = this.fetchedEmployee.emp_name || '';
          const parts = fullName.split(' ');
          const fname = parts.shift() || '';
          const lname = parts.join(' ') || '';

          this.multiStepForm.patchValue({
            title: this.fetchedEmployee.emp_title || '',
            fname: fname,
            lname: lname,
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
          }, { emitEvent: false });

          ['fname', 'lname', 'address', 'contact', 'role'].forEach(field => {
            this.multiStepForm.get(field)?.disable();
          });

          // update component salary vars
          this.annual_gross_salary = parseFloat(this.fetchedEmployee.annual_gross_salary) || 0;
          this.monthly_gross_salary = parseFloat(this.fetchedEmployee.monthly_gross_salary) || 0;
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
          this.multiStepForm.controls['fname'].valid &&
          this.multiStepForm.controls['lname'].valid &&
          this.multiStepForm.controls['email'].valid &&
          this.multiStepForm.controls['contact'].valid &&
          this.multiStepForm.controls['address'].valid &&
          this.multiStepForm.controls['gender'].valid
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
      "emp_name": formValues.fname + " " + formValues.lname,
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
      "status": "Active",
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
    };

    this.service.post("update/employee", payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Successfully Updated!');
          this.router.navigate(['/authPanal/Employee']);
          this.isLoading = false;
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

}
