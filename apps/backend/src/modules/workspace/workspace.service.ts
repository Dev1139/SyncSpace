import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async getWorkspaces(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sort?: string,
    order: 'asc' | 'desc' = 'asc',
  ) {
    const skip = (page - 1) * limit;

    const where = {
      members: {
        some: { userId },
      },
      ...(search && {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };
    const orderBy = sort
      ? {
          [sort]: order,
        }
      : undefined;
    const [items, total] = await Promise.all([
      this.prisma.workspace.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          members: true,
        },
      }),
      this.prisma.workspace.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
    email: string,
    role: 'editor' | 'viewer',
  ) {
    try {
      // Find User
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      // Create Membership
      return await this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: user.id,
          role,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException(
          'User is already a member of this workspace',
        );
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
