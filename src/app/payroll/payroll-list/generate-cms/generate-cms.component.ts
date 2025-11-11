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
      companyCode: ['', Validators.required],
      paymentType: ['', Validators.required],
      paymentDate: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
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

    const { companyId, yearMonth } = this.cmsForm.value;

    const payload = {
      company_id: companyId,
      yearMonth: yearMonth,
    };

    this.service.post('generate-cms', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('CMS data fetched successfully');
          const formData = this.cmsForm.value;

          const combinedData = res.data.map((item: any) => ({
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
            COMPANY_NAME: this.companyList.find((c: any) => c.company_id == formData.companyId)?.company_name?.toUpperCase() || ''
          }));

          // Convert to CSV
          const csvContent = combinedData
            .map((obj: any) => Object.values(obj).join(','))
            .join('\n');

          const blob = new Blob([csvContent.toUpperCase()], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `CMS_${formData.companyCode}_${formData.yearMonth}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        else {
          this.toastr.warning(res.message || 'No data found');
        }
      },
      error: (err) => {
        console.error('Error fetching CMS data:', err);
        this.toastr.error(err.error?.message || 'Something went wrong while generating CMS');
      },
    });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) event.preventDefault();
  }

  allowAlphanumeric(event: KeyboardEvent) {
    if (!/[a-zA-Z0-9]/.test(event.key)) event.preventDefault();
  }
}
