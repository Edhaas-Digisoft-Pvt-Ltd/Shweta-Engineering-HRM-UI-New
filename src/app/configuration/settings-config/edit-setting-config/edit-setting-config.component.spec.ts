import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSettingConfigComponent } from './edit-setting-config.component';

describe('EditSettingConfigComponent', () => {
  let component: EditSettingConfigComponent;
  let fixture: ComponentFixture<EditSettingConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSettingConfigComponent]
    });
    fixture = TestBed.createComponent(EditSettingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
