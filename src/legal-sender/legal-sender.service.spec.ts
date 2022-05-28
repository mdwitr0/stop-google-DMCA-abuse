import { Test, TestingModule } from '@nestjs/testing';
import { LegalSenderService } from './legal-sender.service';

describe('LegalSenderService', () => {
  let service: LegalSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalSenderService],
    }).compile();

    service = module.get<LegalSenderService>(LegalSenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
