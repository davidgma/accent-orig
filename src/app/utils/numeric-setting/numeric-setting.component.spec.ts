import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericSettingComponent } from './numeric-setting.component';

describe('NumericSettingComponent', () => {
  let component: NumericSettingComponent;
  let fixture: ComponentFixture<NumericSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NumericSettingComponent]
    });
    fixture = TestBed.createComponent(NumericSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
