import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-bonus-config',
  templateUrl: './bonus-config.component.html',
  styleUrls: ['./bonus-config.component.css']
})
export class BonusConfigComponent {
  addBonusForm!: FormGroup;
  CompanyNames: any[] = [];
  selectedCompanyId: any;
  rowData: any = [];
  columnDefs: ColDef[] = [];
  bonus_id: any;
  update_bonus: boolean = false;
  currentMonth: any;
  isSubmitConfirmed: boolean = false;
  codeInput: string = '';
  randomText: string = '';
  active_company_id: any;

  isSaveClicked = false;
  isSubmitClicked = false;

  present_days: any;
  calculatedRateFromBudget: number | null = null;

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  constructor(
    private fb: FormBuilder,
    private service: HrmserviceService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.getCompanyNames();

    this.addBonusForm = this.fb.group({
      company_id: [null, Validators.required],
      from_date: ['', Validators.required],
      to_date: ['', Validators.required],
      bonus_rate: ['', Validators.required],
      bonus_month: ['', Validators.required],
      bonus_flag: [false],
      showCalculate: [false],
      bonus_budget: [{ value: '', disabled: true }],
      bonus_rate_display: [{ value: '', disabled: true }],
      entered_budget: [''],
    });

    this.getActiveBonus();
    this.initializeColumns();
    this.getBonusList();

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    this.currentMonth = `${year}-${month}`;

    this.getPresentDays();
  }

  calculateBudget() {
    const rate = Number(this.addBonusForm.get('bonus_rate')?.value);
    if (rate > 0) {
      const budget = rate * this.present_days;
      this.addBonusForm.patchValue({
        bonus_budget: budget,
        bonus_rate_display: rate
      });
    } else {
      this.addBonusForm.patchValue({
        bonus_budget: null,
        bonus_rate_display: null
      });
    }
  }

  onBudgetInput(event: any) {
    const budget = event.target.value;
    this.addBonusForm.patchValue({ entered_budget: budget });

    if (this.present_days) {
      this.calculatedRateFromBudget = budget / this.present_days;
    }
  }

  initializeColumns() {
    this.columnDefs = [
      // { headerName: 'Company', field: 'company_name', sortable: true, filter: true, },
      { headerName: 'From Date', field: 'from_date', sortable: true, filter: true, maxWidth: 140, },
      { headerName: 'To Date', field: 'to_date', sortable: true, filter: true, maxWidth: 140, },
      { headerName: 'Rate', field: 'bonus_rate', sortable: true, filter: true, maxWidth: 120, },
      {
        headerName: 'Bonus-Month', field: 'bonus_month', sortable: true, filter: true,
        valueGetter: (params) => this.formatBonusMonth(params.data.bonus_month)
      },
      { headerName: 'Status', field: 'bonus_status', sortable: true, filter: true, maxWidth: 100, },
    ];
  }

  formatBonusMonth(bonusMonth: string): string {
    if (!bonusMonth) return '-';

    const [year, month] = bonusMonth.split('-').map(Number);
    if (!year || !month) return bonusMonth;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[month - 1];

    return `${monthName} - ${year}`;
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe({
      next: (res: any) => {
        if (res.status === "success" && res.data.length > 0) {
          this.CompanyNames = res.data;

          // auto-select first company
          this.selectedCompanyId = this.CompanyNames[0].company_id;

          // set default in form (if form is ready)
          if (this.addBonusForm) {
            this.addBonusForm.patchValue({ company_id: this.selectedCompanyId });
          }

          // load bonus list for selected company
          this.getBonusList();
        }
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
      }
    });
  }

  getPresentDays() {
    this.service.post('presentdays/count', { company_id: this.active_company_id }).subscribe((res: any) => {
      console.log(res);
      if (res.status === "success") {
        this.present_days = res.data.total_present_days;

        this.calculateBudget()
      }
    }, error => {
      console.error('Error fetching companies:', error);
    });
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.getBonusList();
  }

  getBonusList() {
    this.rowData = [];
    this.service.post('bonus-list', { company_id: this.selectedCompanyId, }).subscribe((res: any) => {
      try {
        if (res.status === 'success' && res.data.length > 0) {
          this.rowData = res.data.map((item: any) => ({
            company_name: item.company_name,
            from_date: item.from_date,
            to_date: item.to_date,
            bonus_rate: item.bonus_rate ? item.bonus_rate : '-',
            bonus_month: item.bonus_month ? item.bonus_month : '-',
            bonus_status: item.bonus_status,
          }))
            .reverse();
        }
      } catch (error) {
        console.log(error);
      }
    },
      (error) => {
        console.error(error);
      })
  }

  getActiveBonus() {
    this.service.post('fetch-active-bonus', {}).subscribe((res: any) => {
      if (res.status === "success") {
        const activeBonus = res.data;

        if (!activeBonus || activeBonus.length === 0) {
          return;
        }

        const bonus_data = activeBonus[0];
        console.log("Active Bonus:", bonus_data);
        this.bonus_id = bonus_data.bonus_id
        this.update_bonus = true

        this.addBonusForm.patchValue({
          company_id: bonus_data.company_id,
          from_date: bonus_data.from_date,
          to_date: bonus_data.to_date,
          bonus_rate: bonus_data.bonus_rate,
          bonus_month: bonus_data.bonus_month,
          bonus_flag: bonus_data.bonus_flag,
          bonus_rate_display: bonus_data.bonus_rate,
        });
        this.active_company_id = Number(bonus_data.company_id);

        if (bonus_data.company_id && bonus_data.from_date && bonus_data.to_date) {
          this.addBonusForm.get('company_id')?.disable();
          this.addBonusForm.get('from_date')?.disable();
          this.addBonusForm.get('to_date')?.disable();
        }

        this.getPresentDays();
      }
    }, error => {
      console.error('Error fetching active bonus:', error);
    });
  }

  updateBonus() {
    if (this.addBonusForm.valid) {

      const payload = {
        bonus_id: this.bonus_id,
        bonus_rate: this.addBonusForm.value.bonus_rate,
        bonus_month: this.addBonusForm.value.bonus_month,
        bonus_flag: this.addBonusForm.value.bonus_flag
      };

      this.service.post("update-bonus", payload).subscribe({
        next: (res: any) => {
          console.log(res);

          if (res.status === 'success') {
            this.toastr.success("Bonus Submitted Successfully!");

            const modalElement = document.getElementById('SubmitConfirmModal');
            if (modalElement) {
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              modalInstance?.hide();
            }

            this.getActiveBonus();
            this.getBonusList();
            if (payload.bonus_flag) {
              this.resetBonusForm();
            }
          } else {
            this.toastr.error(res.message || "Submission failed!");
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.toastr.error('Something went wrong!');
        }
      });
    } else {
      this.toastr.error('Please fill all required fields!');
    }
  }

  // Save button
  saveDates() {
    this.isSaveClicked = true;

    if (!this.addBonusForm.value.company_id || !this.addBonusForm.value.from_date || !this.addBonusForm.value.to_date) {
      this.toastr.error("Please fill Select Dates section!");
      return;
    }

    const payload = {
      company_id: this.addBonusForm.value.company_id,
      from_date: this.addBonusForm.value.from_date,
      to_date: this.addBonusForm.value.to_date,
      bonus_rate: null,
      bonus_month: null,
      bonus_flag: false
    };

    this.service.post("add/bonus", payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success("Dates Saved!");
          this.isSaveClicked = false;
          this.getActiveBonus();
          if (payload.bonus_flag) {
            this.resetBonusForm();
          }
        }
      },
      error: (err) => {
        console.error('Error:', err);

        if (err.status === 422) {
          this.toastr.error(err.error.message || "Validation failed!");
        } else if (err.status === 409) {
          this.toastr.error(err.error.message || "Duplicate entry!");
        } else {
          this.toastr.error("Something went wrong!");
        }
        this.isSaveClicked = false;
      }
    });
  }


  // Submit button
  submitRate() {
    this.isSubmitClicked = true;

    if (this.addBonusForm.invalid) {
      this.toastr.error("Please fill all required fields!");
      return;
    }

    const payload = {
      company_id: this.addBonusForm.value.company_id,
      from_date: this.addBonusForm.value.from_date,
      to_date: this.addBonusForm.value.to_date,
      bonus_rate: this.addBonusForm.value.bonus_rate,
      bonus_month: this.addBonusForm.value.bonus_month,
      bonus_flag: this.addBonusForm.value.bonus_flag
    };

    // this.service.post("add/bonus", payload).subscribe((res: any) => {
    //   if (res.status === "success") {
    //     this.toastr.success("Bonus Submitted Successfully!");

    //     const modalElement = document.getElementById('SubmitConfirmModal');
    //     if (modalElement) {
    //       const modalInstance = bootstrap.Modal.getInstance(modalElement);
    //       modalInstance?.hide();
    //     }

    //     this.isSaveClicked = false;
    //     this.isSubmitClicked = false;
    //     this.getActiveBonus();
    //     this.getBonusList();

    //     if (payload.bonus_flag) {
    //       this.resetBonusForm();
    //     }
    //   }
    // });

    this.service.post("add/bonus", payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success("Bonus Submitted Successfully!");
          const modalElement = document.getElementById('SubmitConfirmModal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }

          this.isSaveClicked = false;
          this.isSubmitClicked = false;
          this.getActiveBonus();
          this.getBonusList();

          if (payload.bonus_flag) {
            this.resetBonusForm();
          }
        }
      },
      error: (err) => {
        console.error('Error:', err);

        if (err.status === 422) {
          this.toastr.error(err.error.message || "Validation failed!");
        } else if (err.status === 409) {
          this.toastr.error(err.error.message || "Duplicate entry!");
        } else {
          this.toastr.error("Something went wrong!");
        }
        this.isSaveClicked = false;
      }
    });
  }

  resetBonusForm() {
    this.addBonusForm.reset();
    this.update_bonus = false;
    this.bonus_id = null;
    this.isSaveClicked = false;
    this.isSubmitClicked = false;

    this.addBonusForm.patchValue({
      company_id: null,
      from_date: '',
      to_date: '',
      bonus_rate: '',
      bonus_month: '',
      bonus_flag: false
    });

    this.addBonusForm.get('company_id')?.enable();
    this.addBonusForm.get('from_date')?.enable();
    this.addBonusForm.get('to_date')?.enable();
  }

  onSubmitConfirm() {
    const modalElement = document.getElementById('SubmitConfirmModal');
    if (modalElement) {
      const modalInstance =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
      modalInstance.show();
    }

    this.isSubmitConfirmed = false;
    this.codeInput = '';
    this.randomText = this.generaterandomText();
  }

  generaterandomText(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  cansubmitRate(): boolean {
    return this.isSubmitConfirmed && this.codeInput === this.randomText;
  }

}
