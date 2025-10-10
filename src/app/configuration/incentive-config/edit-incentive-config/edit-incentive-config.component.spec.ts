import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIncentiveConfigComponent } from './edit-incentive-config.component';

describe('EditIncentiveConfigComponent', () => {
  let component: EditIncentiveConfigComponent;
  let fixture: ComponentFixture<EditIncentiveConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditIncentiveConfigComponent]
    });
    fixture = TestBed.createComponent(EditIncentiveConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
