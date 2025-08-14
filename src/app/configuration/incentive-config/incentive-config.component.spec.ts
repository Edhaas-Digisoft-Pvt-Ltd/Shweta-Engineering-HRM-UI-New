import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveConfigComponent } from './incentive-config.component';

describe('IncentiveConfigComponent', () => {
  let component: IncentiveConfigComponent;
  let fixture: ComponentFixture<IncentiveConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncentiveConfigComponent]
    });
    fixture = TestBed.createComponent(IncentiveConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
