import { TestBed } from '@angular/core/testing';

import { VpsService } from './vps.service';

describe('VpsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VpsService = TestBed.get(VpsService);
    expect(service).toBeTruthy();
  });
});
