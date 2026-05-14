import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './contollers/document.controller';
import { DocumentService } from './services/document.service';
import { DocumentAccessGuard } from 'src/common/guards/document-access.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/common/guards/workspace-member.guard';

describe('DocumentController', () => {
  let controller: DocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [{ provide: DocumentService, useValue: {} }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceMemberGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(DocumentAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentController>(DocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
