import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSetupBtnComponent } from './leave-setup-btn.component';

describe('LeaveSetupBtnComponent', () => {
  let component: LeaveSetupBtnComponent;
  let fixture: ComponentFixture<LeaveSetupBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveSetupBtnComponent]
    });
    fixture = TestBed.createComponent(LeaveSetupBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
