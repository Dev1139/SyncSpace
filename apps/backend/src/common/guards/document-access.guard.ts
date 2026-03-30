import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.userId;
    const documentId = request.params.documentId;

    if (!userId || !documentId) {
      throw new ForbiddenException('Missing user or document');
    }

    const document = await this.prisma.document.findFirst({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: documentId,
        workspace: {
          members: {
            some: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              userId,
            },
          },
        },
      },
    });

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspace: {
          documents: {
            some: { id: documentId },
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied');
    }

    request.workspaceRole = membership.role;

    if (!document) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
