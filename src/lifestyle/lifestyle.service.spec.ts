import { Test, TestingModule } from '@nestjs/testing';
import { LifeStyleService} from './lifestyle.service';

describe('LifestyleService', () => {
  let service: LifeStyleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LifeStyleService],
    }).compile();

    service = module.get<LifeStyleService>(LifeStyleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
