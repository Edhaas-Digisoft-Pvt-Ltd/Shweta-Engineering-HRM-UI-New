import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollStatusComponent } from './payroll-status.component';

describe('PayrollStatusComponent', () => {
  let component: PayrollStatusComponent;
  let fixture: ComponentFixture<PayrollStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollStatusComponent]
    });
    fixture = TestBed.createComponent(PayrollStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
