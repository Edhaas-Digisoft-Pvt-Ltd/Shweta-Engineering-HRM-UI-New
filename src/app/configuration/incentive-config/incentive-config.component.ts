import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-incentive-config',
  templateUrl: './incentive-config.component.html',
  styleUrls: ['./incentive-config.component.css']
})
export class IncentiveConfigComponent {
  addBonusForm!: FormGroup;
  CompanyNames: any = [];
  isSubmitted = false;
  rowData: any = [];
  columnDefs: ColDef[] = [];

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  dummyData = [
    {
      companyid: 1,
      from_date: '2025-08-01',
      to_date: '2025-08-15',
      rate: 500
    },
  ];

  constructor(private fb: FormBuilder, private service: HrmserviceService, private toastr: ToastrService) { }

  ngOnInit() {
    this.getCompanyNames();

    this.addBonusForm = this.fb.group({
      companyid: [null, [Validators.required,]],
      from_date: ['', Validators.required],
      to_date: ['', Validators.required],
      rate: ['', Validators.required]
    });

    this.initializeColumns()

    this.rowData = this.dummyData
  }

  initializeColumns() {
    this.columnDefs = [
      { headerName: 'From Date', field: 'from_date', sortable: true, filter: true},
      { headerName: 'To Date', field: 'to_date', sortable: true, filter: true},
      { headerName: 'Rate', field: 'rate', sortable: true, filter: true},
      { headerName: 'Action', field: '', sortable: true, filter: true},
    ];
  }

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

  addBonusData() {
    this.isSubmitted = true;
    if (this.addBonusForm.valid) {
      let payload: any = {
        "companyid": this.addBonusForm.value.companyid,
        "from_date": this.addBonusForm.value.from_date,
        "to_date": this.addBonusForm.value.to_date,
        "rate": this.addBonusForm.value.rate,
      }
      console.log('bonus_data', payload);

      this.service.post("add/bonus", payload).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.toastr.success('Leave Rule Added!');
            this.addBonusForm.reset();
            this.isSubmitted = false;
          }
        },
        (error) => {
          console.error(error);
          this.toastr.error('Something went wrong!');
        }
      );
    } else {
      this.toastr.error('Invalid Credentials!');
      this.addBonusForm.markAllAsTouched();
    }
  }
}
