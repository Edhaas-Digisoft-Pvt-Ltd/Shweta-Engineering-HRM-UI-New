import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryRevisionComponent } from './salary-revision.component';

describe('SalaryRevisionComponent', () => {
  let component: SalaryRevisionComponent;
  let fixture: ComponentFixture<SalaryRevisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaryRevisionComponent]
    });
    fixture = TestBed.createComponent(SalaryRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
