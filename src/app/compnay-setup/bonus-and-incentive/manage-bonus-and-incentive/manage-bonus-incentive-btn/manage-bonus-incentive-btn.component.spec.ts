import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBonusIncentiveBtnComponent } from './manage-bonus-incentive-btn.component';

describe('ManageBonusIncentiveBtnComponent', () => {
  let component: ManageBonusIncentiveBtnComponent;
  let fixture: ComponentFixture<ManageBonusIncentiveBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageBonusIncentiveBtnComponent]
    });
    fixture = TestBed.createComponent(ManageBonusIncentiveBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
