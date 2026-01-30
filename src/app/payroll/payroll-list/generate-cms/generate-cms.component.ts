import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-generate-cms',
  templateUrl: './generate-cms.component.html',
  styleUrls: ['./generate-cms.component.css']
})
export class GenerateCmsComponent {
  companyList: any[] = [];
  cmsForm!: FormGroup;
  isSubmitted = false;
  today = new Date().toISOString().split('T')[0];
  maxMonth!: string;
  cmsData: any;

  expenseForm!: FormGroup;
  expenseList: any[] = [];
  savedExpenses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: HrmserviceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getCompanyNames();
    this.setMaxMonth();

    this.cmsForm = this.fb.group({
      companyId: ['', Validators.required],
      yearMonth: ['', Validators.required],
      companyCode: ['SEPL', Validators.required],
      paymentType: ['RPAY', Validators.required],
      paymentDate: ['', Validators.required],
      accountNumber: ['7748133816', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });

    this.expenseForm = this.fb.group({
      transferType: ['', Validators.required],
      amount: ['', Validators.required],
      gender: ['', Validators.required],
      name: ['', Validators.required],
      ifsc: ['', Validators.required],
      accountNumber: ['', Validators.required],
    });
  }

  setMaxMonth() {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    this.maxMonth = today.toISOString().slice(0, 7);
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data.length > 0) {
          this.companyList = res.data;
        }
      },
      error: () => {
        this.toastr.error('Failed to load company list');
      }
    });
  }

  generateCMS() {
    this.isSubmitted = true;

    if (this.cmsForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const formData = this.cmsForm.value;
    const payload = {
      company_id: formData.companyId,
      yearMonth: formData.yearMonth,
    };

    this.service.post('generate-cms', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('CMS data fetched successfully');
          const companyName =
            this.companyList.find((c: any) => c.company_id == formData.companyId)
              ?.company_name?.toUpperCase() || '';

          //Employee data
          const employeeData = res.data.map((item: any) => ({
            company_code: formData.companyCode.toUpperCase(),
            payment_type: formData.paymentType.toUpperCase(),
            transfer_type: (item.transfer_type || '').toUpperCase(),
            payment_date: formData.paymentDate,
            account_number_form: `="${formData.accountNumber}"`,
            net_salary: item.net_salary,
            gender: (item.gender || '').toUpperCase(),
            employee_name: (item.employee_name || '').toUpperCase(),
            ifsc_code: (item.ifsc_code || '').toUpperCase(),
            account_number_api: `="${(item.account_number || '')}"`,
            blank_1: '',
            blank_2: '',
            EMPLOYEE_SALARY: `${(item.employee_name || '').toUpperCase()} SALARY`,
            COMPANY_NAME: companyName,
          }));

          //Append expense data (savedExpenses)
          const expenseData = (this.savedExpenses || []).map((exp: any) => ({
            company_code: formData.companyCode.toUpperCase(),
            payment_type: formData.paymentType.toUpperCase(),
            transfer_type: exp.transferType.toUpperCase(),
            payment_date: formData.paymentDate,
            account_number_form: `="${formData.accountNumber}"`,
            net_salary: exp.amount,
            gender: (exp.gender || '').toUpperCase(),
            employee_name: (exp.name || '').toUpperCase(),
            ifsc_code: (exp.ifsc || '').toUpperCase(),
            account_number_api: `="${(exp.accountNumber || '')}"`,
            blank_1: '',
            blank_2: '',
            EMPLOYEE_SALARY: `${(exp.name || '').toUpperCase()} SALARY`,
            COMPANY_NAME: companyName,
          }));

          //Combine both
          const combinedData = [...employeeData, ...expenseData];

          //Convert to CSV
          const csvContent = combinedData
            .map((obj: any) => Object.values(obj).join(','))
            .join('\n');

          const blob = new Blob([csvContent.toUpperCase()], {
            type: 'text/csv;charset=utf-8;',
          });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute(
            'download',
            `CMS_${formData.companyCode}_${formData.yearMonth}.csv`
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          //Clear data after download
          this.cmsData = [];
          this.expenseList = [];
          this.savedExpenses = [];
          this.expenseForm.reset();
          this.cmsForm.reset();
          this.isSubmitted = false;
        } else {
          this.toastr.warning(
            res.message ||
            'No data found. Please check you have processed payroll data.'
          );
        }
      },
      error: (err) => {
        console.error('Error fetching CMS data:', err);
        this.toastr.error(
          err.error?.message || 'Something went wrong while generating CMS'
        );
      },
    });
  }

  addExpense() {
    if (this.expenseForm.invalid) {
      this.toastr.warning('Please fill all expense fields');
      return;
    }
    this.expenseList.push(this.expenseForm.value);
    this.expenseForm.reset();
  }

  removeExpense(index: number) {
    this.expenseList.splice(index, 1);
  }

  saveExpenses() {
    this.savedExpenses = [...this.expenseList];
    this.toastr.success('Expenses saved successfully');
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) event.preventDefault();
  }

  allowAlphanumeric(event: KeyboardEvent) {
    if (!/[a-zA-Z0-9]/.test(event.key)) event.preventDefault();
  }
}
