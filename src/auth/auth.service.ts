import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { AuthUpdateDto } from './decorators/auth-update.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthSignupDto } from './decorators/auth-signup.dto';
import { AuthLoginDto } from './decorators/auth-login.dto';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private hashPassword(password: string, salt: string): string {
    return crypto
      .pbkdf2Sync(password, salt, 310000, 32, 'sha256')
      .toString('hex');
  }

  private verifyPassword(
    password: string,
    salt: string,
    storedHex: string,
  ): boolean {
    const actual = Buffer.from(this.hashPassword(password, salt), 'hex');
    const expected = Buffer.from(storedHex, 'hex');
    // постоянновременное сравнение
    return (
      actual.length === expected.length &&
      crypto.timingSafeEqual(actual, expected)
    );
  }

  async login({ email, password }: AuthLoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = this.verifyPassword(password, user.salt, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '1h',
    });

    return {
      access_token: token,
      user: { id: user.id, email: user.email, roles: user.roles },
    };
  }

  async signUp({ email, password, passwordRepeat }: AuthSignupDto) {
    if (password !== passwordRepeat) {
      throw new BadRequestException();
    }

    // Check email in DB table
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Generate salt and hash
    const salt = this.generateSalt();
    const passwordHash = this.hashPassword(password, salt);

    // Save in DB
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        salt,
        roles: ['USER'],
      },
    });

    // Возвращаем безопасный ответ
    return { id: user.id, email: user.email };
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  update(updateDto: AuthUpdateDto) {
    const addD = {
      ...updateDto,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (addD.password) {
      const salt = this.generateSalt();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      addD.passwordHash = this.hashPassword(addD.password, salt);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete addD.password;
    }

    return this.prisma.user.update({
      data: {
        ...addD,
      },
      where: {
        id: 'bcdfed29-08dd-4e69-8e52-6262b7a3d208',
      },
    });
  }

  getModerators(email: string) {
    return this.prisma.$queryRawUnsafe(
      `SELECT id, name, email, roles, phone, "createdAt" FROM "User" WHERE 'Admin' = ANY("roles") AND LOWER("email") LIKE '${email}%'`,
    );
  }
}
