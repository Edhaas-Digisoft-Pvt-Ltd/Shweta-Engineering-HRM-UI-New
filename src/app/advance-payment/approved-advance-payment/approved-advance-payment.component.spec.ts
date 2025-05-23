import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedAdvancePaymentComponent } from './approved-advance-payment.component';

describe('ApprovedAdvancePaymentComponent', () => {
  let component: ApprovedAdvancePaymentComponent;
  let fixture: ComponentFixture<ApprovedAdvancePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovedAdvancePaymentComponent]
    });
    fixture = TestBed.createComponent(ApprovedAdvancePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
