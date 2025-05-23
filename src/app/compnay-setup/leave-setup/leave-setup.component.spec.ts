import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSetupComponent } from './leave-setup.component';

describe('LeaveSetupComponent', () => {
  let component: LeaveSetupComponent;
  let fixture: ComponentFixture<LeaveSetupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveSetupComponent]
    });
    fixture = TestBed.createComponent(LeaveSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
