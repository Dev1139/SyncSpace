import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceMemberGuard } from 'src/common/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';
import { InviteUserDto } from './dto/invite-user.dto';
import { WorkspaceParamDto } from './dto/workspace-param.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PaginationDto } from './dto/pagination.dto';

@Controller('workspace')
@UseGuards(JwtAuthGuard) // protect all routes
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  findAll(@Req() req: any, @Query() query: PaginationDto) {
    const userId = req.user.userId;

    return this.workspaceService.getWorkspaces(
      userId,
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.order,
    );
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceMemberGuard)
  getMembers(@Param() params: WorkspaceParamDto) {
    return this.workspaceService.getWorkspaceMembers(params.workspaceId);
  }

  @Post()
  create(@Body('name') name: string, @Req() req: any) {
    const userId = req.user.userId;
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

    return this.workspaceService.inviteUser(workspaceId, body.email, body.role);
  }
}
