import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

import { sanitizeUser } from '../utils/sanitize-user';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(body: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
      });

      // Create default workspace
      const workspace = await this.prisma.workspace.create({
        data: {
          name: `${user.name}'s Workspace`,
          members: {
            create: {
              userId: user.id,
              role: 'owner',
            },
          },
        },
      });

      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };

      const token = this.jwtService.sign(payload);

      return {
        user: sanitizeUser(user),
        workspace,
        access_token: token,
      };
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async login(body: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: sanitizeUser(user),
      access_token: token,
    };
  }
}
