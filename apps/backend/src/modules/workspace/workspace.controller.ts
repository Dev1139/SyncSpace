import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceMemberGuard } from 'src/common/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';
import { InviteUserDto } from './dto/invite-user.dto';
import { WorkspaceParamDto } from './dto/workspace-param.dto';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  findAll(@Body('userId') userId: string) {
    return this.workspaceService.getWorkspaces(userId);
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceMemberGuard)
  getMembers(@Param('workspaceId') params: WorkspaceParamDto) {
    return this.workspaceService.getWorkspaceMembers(params.workspaceId);
  }

  @Post()
  create(@Body('name') name: string, @Headers('x-user-id') userId: string) {
    return this.workspaceService.createWorkspace(name, userId);
  }

  @Post(':workspaceId/invite')
  @UseGuards(WorkspaceRoleGuard)
  invite(
    @Param('workspaceId') workspaceId: string,
    @Body() body: InviteUserDto,
    @Req() req: any,
  ) {
    const currentRole = req.workspaceRole;

    if (currentRole === 'viewer') {
      throw new ForbiddenException('You do not have permission to invite');
    }

    return this.workspaceService.inviteUser(
      workspaceId,
      body.userId,
      body.role,
    );
  }
}
