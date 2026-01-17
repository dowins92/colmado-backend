import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { BusinessService } from '../business/business.service';
import { LoginDto, BusinessLoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private businessService: BusinessService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    /**
     * Initial login: validates credentials and returns available businesses
     */
    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Get all businesses user has access to
        const businesses = await this.businessService.findByUserId(user.id);

        // If user has access to only one business, auto-login
        if (businesses.length === 1) {
            return this.loginWithBusiness({
                email: loginDto.email,
                password: loginDto.password,
                businessId: businesses[0].id
            });
        }

        // Return user and businesses for selection
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            businesses,
            requiresBusinessSelection: true
        };
    }

    /**
     * Complete login with selected business
     */
    async loginWithBusiness(businessLoginDto: BusinessLoginDto) {
        const user = await this.validateUser(businessLoginDto.email, businessLoginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify user has access to the selected business
        const businesses = await this.businessService.findByUserId(user.id);
        const selectedBusiness = businesses.find(b => b.id === businessLoginDto.businessId);

        if (!selectedBusiness) {
            throw new UnauthorizedException('You do not have access to this business');
        }

        // Create JWT with businessId
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            businessId: selectedBusiness.id
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                businessId: selectedBusiness.id
            },
            business: selectedBusiness
        };
    }

    /**
     * Switch business for an already authenticated user
     */
    async switchBusiness(userId: string, businessId: string) {
        const user = await this.usersService.findOne(userId, businessId); // Note: findOne already checks business access for non-superadmin
        // But for switching, we want to check if they HAVE access to the NEW businessId.

        const businesses = await this.businessService.findByUserId(userId);
        const selectedBusiness = businesses.find(b => b.id === businessId);

        if (!selectedBusiness) {
            throw new UnauthorizedException('You do not have access to this business');
        }

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            businessId: selectedBusiness.id
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                businessId: selectedBusiness.id
            },
            business: selectedBusiness
        };
    }

    logout() {
        return { message: 'Logged out successfully' };
    }
}
