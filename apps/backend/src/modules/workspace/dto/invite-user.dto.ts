import { IsEmail, IsEnum } from 'class-validator';

export enum WorkspaceRole {
  editor = 'editor',
  viewer = 'viewer',
}

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
