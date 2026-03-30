import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { DocumentModule } from './modules/document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    WorkspaceModule,
    DocumentModule,
  ],
  providers: [],
})
export class AppModule {}
