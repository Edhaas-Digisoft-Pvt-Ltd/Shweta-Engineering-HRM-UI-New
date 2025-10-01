import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestBonusConfigComponent } from './test-bonus-config.component';

describe('TestBonusConfigComponent', () => {
  let component: TestBonusConfigComponent;
  let fixture: ComponentFixture<TestBonusConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestBonusConfigComponent]
    });
    fixture = TestBed.createComponent(TestBonusConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
