import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugIconComponent } from './debug-icon.component';

describe('DebugIconComponent', () => {
  let component: DebugIconComponent;
  let fixture: ComponentFixture<DebugIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DebugIconComponent]
    });
    fixture = TestBed.createComponent(DebugIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
