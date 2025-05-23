import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComMangeAndPoliciesComponent } from './com-mange-and-policies.component';

describe('ComMangeAndPoliciesComponent', () => {
  let component: ComMangeAndPoliciesComponent;
  let fixture: ComponentFixture<ComMangeAndPoliciesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComMangeAndPoliciesComponent]
    });
    fixture = TestBed.createComponent(ComMangeAndPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
