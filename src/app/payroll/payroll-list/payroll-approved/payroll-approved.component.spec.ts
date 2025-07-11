import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollApprovedComponent } from './payroll-approved.component';

describe('PayrollApprovedComponent', () => {
  let component: PayrollApprovedComponent;
  let fixture: ComponentFixture<PayrollApprovedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollApprovedComponent]
    });
    fixture = TestBed.createComponent(PayrollApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
