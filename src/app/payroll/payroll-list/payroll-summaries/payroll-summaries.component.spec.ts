import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollSummariesComponent } from './payroll-summaries.component';

describe('PayrollSummariesComponent', () => {
  let component: PayrollSummariesComponent;
  let fixture: ComponentFixture<PayrollSummariesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollSummariesComponent]
    });
    fixture = TestBed.createComponent(PayrollSummariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
