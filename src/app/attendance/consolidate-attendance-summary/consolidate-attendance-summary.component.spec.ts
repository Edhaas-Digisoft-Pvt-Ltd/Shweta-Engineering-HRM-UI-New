import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidateAttendanceSummaryComponent } from './consolidate-attendance-summary.component';

describe('ConsolidateAttendanceSummaryComponent', () => {
  let component: ConsolidateAttendanceSummaryComponent;
  let fixture: ComponentFixture<ConsolidateAttendanceSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsolidateAttendanceSummaryComponent]
    });
    fixture = TestBed.createComponent(ConsolidateAttendanceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
