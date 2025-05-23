import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollProcessComponent } from './payroll-process.component';

describe('PayrollProcessComponent', () => {
  let component: PayrollProcessComponent;
  let fixture: ComponentFixture<PayrollProcessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollProcessComponent]
    });
    fixture = TestBed.createComponent(PayrollProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
