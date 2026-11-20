import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from 'src/app/hrmservice.service';

declare var bootstrap: any;

@Component({
  selector: 'app-department-designation',
  templateUrl: './department-designation.component.html',
  styleUrls: ['./department-designation.component.css']
})
export class DepartmentDesignationComponent implements OnInit {

  // Tab
  activeTab: string = 'companyList';

  // Company list
  companies: any[] = [];
  selectedCompanyId: any = '';

  // Department
  departmentRowData: any[] = [];
  departmentColumnDefs: ColDef[] = [];
  departmentGridApi: any;
  departmentForm: FormGroup;
  editDepartmentForm: FormGroup;
  isDeptSubmitted = false;
  isEditDeptSubmitted = false;
  selectedDepartment: any = null;

  // Designation
  designationRowData: any[] = [];
  designationColumnDefs: ColDef[] = [];
  designationGridApi: any;
  designationForm: FormGroup;
  editDesignationForm: FormGroup;
  isDesigSubmitted = false;
  isEditDesigSubmitted = false;
  selectedDesignation: any = null;

  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    editable: false,
  };

  constructor(
    private fb: FormBuilder,
    private service: HrmserviceService,
    private toastr: ToastrService
  ) {
    this.departmentForm = this.fb.group({
      company_id: ['', Validators.required],
      department_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]]
    });
    this.editDepartmentForm = this.fb.group({
      company_id: ['', Validators.required],
      department_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]]
    });
    this.designationForm = this.fb.group({
      company_id: ['', Validators.required],
      designation_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]]
    });
    this.editDesignationForm = this.fb.group({
      company_id: ['', Validators.required],
      designation_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]]
    });
  }

  openAddDepartmentModal() {
    this.departmentForm.reset();
    this.departmentForm.patchValue({ company_id: this.selectedCompanyId });
    this.openBootstrapModal('addDepartmentModal');
  }
  openAddDesignationModal() {
    this.designationForm.reset();
    this.designationForm.patchValue({ company_id: this.selectedCompanyId });
    this.openBootstrapModal('addDesignationModal');
  }

  ngOnInit(): void {
    this.initDepartmentColumns();
    this.initDesignationColumns();
    this.getCompanies();
  }

  // ── Companies ─────────────────────────────────────────────
  getCompanies() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.companies = res.data;
        if (this.companies.length > 0) {
          this.selectedCompanyId = this.companies[0].company_id;
          this.onCompanyChange();
        }
      }
    });
  }

  onCompanyChange() {
    if (!this.selectedCompanyId) return;
    this.getDepartments();
    this.getDesignations();
  }

  // ── Department ────────────────────────────────────────────
  initDepartmentColumns() {
    this.departmentColumnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', maxWidth: 70, sortable: false, filter: false },
      { headerName: 'Department Name', field: 'department_name', sortable: true, filter: true },
      {
        headerName: 'Action', field: 'action', sortable: false, filter: false,
        suppressMovable: true, maxWidth: 120,
        cellRenderer: (params: any) => {
          const wrapper = document.createElement('div');
          wrapper.classList.add('d-flex', 'gap-2', 'align-items-center', 'h-100');
          const editBtn = document.createElement('button');
          editBtn.type = 'button';
          editBtn.classList.add('btn', 'btn-sm');
          editBtn.style.backgroundColor = '#C8E3FF';
          editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
          editBtn.addEventListener('click', (e: Event) => { e.stopPropagation(); this.onEditDepartment(params.data); });
          wrapper.appendChild(editBtn);
          return wrapper;
        }
      }
    ];
  }

  onDepartmentGridReady(params: { api: any }) { this.departmentGridApi = params.api; }

  getDepartments() {
    // POST /fetch/department
    this.service.post('fetch/department', { company_id: this.selectedCompanyId }).subscribe(
      (res: any) => { this.departmentRowData = res.status === 'success' ? res.data : []; },
      () => { this.departmentRowData = []; }
    );
  }

  addDepartment() {
    this.isDeptSubmitted = true;
    if (this.departmentForm.invalid) { this.toastr.error('Please enter a valid department name.'); return; }
    const payload = { company_id: Number(this.departmentForm.value.company_id), department_name: this.departmentForm.value.department_name.trim() };
    // POST /create/department
    this.service.post('create/department', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Department added successfully!');
          this.closeModal('addDepartmentModal');
          this.departmentForm.reset();
          this.isDeptSubmitted = false;
          this.getDepartments();
        }
      },
      error: () => this.toastr.error('Failed to add department.')
    });
  }

  onEditDepartment(dept: any) {
    this.selectedDepartment = dept;
    this.editDepartmentForm.patchValue({
      company_id: dept.company_id,
      department_name: dept.department_name
    });
    this.openBootstrapModal('editDepartmentModal');
  }

  updateDepartment() {
    this.isEditDeptSubmitted = true;
    if (this.editDepartmentForm.invalid) { this.toastr.error('Please enter a valid department name.'); return; }
    const id = this.selectedDepartment?.department_id;
    const payload = { company_id: Number(this.selectedCompanyId), department_name: this.editDepartmentForm.value.department_name.trim() };
    // POST /update/department/:id
    this.service.post(`update/department/${id}`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Department updated successfully!');
          this.closeModal('editDepartmentModal');
          this.isEditDeptSubmitted = false;
          this.selectedDepartment = null;
          this.getDepartments();
        }
      },
      error: () => this.toastr.error('Failed to update department.')
    });
  }

  // ── Designation ───────────────────────────────────────────
  initDesignationColumns() {
    this.designationColumnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', maxWidth: 70, sortable: false, filter: false },
      { headerName: 'Designation Name', field: 'designation_name', sortable: true, filter: true },
      {
        headerName: 'Action', field: 'action', sortable: false, filter: false,
        suppressMovable: true, maxWidth: 120,
        cellRenderer: (params: any) => {
          const wrapper = document.createElement('div');
          wrapper.classList.add('d-flex', 'gap-2', 'align-items-center', 'h-100');
          const editBtn = document.createElement('button');
          editBtn.type = 'button';
          editBtn.classList.add('btn', 'btn-sm');
          editBtn.style.backgroundColor = '#C8E3FF';
          editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
          editBtn.addEventListener('click', (e: Event) => { e.stopPropagation(); this.onEditDesignation(params.data); });
          wrapper.appendChild(editBtn);
          return wrapper;
        }
      }
    ];
  }

  onDesignationGridReady(params: { api: any }) { this.designationGridApi = params.api; }

  getDesignations() {
    // POST /fetch/designation
    this.service.post('fetch/designation', { company_id: this.selectedCompanyId }).subscribe(
      (res: any) => { this.designationRowData = res.status === 'success' ? res.data : []; },
      () => { this.designationRowData = []; }
    );
  }

  addDesignation() {
    this.isDesigSubmitted = true;
    if (this.designationForm.invalid) { this.toastr.error('Please enter a valid designation name.'); return; }
    const payload = { company_id: Number(this.designationForm.value.company_id), designation_name: this.designationForm.value.designation_name.trim() };
    // POST /create/designation
    this.service.post('create/designation', payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Designation added successfully!');
          this.closeModal('addDesignationModal');
          this.designationForm.reset();
          this.isDesigSubmitted = false;
          this.getDesignations();
        }
      },
      error: () => this.toastr.error('Failed to add designation.')
    });
  }

  onEditDesignation(desig: any) {
    this.selectedDesignation = desig;
    this.editDesignationForm.patchValue({
      company_id: desig.company_id,
      designation_name: desig.designation_name
    });
    this.openBootstrapModal('editDesignationModal');
  }

  updateDesignation() {
    this.isEditDesigSubmitted = true;
    if (this.editDesignationForm.invalid) { this.toastr.error('Please enter a valid designation name.'); return; }
    const id = this.selectedDesignation?.designation_id;
    const payload = { company_id: Number(this.selectedCompanyId), designation_name: this.editDesignationForm.value.designation_name.trim() };
    // POST /update/designation/:id
    this.service.post(`update/designation/${id}`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Designation updated successfully!');
          this.closeModal('editDesignationModal');
          this.isEditDesigSubmitted = false;
          this.selectedDesignation = null;
          this.getDesignations();
        }
      },
      error: () => this.toastr.error('Failed to update designation.')
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  openBootstrapModal(id: string) {
    const el = document.getElementById(id);
    if (el) new bootstrap.Modal(el).show();
  }

  closeModal(id: string) {
    const el = document.getElementById(id);
    if (el) { const i = bootstrap.Modal.getInstance(el); if (i) i.hide(); }
  }

  allowOnlyLetters(event: KeyboardEvent) {
    if (!/^[A-Za-z ]$/.test(event.key)) event.preventDefault();
  }
}