import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './services/document.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
