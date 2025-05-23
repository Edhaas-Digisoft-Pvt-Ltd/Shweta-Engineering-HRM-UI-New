import { TestBed } from '@angular/core/testing';

import { HrmserviceService } from './hrmservice.service';

describe('HrmserviceService', () => {
  let service: HrmserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrmserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
