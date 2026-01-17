import { IsEnum, IsNumber, IsPositive, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
    @ApiProperty({ example: 'EUR' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'Euro' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '€', required: false })
    @IsString()
    @IsOptional()
    symbol?: string;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isBase?: boolean;
}

export class CreateExchangeRateDto {
    @ApiProperty({ example: 'USD' })
    @IsString()
    @IsNotEmpty()
    currencyCode: string;

    @ApiProperty({ example: 470 })
    @IsNumber()
    @IsPositive()
    rate: number;
}
