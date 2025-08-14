import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusConfigComponent } from './bonus-config.component';

describe('BonusConfigComponent', () => {
  let component: BonusConfigComponent;
  let fixture: ComponentFixture<BonusConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BonusConfigComponent]
    });
    fixture = TestBed.createComponent(BonusConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
