import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryIncrementComponent } from './salary-increment.component';

describe('SalaryIncrementComponent', () => {
  let component: SalaryIncrementComponent;
  let fixture: ComponentFixture<SalaryIncrementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaryIncrementComponent]
    });
    fixture = TestBed.createComponent(SalaryIncrementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
