import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { WorkspaceService } from '../services/workspace.service';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/common/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { PaginationDto } from '../dto/pagination.dto';
import { WorkspaceParamDto } from '../dto/workspace-param.dto';
import { InviteUserDto } from '../dto/invite-user.dto';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // Dashboard workspaces
  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query() query: PaginationDto,
  ) {
    return this.workspaceService.getWorkspaces(
      user.userId,
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.order,
    );
  }

  // Single workspace details
  @Get(':workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  findOne(@Param() params: WorkspaceParamDto) {
    return this.workspaceService.getWorkspaceById(params.workspaceId);
  }

  // Create workspace
  @Post()
  create(
    @Body() body: CreateWorkspaceDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.workspaceService.createWorkspace(body.name, user.userId);
  }

  // Update workspace
  @Patch(':workspaceId')
  @UseGuards(WorkspaceRoleGuard)
  update(@Param() params: WorkspaceParamDto, @Body() body: UpdateWorkspaceDto) {
    return this.workspaceService.updateWorkspace(params.workspaceId, body);
  }

  // Delete workspace
  @Delete(':workspaceId')
  @UseGuards(WorkspaceRoleGuard)
  remove(
    @Param() params: WorkspaceParamDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.workspaceService.deleteWorkspace(
      params.workspaceId,
      user.userId,
    );
  }

  // Members list
  @Get(':workspaceId/members')
  @UseGuards(WorkspaceMemberGuard)
  getMembers(@Param() params: WorkspaceParamDto) {
    return this.workspaceService.getWorkspaceMembers(params.workspaceId);
  }

  // Invite user
  @Post(':workspaceId/invite')
  @UseGuards(WorkspaceRoleGuard)
  invite(@Param() params: WorkspaceParamDto, @Body() body: InviteUserDto) {
    return this.workspaceService.inviteUser(
      params.workspaceId,
      body.email,
      body.role,
    );
  }
}
