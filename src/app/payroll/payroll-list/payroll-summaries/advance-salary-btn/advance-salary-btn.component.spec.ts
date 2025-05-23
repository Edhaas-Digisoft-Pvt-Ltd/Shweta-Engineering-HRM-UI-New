import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceSalaryBtnComponent } from './advance-salary-btn.component';

describe('AdvanceSalaryBtnComponent', () => {
  let component: AdvanceSalaryBtnComponent;
  let fixture: ComponentFixture<AdvanceSalaryBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceSalaryBtnComponent]
    });
    fixture = TestBed.createComponent(AdvanceSalaryBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
