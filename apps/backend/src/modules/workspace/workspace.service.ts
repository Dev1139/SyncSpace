import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async getWorkspaces(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async createWorkspace(name: string, userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.workspace.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async inviteUser(
    workspaceId: string,
    userId: string,
    role: 'editor' | 'viewer',
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
    });
  }
}
