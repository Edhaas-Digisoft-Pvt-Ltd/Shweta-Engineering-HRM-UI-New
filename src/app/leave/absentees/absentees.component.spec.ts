import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenteesComponent } from './absentees.component';

describe('AbsenteesComponent', () => {
  let component: AbsenteesComponent;
  let fixture: ComponentFixture<AbsenteesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbsenteesComponent]
    });
    fixture = TestBed.createComponent(AbsenteesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
