import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonuseAndInsentiveReportsComponent } from './bonuse-and-insentive-reports.component';

describe('BonuseAndInsentiveReportsComponent', () => {
  let component: BonuseAndInsentiveReportsComponent;
  let fixture: ComponentFixture<BonuseAndInsentiveReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BonuseAndInsentiveReportsComponent]
    });
    fixture = TestBed.createComponent(BonuseAndInsentiveReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
