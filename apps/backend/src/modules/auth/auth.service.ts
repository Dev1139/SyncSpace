import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string) {
    try {
      const user = await this.prisma.user.create({
        data: { email },
      });

      const payload = {
        sub: user.id,
        email: user.email,
      };

      const token = this.jwtService.sign(payload);

      return {
        access_token: token,
      };
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user,
      access_token: token,
    };
  }
}
