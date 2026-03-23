import { IsEmail, IsEnum } from 'class-validator';

export enum Role {
  editor = 'editor',
  viewer = 'viewer',
}

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;
}
