import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleanSettingComponent } from './boolean-setting.component';

describe('BooleanSettingComponent', () => {
  let component: BooleanSettingComponent;
  let fixture: ComponentFixture<BooleanSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BooleanSettingComponent]
    });
    fixture = TestBed.createComponent(BooleanSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
