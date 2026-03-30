import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { WorkspaceMemberGuard } from 'src/common/guards/workspace-member.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PaginationDto } from '../workspace/dto/pagination.dto';
import { DocumentAccessGuard } from 'src/common/guards/document-access.guard';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/workspaces/:workspaceId/documents')
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

  @Get(':documentId')
  @UseGuards(JwtAuthGuard, DocumentAccessGuard)
  getOne(@Param('documentId') documentId: string) {
    return this.documentService.getDocument(documentId);
  }

  @Post('/workspaces/:workspaceId/documents')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  create(
    @Param('workspaceId') workspaceId: string,
    @Body('title') title: string,
  ) {
    return this.documentService.createDocument(title, workspaceId);
  }

  @Patch(':documentId')
  @UseGuards(JwtAuthGuard, DocumentAccessGuard)
  update(
    @Param('documentId') documentId: string,
    @Body('content') content: string,
    @Body('plainText') plainText: string,
    @Req() req: any,
  ) {
    if (req.workspaceRole === 'viewer') {
      throw new ForbiddenException('No edit permission');
    }

    return this.documentService.updateDocument(documentId, content, plainText);
  }
}
