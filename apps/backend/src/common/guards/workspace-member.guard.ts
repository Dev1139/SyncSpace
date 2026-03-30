import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.userId;
    const workspaceId = request.params.workspaceId;

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
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
