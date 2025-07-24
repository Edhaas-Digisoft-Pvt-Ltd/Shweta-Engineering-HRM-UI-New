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
  selectedCompanyId: any = 1;
  multiStepForm: FormGroup;
  currentStep: number = 1;


  ctc: number = 0;
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
      company:['', Validators.required],
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
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(12),
        ],
      ],
      ifsc: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
      ],
      Enable_PF_Employee: [''],
      Opt_for_EPS_entitled: [''],
      Enable_ESIC_for_employee: [''],
      Enable_PT_for_employee: [''],
      Enable_LWF_for_employee: [''],
      National_Pension_Scheme: [''],
      ctc: [0, Validators.required],
      salary: [0],
    });
    this.salaryStructureForm = this.fb.group({
      salaryComponents: this.fb.group({}),
    });
  }

  ngOnInit() {

    this.multiStepForm.get('ctc')?.valueChanges.subscribe((value) => {
      this.ctc = value;
      // this.calculateAmount();
    }); 
    this.getCompanyNames();

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
  handleCTCFromChild(ctc: number): void {
    console.log('CTC received from child:', ctc);
    this.multiStepForm.get('ctc')?.setValue(ctc); // Optional: Update form control
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
      if (!this.statutoryInfo.includes(label)) {
        this.statutoryInfo.push(label);
      }
      if (option && !this.selectedStatutoryOptions.some(o => o.label === label)) {
        this.selectedStatutoryOptions.push(option);
      }
    } else {
      this.statutoryInfo = this.statutoryInfo.filter(item => item !== label);
      this.selectedStatutoryOptions = this.selectedStatutoryOptions.filter(item => item.label !== label);
    }
    
    this.calculateSalaryAmount();
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

  getDepartmentNames() {
    this.service.post('fetch/department', { company_id: this.selectedCompanyId }).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.departmentNames = res.data;
          console.log(this.departmentNames.department_id)
        }
      },
      (error) => {
        console.error('Error fetching department:', error);

        // ✅ Check for 400 status code
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
          this.multiStepForm.controls['ifsc'].valid
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
    if (this.multiStepForm.valid) {


      let company_id_value: any = this.selectedCompanyId;

      let current_data: any = {

        "company_id": this.selectedCompanyId,
        "emp_title": this.multiStepForm.value.title,
        "emp_name": this.multiStepForm.value.fname +" "+ this.multiStepForm.value.lname,
        "emp_email": this.multiStepForm.value.email,
        "emp_gender": this.multiStepForm.value.gender,
        "department_id":this.multiStepForm.value.department,
        "designation_id": this.multiStepForm.value.designation,
        "CTC": this.multiStepForm.value.ctc,
        "statutory_list": JSON.stringify(this.statutoryInfo),
        "bank_name": this.multiStepForm.value.bankName,
        "account_num": this.multiStepForm.value.accountNumber,
        "ifsc_code": this.multiStepForm.value.ifsc,
        "doj": this.multiStepForm.value.join_date,
        "emp_contact": this.multiStepForm.value.contact,
        "status": "Active",
        "emp_address": this.multiStepForm.value.address,
        "role_id": 3,
        // "department_name": this.multiStepForm.value.department,
        // "designation_name": this.multiStepForm.value.designation
      }

      console.log('Form Submitted:', this.multiStepForm.value);

      this.service.post("create/employee", current_data).subscribe((res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Successfully Submitted!');
        } else {
          this.toastr.error(res.message || 'Submission failed!');
        }
      });


      this.multiStepForm.reset();
      this.currentStep = 1;
      this.salaryAmount = 0;
      this.ctc = 0;

    } else {
      this.toastr.error('Please fill all required fields.');
      this.multiStepForm.markAllAsTouched();
      console.log(this.multiStepForm.value);
    }
  }

  calculateSalaryAmount() {
    const monthlyAmount = this.ctc / 12;

    // Sum of all selected statutory field values from the form
    let totalDeduction = 0;
    this.selectedStatutoryOptions.forEach(field => {
      const control = this.multiStepForm.get(field.formControl);
      const value = control?.value || 0;
      totalDeduction += Number(value);
    });

    const total = this.logTotalDeductions();

    
    this.salaryAmount = monthlyAmount - total;

    console.log('Monthly Amount:', this.amount);
    console.log('Deductions:', total);
    console.log('Final Salary:', this.salaryAmount);
  }

  logTotalDeductions() {
    const total = this.selectedStatutoryOptions.reduce((sum, field) => {
      return sum + Number(field.value || 0); // treat undefined/null as 0
    }, 0);
    return total;
  }
}
