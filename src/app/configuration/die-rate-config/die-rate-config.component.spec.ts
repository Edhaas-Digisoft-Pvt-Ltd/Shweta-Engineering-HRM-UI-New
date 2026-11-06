import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DieRateConfigComponent } from './die-rate-config.component';

describe('DieRateConfigComponent', () => {
  let component: DieRateConfigComponent;
  let fixture: ComponentFixture<DieRateConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DieRateConfigComponent]
    });
    fixture = TestBed.createComponent(DieRateConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
