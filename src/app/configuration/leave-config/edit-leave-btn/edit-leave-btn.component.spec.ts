import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLeaveBtnComponent } from './edit-leave-btn.component';

describe('EditLeaveBtnComponent', () => {
  let component: EditLeaveBtnComponent;
  let fixture: ComponentFixture<EditLeaveBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditLeaveBtnComponent]
    });
    fixture = TestBed.createComponent(EditLeaveBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
