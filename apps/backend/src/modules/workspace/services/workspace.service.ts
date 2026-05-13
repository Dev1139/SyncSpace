import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, Role } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async getWorkspaces(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sort?: string,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.WorkspaceWhereInput = {
      members: {
        some: {
          userId,
        },
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
      : {
          updatedAt: 'desc' as const,
        };

    const [items, total] = await Promise.all([
      this.prisma.workspace.findMany({
        where,
        skip,
        take: limit,
        orderBy,

        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },

          _count: {
            select: {
              members: true,
              documents: true,
            },
          },
        },
      }),

      this.prisma.workspace.count({
        where,
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWorkspaceById(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },

      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },

        _count: {
          select: {
            members: true,
            documents: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async createWorkspace(name: string, userId: string) {
    return await this.prisma.workspace.create({
      data: {
        name,

        members: {
          create: {
            userId,
            role: Role.owner,
          },
        },
      },

      include: {
        members: true,

        _count: {
          select: {
            members: true,
            documents: true,
          },
        },
      },
    });
  }

  async updateWorkspace(workspaceId: string, body: UpdateWorkspaceDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },

      data: {
        name: body.name,
      },
    });
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (membership.role !== Role.owner) {
      throw new ForbiddenException('Only owner can delete workspace');
    }

    await this.prisma.$transaction([
      this.prisma.workspaceMember.deleteMany({
        where: {
          workspaceId,
        },
      }),

      this.prisma.document.deleteMany({
        where: {
          workspaceId,
        },
      }),

      this.prisma.workspace.delete({
        where: {
          id: workspaceId,
        },
      }),
    ]);

    return {
      message: 'Workspace deleted successfully',
    };
  }

  async inviteUser(workspaceId: string, email: string, role: Role) {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: user.id,
          role,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
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
      where: {
        workspaceId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
