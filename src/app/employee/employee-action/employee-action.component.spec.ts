import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeActionComponent } from './employee-action.component';

describe('EmployeeActionComponent', () => {
  let component: EmployeeActionComponent;
  let fixture: ComponentFixture<EmployeeActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeActionComponent]
    });
    fixture = TestBed.createComponent(EmployeeActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
