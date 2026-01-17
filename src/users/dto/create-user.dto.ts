import { IsEmail, IsString, IsEnum, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'admin@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: Role, default: Role.CASHIER })
    @IsEnum(Role)
    role: Role;

    @ApiProperty({ example: '1234567890', required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ example: '123 Main St', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '12345678901', required: false })
    @IsString()
    @IsOptional()
    identityNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    posId?: string;
}
