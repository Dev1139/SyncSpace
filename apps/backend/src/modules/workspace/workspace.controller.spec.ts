import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceService } from './services/workspace.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/common/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [{ provide: WorkspaceService, useValue: {} }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceMemberGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
