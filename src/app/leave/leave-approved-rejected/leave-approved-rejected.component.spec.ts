import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveApprovedRejectedComponent } from './leave-approved-rejected.component';

describe('LeaveApprovedRejectedComponent', () => {
  let component: LeaveApprovedRejectedComponent;
  let fixture: ComponentFixture<LeaveApprovedRejectedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveApprovedRejectedComponent]
    });
    fixture = TestBed.createComponent(LeaveApprovedRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
