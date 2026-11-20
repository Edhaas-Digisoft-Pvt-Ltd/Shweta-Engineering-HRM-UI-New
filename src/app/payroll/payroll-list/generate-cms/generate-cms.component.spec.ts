import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCmsComponent } from './generate-cms.component';

describe('GenerateCmsComponent', () => {
  let component: GenerateCmsComponent;
  let fixture: ComponentFixture<GenerateCmsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateCmsComponent]
    });
    fixture = TestBed.createComponent(GenerateCmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
