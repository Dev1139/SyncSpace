import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  findAll(@Body('userId') userId: string) {
    return this.workspaceService.getWorkspaces(userId);
  }

  @Post()
  create(@Body('name') name: string, @Body('userId') userId: string) {
    return this.workspaceService.createWorkspace(name, userId);
  }

  @Post(':workspaceId/invite')
  invite(
    @Param('workspaceId') workspaceId: string,
    @Body('userId') userId: string,
    @Body('role') role: 'editor' | 'viewer',
  ) {
    return this.workspaceService.inviteUser(workspaceId, userId, role);
  }
}
