import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBonusAndIncentiveComponent } from './manage-bonus-and-incentive.component';

describe('ManageBonusAndIncentiveComponent', () => {
  let component: ManageBonusAndIncentiveComponent;
  let fixture: ComponentFixture<ManageBonusAndIncentiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageBonusAndIncentiveComponent]
    });
    fixture = TestBed.createComponent(ManageBonusAndIncentiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
