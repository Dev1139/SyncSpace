import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async getDocuments(
    workspaceId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sort: string = 'updatedAt',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    // Restrict sortable fields
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

        // IMPORTANT:
        // Do not send binary content
        // in document list/sidebar APIs
        select: {
          id: true,
          title: true,
          plainText: true,
          workspaceId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      this.prisma.document.count({
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

  async getDocument(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async createDocument(title: string, workspaceId: string) {
    return await this.prisma.document.create({
      data: {
        title,
        workspaceId,

        // Initial empty collaborative state
        content: new Uint8Array(),

        // Used for search/indexing
        plainText: '',
      },
    });
  }

  async updateDocument(documentId: string, content: string, plainText: string) {
    const existingDocument = await this.prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      throw new NotFoundException('Document not found');
    }

    return await this.prisma.document.update({
      where: {
        id: documentId,
      },

      data: {
        // Collaborative editor binary state
        content: new TextEncoder().encode(content),

        // Searchable plain text projection
        plainText,
      },
    });
  }

  async updateTitle(documentId: string, title: string) {
    const existingDocument = await this.prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      throw new NotFoundException('Document not found');
    }

    return await this.prisma.document.update({
      where: {
        id: documentId,
      },

      data: {
        title,
      },
    });
  }

  async deleteDocument(documentId: string) {
    const existingDocument = await this.prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      throw new NotFoundException('Document not found');
    }

    return await this.prisma.document.delete({
      where: {
        id: documentId,
      },
    });
  }
}
