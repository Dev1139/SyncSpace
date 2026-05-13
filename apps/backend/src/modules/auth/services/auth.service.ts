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
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

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

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: sanitizeUser(user),
    };
  }

  async updatePassword(userId: string, body: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      body.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password updated successfully',
    };
  }

  async updateProfile(userId: string, body: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.avatarUrl && { avatarUrl: body.avatarUrl }),
      },
    });

    return {
      user: sanitizeUser(updatedUser),
    };
  }
}
