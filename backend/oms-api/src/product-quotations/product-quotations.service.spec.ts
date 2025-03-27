import { Test, TestingModule } from '@nestjs/testing';
import { ProductQuotationsService } from './product-quotations.service';

describe('ProductQuotationsService', () => {
  let service: ProductQuotationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductQuotationsService],
    }).compile();

    service = module.get<ProductQuotationsService>(ProductQuotationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
