import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthSignupDto } from './dto/auth-signup.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { RequestUser } from './types/types';
import { CurrentUser } from './decorators/current-user.decorator';
import { AdminGuard } from './guards/AdminGuard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/test')
  test() {
    return 'Test successfully!';
  }

  @Put('/update')
  @UseGuards(JwtAuthGuard)
  update(@Body() body: AuthUpdateDto, @CurrentUser() user: RequestUser) {
    console.log(user);
    return this.authService.update(body, user);
  }

  @Post('/signup')
  signup(@Body() body: AuthSignupDto) {
    return this.authService.signUp(body);
  }

  @Post('/login')
  async login(
    @Body() body: AuthLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // ставим cookie
    const data = await this.authService.login(body);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    response.cookie('token', data.access_token, {
      httpOnly: true,
      sameSite: 'lax', // для localhost ок (3000/3001/3007 — same-site)
      secure: false, // на http должно быть false (в проде true)
      path: '/', // чтобы шла на все пути
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { ...data.user };
  }

  @Get('/moderators')
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  getModerators(@Query() query: { name: string }) {
    return this.authService.getModerators(query.name || '');
  }
}
