import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsufficientLeavesComponent } from './insufficient-leaves.component';

describe('InsufficientLeavesComponent', () => {
  let component: InsufficientLeavesComponent;
  let fixture: ComponentFixture<InsufficientLeavesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InsufficientLeavesComponent]
    });
    fixture = TestBed.createComponent(InsufficientLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
