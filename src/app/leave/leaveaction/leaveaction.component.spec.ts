import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveactionComponent } from './leaveaction.component';

describe('LeaveactionComponent', () => {
  let component: LeaveactionComponent;
  let fixture: ComponentFixture<LeaveactionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveactionComponent]
    });
    fixture = TestBed.createComponent(LeaveactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
