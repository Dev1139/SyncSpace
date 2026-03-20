import { IsUUID, IsEnum } from 'class-validator';

export enum Role {
  editor = 'editor',
  viewer = 'viewer',
}

export class InviteUserDto {
  @IsUUID()
  userId: string;

  @IsEnum(Role)
  role: Role;
}
