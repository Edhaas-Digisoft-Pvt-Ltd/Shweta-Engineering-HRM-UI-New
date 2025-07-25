import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { EditBonusAndIncentiveComponent } from './edit-bonus-and-incentive/edit-bonus-and-incentive.component';
declare var bootstrap: any;
declare var flatpickr: any;
@Component({
  selector: 'app-manage-bonus-and-incentive',
  templateUrl: './manage-bonus-and-incentive.component.html',
  styleUrls: ['./manage-bonus-and-incentive.component.css'],
})
export class ManageBonusAndIncentiveComponent {
  CompanyNames: any = [];
  employees: any = [];
  selectedYear: any;
  selectedMonth: any;
  bonusAndIncentive!: FormGroup;
  updateStatusBonusAndIncentive!: FormGroup;
  editBonusAndIncentive!: FormGroup;
  isSubmitted = false;
  rowData: any = [];
  editBonusAndIncentiveData: any;
  tbiId: any;
  loggedInUser: any;
  minDate = '';
  maxDate = '';
  blockStart = '';
  blockEnd = '';
  defaultDate = '';
  isEditSubmitted = false;
  role: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  financialYears = [2022, 2023, 2024, 2025];
  months = [
    { id: 1, value: 'January' },
    { id: 2, value: 'February' },
    { id: 3, value: 'March' },
    { id: 4, value: 'April' },
    { id: 5, value: 'May' },
    { id: 6, value: 'June' },
    { id: 7, value: 'July' },
    { id: 8, value: 'August' },
    { id: 9, value: 'September' },
    { id: 10, value: 'October' },
    { id: 11, value: 'November' },
    { id: 12, value: 'December' }
  ];

  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modalElement: any) => {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  }

  ngOnInit() {
    this.role = this.service.getRole();

    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    this.getCompanyNames();
    this.getBonusAndIncentives();
    this.loggedInUser = sessionStorage.getItem('employeeName')

    this.bonusAndIncentive = this.fb.group({
      employee_code: ['', [Validators.required]],
      bonus_incentive_date: ['', [Validators.required]],
      bonus_amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      incentive_amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });

    this.updateStatusBonusAndIncentive = this.fb.group({
      employee_id: [{ value: '', disabled: true }, Validators.required],
      employee_name: [{ value: '', disabled: true }, Validators.required],
      bonus_incentive_date: [{ value: '', disabled: true }, Validators.required],
      bonus_amount: [{ value: '', disabled: true }, Validators.required],
      incentive_amount: [{ value: '', disabled: true }, Validators.required],
      status: [{ value: '', disabled: true }, Validators.required],
    });

    this.editBonusAndIncentive = this.fb.group({
      employee_id: [{ value: '', disabled: true }, Validators.required],
      employee_name: [{ value: '', disabled: true }, Validators.required],
      bonus_incentive_date: [{ value: '' }, Validators.required],
      bonus_amount: [{ value: '' }, Validators.required],
      incentive_amount: [{ value: '' }, Validators.required],
      status: [{ value: '' }, Validators.required],
    });
  }

  // ngAfterViewInit() {
  //   const now = new Date();
  //   const m1 = new Date(now.getFullYear(), now.getMonth() , 1);
  //   const y1 = new Date(m1.getFullYear(), m1.getMonth() + 12, 0);

  //   flatpickr("#bonusDate", {
  //     dateFormat: "Y-m-d",  
  //     minDate: m1,
  //     maxDate: y1,
  //     disable: [(d: Date) => {
  //       const isNextMonth = d.getMonth() === m1.getMonth() && d.getFullYear() === m1.getFullYear();
  //       return isNextMonth && d.getDate() > 10;
  //     }]
  //   });
  // }

  ngAfterViewInit() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();

    const currentDate = new Date(year, month, day);
    const nextMonthStart = new Date(year, month + 1, 1);
    const oneYearLater = new Date(year, month + 13, 0);

    const minDate = day <= 10 ? currentDate : nextMonthStart;

    const disableDates = day <= 10
      ? [
        (d: Date) => {
          return d.getFullYear() === year &&
            d.getMonth() === month &&
            d.getDate() > 10;
        },
      ]
      : [
        (d: Date) => d.getFullYear() === year && d.getMonth() === month
      ];

    flatpickr("#bonusDate", {
      dateFormat: "Y-m-d",
      minDate,
      maxDate: oneYearLater,
      disable: disableDates,
      onChange: (selectedDates: Date[], dateStr: string) => {
        this.bonusAndIncentive.get('bonus_incentive_date')?.setValue(dateStr);
      },
    });
  }

  columnDefs: ColDef[] = [
    { headerName: 'Employee Code', field: 'employee_code', sortable: true, filter: true, minWidth: 200 },
    { headerName: 'Employee Name', field: 'emp_name', sortable: true, filter: true, minWidth: 250 },
    { headerName: 'Date', field: 'bonus_incentive_date', sortable: true, filter: true, minWidth: 240 },
    {
      headerName: 'Status', field: 'status', sortable: true, filter: true, minWidth: 250,
      cellRenderer: this.statusButtonRenderer,
    },

    {
      headerName: 'Actions',
      cellStyle: { border: '1px solid #ddd' },
      minWidth: 240,
      // cellRenderer: (params: any) => {
      //   return `<button type="button" class="btn btn-outline-dark mb-1" data-bs-toggle="modal" data-bs-target="#requestBonusIncentiveModal">
      //     <i class="bi bi-pencil"></i>
      //   </button>`;
      // },
      // onCellClicked: (event: any) => {
      //   this.getSingleBonusIncentive(event.data);
      // },  
      cellRenderer: EditBonusAndIncentiveComponent, 
      cellRendererParams: {
        userRole: this.role, // <-- assuming this.userRole contains 'accountant' or 'admin'
        editCallback: (data: string) => this.getSingleBonusIncentiveforEdit(data),
        editStatusCallback: (data: string) => this.getSingleBonusIncentive(data),
      },
    },
  ];

  gridOptions = {
    pagination: false,
    paginationPageSize: 10,
  };

  gridApiActive: any;
  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }
  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '97%';
    button.style.marginTop = '6px';

    // Conditional styling
    if (status === 'pending') {
      button.style.backgroundColor = '#FFF291'; // light red
      button.style.color = '#721c24'; // dark red text
      button.style.border = '1px solid #f5c6cb';
      button.style.borderRadius = '20px';
    } else if (status === 'Approved') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
      button.style.borderRadius = '20px';
    } else if (status === 'Rejected') {
      button.style.backgroundColor = '#FFAFAF'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #FFAFAF';
      button.style.borderRadius = '20px';
    }

    return button;
  }

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status == "success") {
        this.CompanyNames = res.data
      }
    },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  setMaxDate() {
    const today = new Date();
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    this.maxDate = lastDayPrevMonth.toISOString().split('T')[0];
  }

  addBonusAndIncentive() {
    this.isSubmitted = true;
    if (this.bonusAndIncentive.valid) {
      const current_data: any = {
        employee_code: this.bonusAndIncentive.value.employee_code,
        bonus_incentive_date: this.bonusAndIncentive.value.bonus_incentive_date,
        bonus_amount: this.bonusAndIncentive.value.bonus_amount,
        incentive_amount: this.bonusAndIncentive.value.incentive_amount,
      };

      this.service.post("insert/bonusincentive", current_data).subscribe({
        next: (res) => {
          this.toastr.success('Form Submitted Successfully!');
          this.bonusAndIncentive.reset();
          this.bonusAndIncentive.markAllAsTouched();
          this.isSubmitted = false;
          this.closeAllModals();
          this.getBonusAndIncentives();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to add company.');
        }
      });

    } else {
      this.toastr.error('Invalid Credentials!');
    }
  }

  getBonusAndIncentives() {
    this.isLoading = true;
    this.service.post('fetch/bonusincentive', {}).subscribe((res: any) => {
      try {
        if (res.status === 'success') {
          this.rowData = res.Data.map((item: any) => ({
            employee_code: item.employee_code,
            emp_name: item.emp_name,
            bonus_incentive_date: item.bonus_incentive_date,
            status: item.status,
            tbi_id: item.tbi_id,
            role: sessionStorage.getItem('roleName')
          }));
        }
      } catch (error) {
        console.log(error);
      }
    })
    this.isLoading = false;
  }

  fetchBonusIncentive(data: any, formGroup: FormGroup) {
    this.tbiId = data;
    this.service.post('fetch/single/bonusincentive', { tbi_id: data.tbi_id }).subscribe((res: any) => {
      if (res.status === 'success') {
        const singleBonusAndIncentive = res.data[0];
        const patchData = {
          employee_id: singleBonusAndIncentive?.employee_code,
          employee_name: singleBonusAndIncentive?.emp_name,
          bonus_incentive_date: singleBonusAndIncentive?.bonus_incentive_date,
          bonus_amount: singleBonusAndIncentive?.bonus_amount,
          incentive_amount: singleBonusAndIncentive?.incentive_amount,
          status: singleBonusAndIncentive?.status,
        };
        this.editBonusAndIncentiveData = patchData;
        formGroup.patchValue(patchData);
      }
    });
  }

  getSingleBonusIncentive(data: any) {
    this.fetchBonusIncentive(data, this.updateStatusBonusAndIncentive);
  }

  getSingleBonusIncentiveforEdit(data: any) {
    this.fetchBonusIncentive(data, this.editBonusAndIncentive);
  }

  updateStatus(data: any) {
    if (confirm("Do you want to update Status?") == true) {
      const payload = {
        tbi_id: this.tbiId.tbi_id,
        status: data,
        approved_by: this.loggedInUser
      }
      this.service.post(`action/bonusincentive`, payload).subscribe((res: any) => {
        if (res.status === 'success') {
          this.toastr.success("Bonus and Incentive status updated successfully");
          this.getBonusAndIncentives();
          this.closeAllModals();
        }
      }, (error) => {
        console.error('Error:', error);
      });
    }
  }

  updateBonusIncentive() {
    this.isEditSubmitted = true;
    if (this.editBonusAndIncentive.valid) {

      let current_data: any = {
        tbi_id: this.tbiId.tbi_id,
        bonus_incentive_date: this.editBonusAndIncentive.value.bonus_incentive_date,
        bonus_amount: this.editBonusAndIncentive.value.bonus_amount,
        incentive_amount: this.editBonusAndIncentive.value.incentive_amount,
      };

      this.service.post("update/bonusincentive", current_data).subscribe(
        (res: any) => {
          this.toastr.success(res.data);
          this.closeAllModals();
          this.getBonusAndIncentives();
        },
        (error) => {
          console.error('Error:', error);
          this.toastr.error('Something went wrong!');
        }
      );
    } else {
      this.editBonusAndIncentive.markAllAsTouched();
      this.toastr.error('Invalid Credentials!');
    }
  }

  downloadTemplate(): void {
    const userConfirmed = confirm("Do you want to download the bonus & incentive template?");
    if (userConfirmed) {
      const headers = ['employee_code', 'bonus_amount', 'incentive_amount', 'bonus_incentive_date'];
      const exampleRow = [
        'SEE20250501',
        '2000',
        '0',
        'mm-dd-yyyy',
      ];

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
      const workbook: XLSX.WorkBook = { Sheets: { 'Template': worksheet }, SheetNames: ['Template'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'BonusIncentive_Template.xlsx');

      this.toastr.success('Download successfully !');
    }
  }

  selectedFile: File | null = null;

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const formData = new FormData();
    formData.append('upload_file', file);

    this.service.post('import/bonusincentive', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.toastr.success(res.data);
        this.getBonusAndIncentives();
      } else {
        console.log(res.error);
      }
    });
  }

  exportExcel() {
    if (this.gridApiActive) {
      this.gridApiActive.exportDataAsCsv();
    }
  }

}
