import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollActionBtnComponent } from './payroll-action-btn.component';

describe('PayrollActionBtnComponent', () => {
  let component: PayrollActionBtnComponent;
  let fixture: ComponentFixture<PayrollActionBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollActionBtnComponent]
    });
    fixture = TestBed.createComponent(PayrollActionBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
