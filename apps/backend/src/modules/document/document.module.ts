import { Module } from '@nestjs/common';
import { DocumentController } from './contollers/document.controller';
import { DocumentService } from './services/document.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
