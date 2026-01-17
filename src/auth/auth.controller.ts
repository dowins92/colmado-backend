import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login and get JWT token' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiBearerAuth()
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    getProfile(@Request() req: any) {
        return req.user;
    }

    @ApiBearerAuth()
    @Post('logout')
    @ApiOperation({ summary: 'Logout user' })
    logout() {
        return this.authService.logout();
    }
}
