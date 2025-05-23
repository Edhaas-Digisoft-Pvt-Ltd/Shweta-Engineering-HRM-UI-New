import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceActionComponent } from './attendance-action.component';

describe('AttendanceActionComponent', () => {
  let component: AttendanceActionComponent;
  let fixture: ComponentFixture<AttendanceActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceActionComponent]
    });
    fixture = TestBed.createComponent(AttendanceActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
