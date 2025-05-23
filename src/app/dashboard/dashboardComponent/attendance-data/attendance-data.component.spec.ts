import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceDataComponent } from './attendance-data.component';

describe('AttendanceDataComponent', () => {
  let component: AttendanceDataComponent;
  let fixture: ComponentFixture<AttendanceDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceDataComponent]
    });
    fixture = TestBed.createComponent(AttendanceDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
