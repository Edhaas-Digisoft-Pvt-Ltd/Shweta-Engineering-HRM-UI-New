import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAttendanceComponent } from './verify-attendance.component';

describe('VerifyAttendanceComponent', () => {
  let component: VerifyAttendanceComponent;
  let fixture: ComponentFixture<VerifyAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerifyAttendanceComponent]
    });
    fixture = TestBed.createComponent(VerifyAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
