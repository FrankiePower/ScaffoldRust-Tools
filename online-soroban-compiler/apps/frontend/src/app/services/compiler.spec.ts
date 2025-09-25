import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CompilerService } from './compiler';

describe('CompilerService', () => {
  let service: CompilerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CompilerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
