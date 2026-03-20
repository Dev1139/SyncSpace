import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async getWorkspaces(userId: string) {
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
    try {
      return await this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId,
          role,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('User already in workspace');
      }
      throw error;
    }
  }

  async getWorkspaceMembers(workspaceId: string) {
    return await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: true,
      },
    });
  }
}
