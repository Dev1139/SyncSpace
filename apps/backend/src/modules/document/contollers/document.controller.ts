import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DocumentService } from '../services/document.service';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/common/guards/workspace-member.guard';
import { DocumentAccessGuard } from 'src/common/guards/document-access.guard';

import { PaginationDto } from '../../workspace/dto/pagination.dto';

import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { UpdateDocumentTitleDto } from '../dto/update-document-title.dto';

@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Get all documents of workspace
  @Get('workspace/:workspaceId/documents')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  getDocuments(
    @Param('workspaceId') workspaceId: string,
    @Query() query: PaginationDto,
  ) {
    return this.documentService.getDocuments(
      workspaceId,
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.order,
    );
  }

  // Get single document
  @Get('documents/:documentId')
  @UseGuards(JwtAuthGuard, DocumentAccessGuard)
  getOne(@Param('documentId') documentId: string) {
    return this.documentService.getDocument(documentId);
  }

  // Create document
  @Post('workspace/:workspaceId/documents')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() body: CreateDocumentDto,
  ) {
    return this.documentService.createDocument(body.title, workspaceId);
  }

  // Update document content
  @Patch('documents/:documentId')
  @UseGuards(JwtAuthGuard, DocumentAccessGuard)
  update(
    @Param('documentId') documentId: string,
    @Body() body: UpdateDocumentDto,
    @Req() req: any,
  ) {
    if (req.workspaceRole === 'viewer') {
      throw new ForbiddenException('No edit permission');
    }

    return this.documentService.updateDocument(
      documentId,
      body.content,
      body.plainText,
    );
  }

  // Update document title
  @Patch('documents/:documentId/title')
  @UseGuards(JwtAuthGuard, DocumentAccessGuard)
  updateTitle(
    @Param('documentId') documentId: string,
    @Body() body: UpdateDocumentTitleDto,
    @Req() req: any,
  ) {
    if (req.workspaceRole === 'viewer') {
      throw new ForbiddenException('No edit permission');
    }

    return this.documentService.updateTitle(documentId, body.title);
  }

  // Delete document
  @Delete('documents/:documentId')
  @UseGuards(JwtAuthGuard, DocumentAccessGuard)
  delete(@Param('documentId') documentId: string, @Req() req: any) {
    if (req.workspaceRole === 'viewer') {
      throw new ForbiddenException('No delete permission');
    }

    return this.documentService.deleteDocument(documentId);
  }
}
