import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewcalenderComponent } from './newcalender.component';

describe('NewcalenderComponent', () => {
  let component: NewcalenderComponent;
  let fixture: ComponentFixture<NewcalenderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewcalenderComponent]
    });
    fixture = TestBed.createComponent(NewcalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
