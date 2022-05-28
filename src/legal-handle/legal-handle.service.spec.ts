import { Test, TestingModule } from '@nestjs/testing';
import { LegalHandleService } from './legal-handle.service';

describe('LegalHandleService', () => {
  let service: LegalHandleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalHandleService],
    }).compile();

    service = module.get<LegalHandleService>(LegalHandleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
