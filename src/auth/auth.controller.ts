import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, BusinessLoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login - returns businesses if user has multiple' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('login/business')
    @ApiOperation({ summary: 'Complete login with selected business' })
    loginWithBusiness(@Body() businessLoginDto: BusinessLoginDto) {
        return this.authService.loginWithBusiness(businessLoginDto);
    }

    @ApiBearerAuth()
    @Post('switch-business')
    @ApiOperation({ summary: 'Switch active business for current user' })
    switchBusiness(@Body('businessId') businessId: string, @Request() req: any) {
        return this.authService.switchBusiness(req.user.id, businessId);
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
