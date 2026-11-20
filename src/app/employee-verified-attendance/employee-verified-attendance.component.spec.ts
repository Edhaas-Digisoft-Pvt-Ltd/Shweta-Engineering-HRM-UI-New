import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeVerifiedAttendanceComponent } from './employee-verified-attendance.component';

describe('EmployeeVerifiedAttendanceComponent', () => {
  let component: EmployeeVerifiedAttendanceComponent;
  let fixture: ComponentFixture<EmployeeVerifiedAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeVerifiedAttendanceComponent]
    });
    fixture = TestBed.createComponent(EmployeeVerifiedAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
