import { Test, TestingModule } from '@nestjs/testing';
import { ProductQuotationsController } from './product-quotations.controller';

describe('ProductQuotationsController', () => {
  let controller: ProductQuotationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductQuotationsController],
    }).compile();

    controller = module.get<ProductQuotationsController>(ProductQuotationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
