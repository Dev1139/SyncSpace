import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  plainText: string;
}
