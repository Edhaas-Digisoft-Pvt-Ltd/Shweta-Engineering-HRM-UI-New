import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRejectedComponent } from './payroll-rejected.component';

describe('PayrollRejectedComponent', () => {
  let component: PayrollRejectedComponent;
  let fixture: ComponentFixture<PayrollRejectedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollRejectedComponent]
    });
    fixture = TestBed.createComponent(PayrollRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
