import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBonusAndIncentiveComponent } from './edit-bonus-and-incentive.component';

describe('EditBonusAndIncentiveComponent', () => {
  let component: EditBonusAndIncentiveComponent;
  let fixture: ComponentFixture<EditBonusAndIncentiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditBonusAndIncentiveComponent]
    });
    fixture = TestBed.createComponent(EditBonusAndIncentiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
