import { IsUUID } from 'class-validator';

export class WorkspaceParamDto {
  @IsUUID()
  workspaceId: string;
}
