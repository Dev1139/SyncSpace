import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.headers['x-user-id'];
    const workspaceId = request.params.workspaceId;
    console.log('GUARD HIT');
    console.log('userId:', userId);
    console.log('workspaceId:', workspaceId);

    if (!userId || !workspaceId) {
      throw new ForbiddenException('Missing user or workspace');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a workspace member');
    }

    // Attach role to request for later use
    request.workspaceRole = membership.role;

    return true;
  }
}
