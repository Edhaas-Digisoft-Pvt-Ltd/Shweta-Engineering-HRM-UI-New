import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedSalaryReportComponent } from './approved-salary-report.component';

describe('ApprovedSalaryReportComponent', () => {
  let component: ApprovedSalaryReportComponent;
  let fixture: ComponentFixture<ApprovedSalaryReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovedSalaryReportComponent]
    });
    fixture = TestBed.createComponent(ApprovedSalaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
