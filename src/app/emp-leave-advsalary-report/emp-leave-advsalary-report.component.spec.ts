import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpLeaveAdvsalaryReportComponent } from './emp-leave-advsalary-report.component';

describe('EmpLeaveAdvsalaryReportComponent', () => {
  let component: EmpLeaveAdvsalaryReportComponent;
  let fixture: ComponentFixture<EmpLeaveAdvsalaryReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpLeaveAdvsalaryReportComponent]
    });
    fixture = TestBed.createComponent(EmpLeaveAdvsalaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
