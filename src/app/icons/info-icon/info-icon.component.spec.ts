import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIconComponent } from './info-icon.component';

describe('InfoIconComponent', () => {
  let component: InfoIconComponent;
  let fixture: ComponentFixture<InfoIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoIconComponent]
    });
    fixture = TestBed.createComponent(InfoIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
