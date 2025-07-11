import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollProcessRejectedComponent } from './payroll-process-rejected.component';

describe('PayrollProcessRejectedComponent', () => {
  let component: PayrollProcessRejectedComponent;
  let fixture: ComponentFixture<PayrollProcessRejectedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollProcessRejectedComponent]
    });
    fixture = TestBed.createComponent(PayrollProcessRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
