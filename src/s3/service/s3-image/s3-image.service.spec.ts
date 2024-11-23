import { Test, TestingModule } from '@nestjs/testing';
import { S3ImageService } from './s3-image.service';

describe('S3ImageService', () => {
  let service: S3ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3ImageService],
    }).compile();

    service = module.get<S3ImageService>(S3ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
