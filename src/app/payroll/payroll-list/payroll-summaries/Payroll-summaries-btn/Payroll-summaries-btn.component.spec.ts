import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollSummariesBtnComponent } from './Payroll-summaries-btn.component';

describe('PayrollSummariesBtnComponent', () => {
  let component: PayrollSummariesBtnComponent;
  let fixture: ComponentFixture<PayrollSummariesBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollSummariesBtnComponent]
    });
    fixture = TestBed.createComponent(PayrollSummariesBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
