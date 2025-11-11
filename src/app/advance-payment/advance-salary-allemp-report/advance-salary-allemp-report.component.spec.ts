import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceSalaryAllempReportComponent } from './advance-salary-allemp-report.component';

describe('AdvanceSalaryAllempReportComponent', () => {
  let component: AdvanceSalaryAllempReportComponent;
  let fixture: ComponentFixture<AdvanceSalaryAllempReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceSalaryAllempReportComponent]
    });
    fixture = TestBed.createComponent(AdvanceSalaryAllempReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
