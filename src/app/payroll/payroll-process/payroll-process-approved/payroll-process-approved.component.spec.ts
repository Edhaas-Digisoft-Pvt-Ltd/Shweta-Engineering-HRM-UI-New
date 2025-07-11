import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollProcessApprovedComponent } from './payroll-process-approved.component';

describe('PayrollProcessApprovedComponent', () => {
  let component: PayrollProcessApprovedComponent;
  let fixture: ComponentFixture<PayrollProcessApprovedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollProcessApprovedComponent]
    });
    fixture = TestBed.createComponent(PayrollProcessApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
