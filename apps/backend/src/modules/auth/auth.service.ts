import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(email: string) {
    try {
      return await this.prisma.user.create({
        data: {
          email,
        },
      });
    } catch (error) {
      //Handle unique constraint
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Email already exits');
      }
      throw error;
    }
  }
}
