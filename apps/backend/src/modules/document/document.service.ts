import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async getDocuments(
    workspaceId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sort: string = 'updatedAt',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    //restrict sort fields (important)
    const allowedSortFields = ['title', 'createdAt', 'updatedAt'];
    const safeSort = allowedSortFields.includes(sort) ? sort : 'updatedAt';

    const where: Prisma.DocumentWhereInput = {
      workspaceId,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            plainText: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [safeSort]: order,
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDocument(documentId: string) {
    return await this.prisma.document.findUnique({
      where: { id: documentId },
    });
  }

  async createDocument(title: string, workspaceId: string) {
    return await this.prisma.document.create({
      data: {
        title,
        workspaceId,
        content: new Uint8Array(),
        plainText: '',
      },
    });
  }

  async updateDocument(documentId: string, content: string, plainText: string) {
    return await this.prisma.document.update({
      where: { id: documentId },
      data: {
        content: new TextEncoder().encode(content),
        plainText,
      },
    });
  }

  async updateTitle(documentId: string, title: string) {
    return this.prisma.document.update({
      where: { id: documentId },
      data: { title },
    });
  }

  async deleteDocument(documentId: string) {
    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }
}
