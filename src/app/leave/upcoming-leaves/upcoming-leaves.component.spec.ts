import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingLeavesComponent } from './upcoming-leaves.component';

describe('UpcomingLeavesComponent', () => {
  let component: UpcomingLeavesComponent;
  let fixture: ComponentFixture<UpcomingLeavesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpcomingLeavesComponent]
    });
    fixture = TestBed.createComponent(UpcomingLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
