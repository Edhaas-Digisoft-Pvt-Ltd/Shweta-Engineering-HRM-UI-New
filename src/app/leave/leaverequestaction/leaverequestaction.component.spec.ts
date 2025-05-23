import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaverequestactionComponent } from './leaverequestaction.component';

describe('LeaverequestactionComponent', () => {
  let component: LeaverequestactionComponent;
  let fixture: ComponentFixture<LeaverequestactionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaverequestactionComponent]
    });
    fixture = TestBed.createComponent(LeaverequestactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
