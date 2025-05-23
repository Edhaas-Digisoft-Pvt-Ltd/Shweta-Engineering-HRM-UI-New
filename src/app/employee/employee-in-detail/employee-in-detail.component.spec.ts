import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInDetailComponent } from './employee-in-detail.component';

describe('EmployeeInDetailComponent', () => {
  let component: EmployeeInDetailComponent;
  let fixture: ComponentFixture<EmployeeInDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeInDetailComponent]
    });
    fixture = TestBed.createComponent(EmployeeInDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
