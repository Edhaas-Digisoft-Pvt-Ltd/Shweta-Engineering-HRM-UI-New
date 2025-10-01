import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-test-bonus-config',
  templateUrl: './test-bonus-config.component.html',
  styleUrls: ['./test-bonus-config.component.css']
})
export class TestBonusConfigComponent {
  addBonusForm!: FormGroup;
  CompanyNames: any = [];
  selectedCompanyId: any = 1;
  rowData: any = [];
  columnDefs: ColDef[] = [];
  bonus_id: any;
  update_bonus: boolean = false;
  addNew: boolean = false;

  isSaveClicked = false;
  isSubmitClicked = false;

  updatebtnhide = false;

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
      bonus_id: [null],
      company_id: [null, Validators.required],
      from_date: ['', Validators.required],
      to_date: ['', Validators.required],
      bonus_rate: [null],
      bonus_month: [null],
      bonus_flag: [false],
    });

    this.initializeColumns();
    this.getBonusList();
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'From Date', field: 'from_date', sortable: true, filter: true },
      { headerName: 'To Date', field: 'to_date', sortable: true, filter: true },
      { headerName: 'Rate', field: 'bonus_rate', sortable: true, filter: true, valueFormatter: (params) => params.value ?? '-' },
      { headerName: 'Bonus-Month', field: 'bonus_month', sortable: true, filter: true, valueFormatter: (params) => params.value ?? '-' },
      { headerName: 'Status', field: 'bonus_status', sortable: true, filter: true },
      {
        headerName: 'Action',
        cellRenderer: (params: any) => {
          return `
          <button class="btn btn-sm edit-btn" style="background-color:#C8E3FF"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm delete-btn ms-2" style="background-color:#C8E3FF"><i class="bi bi-trash"></i></button>
        `;
        },
        onCellClicked: (params: any) => {
          if (params.event.target.classList.contains('edit-btn')) {
            this.onEditBonus(params.data);
          }
          if (params.event.target.classList.contains('delete-btn')) {
            this.onDeleteBonus(params.data);
          }
        }
      }
    ];
  }

  onEditBonus(rowData: any) {
    this.update_bonus = true;
    this.addNew = true;
    this.bonus_id = rowData.bonus_id;

    this.addBonusForm.patchValue({
      company_id: this.selectedCompanyId,
      from_date: rowData.from_date,
      to_date: rowData.to_date,
      bonus_rate: rowData.bonus_rate ? rowData.bonus_rate : '-',
      bonus_month: rowData.bonus_month ? rowData.bonus_month : '-',
      bonus_flag: rowData.bonus_flag ?? false,
      bonus_id: rowData.bonus_id
    });

        if (this.update_bonus == true) {
          this.addBonusForm.get('company_id')?.disable();
          this.addBonusForm.get('from_date')?.disable();
          this.addBonusForm.get('to_date')?.disable();
        }

        if(rowData.bonus_status =='Active' ){
          this.updatebtnhide = true
          this.addBonusForm.get('company_id')?.disable();
          this.addBonusForm.get('from_date')?.disable();
          this.addBonusForm.get('to_date')?.disable();
          this.addBonusForm.get('bonus_rate')?.disable();
          this.addBonusForm.get('bonus_month')?.disable();
          this.addBonusForm.get('bonus_flag')?.disable();
        }
  }

  onDeleteBonus(rowData: any) {
    if (confirm("Are you sure you want to delete this bonus?")) {

      this.service.post("bonus-delete", { bonus_id: rowData.bonus_id }).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.toastr.success("Bonus Deleted!");
            this.getBonusList();
            if (this.addBonusForm.value.bonus_id === rowData.bonus_id) {
              this.addBonusForm.reset();
            }
          } else {
            this.toastr.error(res.message || "Delete failed!");
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error("Something went wrong!");
        }
      });
    }
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status === "success") {
        this.CompanyNames = res.data;
      }
    }, error => {
      console.error('Error fetching companies:', error);
    });
  }

  onCompanyChange(event: Event): void {
    this.selectedCompanyId = (event.target as HTMLSelectElement).value;
    this.getBonusList();
    this.addBonusForm.reset(); 
    this.isSubmitClicked = false;
    this.update_bonus = false;
    this.bonus_id = null

    this.addBonusForm.get('company_id')?.enable();
    this.addBonusForm.get('from_date')?.enable();
    this.addBonusForm.get('to_date')?.enable();
    this.addBonusForm.get('bonus_rate')?.enable();
    this.addBonusForm.get('bonus_month')?.enable();
    this.addBonusForm.get('bonus_flag')?.enable();

    this.updatebtnhide = false
  }

  toggleBonusWindow() {
    this.addNew = !this.addNew;
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
            bonus_rate: item.bonus_rate ?? null,
            bonus_month: item.bonus_month ?? null,
            bonus_status: item.bonus_status,
            bonus_id: item.bonus_id
          }))
            .reverse();
        } else {
          this.toastr.warning('Data Not Found');
        }
      } catch (error) {
        console.log(error);
      }
    },
      (error) => {
        if (error.status === 404) {
          this.toastr.warning('Data Not Found');
        } else {
          console.error(error);
        }
      })
  }

  updateBonus() {
    console.log(this.bonus_id);
    console.log(this.addBonusForm.value.bonus_flag)

    if (this.addBonusForm.valid) {
      const formValues = this.addBonusForm.getRawValue();

      const payload = {
        bonus_id: this.bonus_id,
        bonus_rate: formValues.bonus_rate,
        bonus_month: formValues.bonus_month,
        bonus_flag: formValues.bonus_flag ?? false
      };

      this.service.post("update-bonus", payload).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.toastr.success("Bonus Updated!");
            this.getBonusList()
          } else {
            this.toastr.error(res.message || "Update failed!");
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

  isInvalid(controlName: string): boolean {
    const formValues = this.addBonusForm.value;

    if (!this.isSubmitClicked) return false;

    const control = this.addBonusForm.get(controlName);
    if (control?.invalid) {
      return true;
    }

    if (controlName === 'bonus_rate') {
      return !!formValues.bonus_month && !formValues.bonus_rate;
    }

    if (controlName === 'bonus_month') {
      return !!formValues.bonus_rate && !formValues.bonus_month;
    }
    return false;
  }

  submitRate() {
    this.isSubmitClicked = true;

    if (!this.addBonusForm.value.company_id || !this.addBonusForm.value.from_date || !this.addBonusForm.value.to_date) {
      this.toastr.error("Please fill all required fields!");
      return;
    }

    if ((this.addBonusForm.value.bonus_rate && !this.addBonusForm.value.bonus_month) ||
      (!this.addBonusForm.value.bonus_rate && this.addBonusForm.value.bonus_month)) {
      this.toastr.error("Please fill all required fields!");
      return;
    }

    if (!this.bonus_id) {
      const payload = {
        company_id: this.addBonusForm.value.company_id,
        from_date: this.addBonusForm.value.from_date,
        to_date: this.addBonusForm.value.to_date,
        bonus_rate: this.addBonusForm.value.bonus_rate ? this.addBonusForm.value.bonus_rate : null,
        bonus_month: this.addBonusForm.value.bonus_month ? this.addBonusForm.value.bonus_month : null ,
        bonus_flag: this.addBonusForm.value.bonus_flag === true ? true : false
      };

      this.service.post("add/bonus", payload).subscribe((res: any) => {
        if (res.status === "success") {
          this.toastr.success("Bonus Created!");
          this.bonus_id = res.data.bonus_id;
          this.addBonusForm.patchValue({ bonus_id: this.bonus_id });
          this.getBonusList();
        } else {
          this.toastr.error(res.message || "Failed to create bonus!");
        }
      });
    }

    else {
      this.updateBonus();
    }
  }

}
