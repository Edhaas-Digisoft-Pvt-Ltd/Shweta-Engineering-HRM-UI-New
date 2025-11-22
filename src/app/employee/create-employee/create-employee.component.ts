import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})

export class CreateEmployeeComponent {

  CompanyNames: any = [];
  roles: any;
  selectedCompanyId: any = 1;
  multiStepForm: FormGroup;
  currentStep: number = 1;
  // ctc: number = 0;
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

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService, private service: HrmserviceService,
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
      // email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/)]],
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
      // employee_code: ['', Validators.required,],
      gender: ['', Validators.required],
      company: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      // ctc: ['', Validators.required],
      join_date: ['', Validators.required],
      work_pattern: ['', Validators.required],
      accountHolderName: [
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
      // Enable_PF_Employee: [''],
      // Opt_for_EPS_entitled: [''],
      // Enable_ESIC_for_employee: [''],
      // Enable_PT_for_employee: [''],
      // Enable_LWF_for_employee: [''],
      // National_Pension_Scheme: [''],
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
  }

  ngOnInit() {
    this.multiStepForm.get('annual_gross_salary')?.valueChanges.subscribe((value) => {
      this.annual_gross_salary = value;
      // this.calculateAmount();
    });
    this.getCompanyNames();
    this.getRoles();

    this.multiStepForm.valueChanges.subscribe(values => {
      this.calculateGrossSalary(values);
    });
  }

  removeSpaces(): void {
    const currentValue = this.multiStepForm.get('ifsc')?.value || '';
    const cleanedValue = currentValue.replace(/\s+/g, '');
    this.multiStepForm.get('ifsc')?.setValue(cleanedValue, { emitEvent: false });
  }

  handleSalary(salary: number): void {
    console.log('Received salary from child:', salary);
    this.multiStepForm.get('salary')?.setValue(salary);
  }
  handleCTCFromChild(annual_gross_salary: number): void {
    console.log('CTC received from child:', annual_gross_salary);
    this.multiStepForm.get('annual_gross_salary')?.setValue(annual_gross_salary); // Optional: Update form control
  }
  gmailValidator(control: any) {
    const value = control.value;
    if (value && !value.endsWith('@gmail.com')) {
      return { notGmail: true };
    }
    return null;
  }

  checkboxOptions = [
    { id: 'pf', label: 'Enable PF Employee', formControl: 'pf', value: 400 },
    { id: 'eps', label: 'Opt for EPS entitled', formControl: 'eps', value: 200 },
    { id: 'esic', label: 'Enable ESIC for employee', formControl: 'esic', value: 200 },
    { id: 'pt', label: 'Enable PT for employee', formControl: 'pt', value: 200 },
    { id: 'lwf', label: 'Enable LWF for employee', formControl: 'lwf', value: 200 },
    { id: 'nps', label: 'National Pension Scheme', formControl: 'nps', value: 200 },
  ];

  // onCheckboxChange(event: any): void {
  //   const value = event.target.value;
  //   if (event.target.checked) {
  //     this.statutoryInfo.push(value);
  //     console.log("statutoryinfo :", value)
  //   } else {
  //     this.statutoryInfo = this.statutoryInfo.filter(item => item !== value);
  //   }
  // }

  onCheckboxChange(event: any): void {
    const label = event.target.value;
    const option = this.checkboxOptions.find(opt => opt.label === label);

    if (event.target.checked) {
      if (!this.statutoryInfo.includes(label)) this.statutoryInfo.push(label);
      if (option && !this.selectedStatutoryOptions.some(o => o.label === label)) this.selectedStatutoryOptions.push(option);
    } else {
      this.statutoryInfo = this.statutoryInfo.filter(item => item !== label);
      this.selectedStatutoryOptions = this.selectedStatutoryOptions.filter(item => item.label !== label);
    }
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        // this.optionsArray = res.map((company: any) => company.CompanyName); // <-- only CompanyName
        this.CompanyNames = res.data;
        console.log(this.CompanyNames.company_id)
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
          console.log(this.designationNames.designation_id)

        }
      },
      (error) => {
        console.error('Error fetching designation:', error);

        // ✅ Handle specific HTTP status codes
        if (error.status === 400) {
          this.toastr.error('Designation Not Available !');
          this.designationNames = [];
        }
      }
    );
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    console.log('Selected Company ID:', this.selectedCompanyId);

    this.getDepartmentNames();
    this.getDesignationNames();
  }

  nextStep() {

    // if (this.currentStep === 5) {
    //   this.currentStep++;
    // } else if (!this.isStepValid(this.currentStep)) {
    //   this.nextCheck = true;
    //   if (this.currentStep === 1) {
    //     // this.toastr.error('Please fill all required fields before proceeding!');
    //     this.multiStepForm.markAllAsTouched();
    //     return;
    //   } else {
    //     this.toastr.error('Please fill all required fields !');
    //     this.multiStepForm.markAllAsTouched();
    //     return;
    //   }
    // }


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
          this.multiStepForm.controls['join_date'].valid &&
          this.multiStepForm.controls['work_pattern'].valid
        );

      case 3:
        return (
          this.multiStepForm.controls['accountHolderName'].valid &&
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

  isSalaryVisible = false;
  showSalarySummary2: boolean = false;

  // showSalarySummary() {
  //   this.calculateAmount(); // call your calculation logic
  //   this.isSalaryVisible = true;
  // }

  showStatutoryValues(): void {
    const values = this.multiStepForm.getRawValue(); // or this.form.value
    let message = 'Statutory Values:\n';

    for (const key of this.statutoryInfo) {
      message += `${key}: ${values[key] ?? 0}\n`;
    }

    alert(message);
  }

  onSubmit() {
    if (!this.multiStepForm.valid) {
      console.log('Invalid controls:', this.multiStepForm.controls);
      Object.keys(this.multiStepForm.controls).forEach(key => {
        if (this.multiStepForm.controls[key].invalid) {
           this.toastr.error(`${key.replace(/_/g, ' ')} is invalid or required`);
          console.log('Invalid:', key, this.multiStepForm.controls[key].errors);
        }
      });
      this.multiStepForm.markAllAsTouched();
      return;
    }

    // if (this.multiStepForm.valid) {
      let company_id_value: any = this.selectedCompanyId;

      let current_data: any = {

        "company_id": this.selectedCompanyId,
        "emp_title": this.multiStepForm.value.title,
        "emp_name": this.multiStepForm.value.fname + " " + this.multiStepForm.value.lname,
        "emp_email": this.multiStepForm.value.email,
        "emp_gender": this.multiStepForm.value.gender,
        "department_id": this.multiStepForm.value.department,
        "designation_id": this.multiStepForm.value.designation,
        "bank_name": this.multiStepForm.value.bankName,
        "account_num": this.multiStepForm.value.accountNumber,
        "transfer_type": this.multiStepForm.value.transfer_type,
        "aadhaar_number": this.multiStepForm.value.aadhaarNumber.replace(/\s/g, ''),
        "pan_number": this.multiStepForm.value.panNumber,
        "ifsc_code": this.multiStepForm.value.ifsc,
        "doj": this.multiStepForm.value.join_date,
        "emp_contact": this.multiStepForm.value.contact,
        "status": "Active",
        "emp_address": this.multiStepForm.value.address,
        "role_id": this.multiStepForm.value.role,

        "basic_salary": this.multiStepForm.value.basic_salary,
        "house_rent_allowances": this.multiStepForm.value.house_rent_allowances || 0,
        "conveyance_allowances": this.multiStepForm.value.conveyance_allowances || 0,
        "medical_allowances": this.multiStepForm.value.medical_allowances || 0,
        "special_allowances": this.multiStepForm.value.special_allowances || 0,

        "annual_gross_salary": parseFloat(this.annual_gross_salary.toFixed(2)),
        "monthly_gross_salary": parseFloat(this.monthly_gross_salary.toFixed(2)),

        "pf_employee_applicable": this.multiStepForm.value.pf_employee_applicable || false,
        "pf_employer_applicable": this.multiStepForm.value.pf_employer_applicable || false,
        "esic_employee_applicable": this.multiStepForm.value.esic_employee_applicable || false,

        // "department_name": this.multiStepForm.value.department,
        // "designation_name": this.multiStepForm.value.designation
      }

      console.log('Form Submitted:', this.multiStepForm.value);

      this.service.post("create/employee", current_data).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.toastr.success('Successfully Submitted!');
            this.multiStepForm.reset();
            this.multiStepForm.patchValue({
              department: null,
              designation: null
            });
            this.currentStep = 1;
            this.salaryAmount = 0;
            this.annual_gross_salary = 0;
          } else {
            this.toastr.error('Submission failed!');
          }
        },
        error: (err) => {
           this.toastr.error(err.error?.data || err.error?.message || 'Something went wrong!');
        }
      });

    //   this.multiStepForm.reset();
    //   this.currentStep = 1;
    //   this.salaryAmount = 0;
    //   this.annual_gross_salary = 0;

    // } else {
    //   this.toastr.error('Please fill all required fields.');
    //   this.multiStepForm.markAllAsTouched();
    //   console.log(this.multiStepForm.value);
    // }
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

    // Update component vars
    this.annual_gross_salary = annual;
    this.monthly_gross_salary = monthly;

    // Update form controls so they go in payload
    this.multiStepForm.patchValue({
      annual_gross_salary: annual,
      monthly_gross_salary: monthly,
    }, { emitEvent: false });
  }

  logTotalDeductions() {
    const total = this.selectedStatutoryOptions.reduce((sum, field) => {
      return sum + Number(field.value || 0); // treat undefined/null as 0
    }, 0);
    return total;
  }

  // formatWithCommas(controlName: string): void {
  //   const control = this.multiStepForm.get(controlName);
  //   if (!control) return;

  //   const num = +String(control.value).replace(/,/g, '');
  //   control.setValue(num ? num.toLocaleString('en-IN') : '', { emitEvent: false });
  // }

  
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
