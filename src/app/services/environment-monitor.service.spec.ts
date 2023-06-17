import { TestBed } from '@angular/core/testing';

import { EnvironmentMonitorService } from './environment-monitor.service';

describe('EnvironmentMonitorService', () => {
  let service: EnvironmentMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
