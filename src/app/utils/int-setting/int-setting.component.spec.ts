import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntSettingComponent } from './int-setting.component';

describe('IntSettingComponent', () => {
  let component: IntSettingComponent;
  let fixture: ComponentFixture<IntSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntSettingComponent]
    });
    fixture = TestBed.createComponent(IntSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
