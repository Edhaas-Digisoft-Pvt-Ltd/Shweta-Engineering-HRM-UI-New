import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompnaySetupComponent } from './compnay-setup.component';

describe('CompnaySetupComponent', () => {
  let component: CompnaySetupComponent;
  let fixture: ComponentFixture<CompnaySetupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompnaySetupComponent]
    });
    fixture = TestBed.createComponent(CompnaySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
