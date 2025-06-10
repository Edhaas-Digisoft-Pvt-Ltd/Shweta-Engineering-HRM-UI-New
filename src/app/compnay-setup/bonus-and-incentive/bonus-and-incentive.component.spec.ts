import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusAndIncentiveComponent } from './bonus-and-incentive.component';

describe('BonusAndIncentiveComponent', () => {
  let component: BonusAndIncentiveComponent;
  let fixture: ComponentFixture<BonusAndIncentiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BonusAndIncentiveComponent]
    });
    fixture = TestBed.createComponent(BonusAndIncentiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
