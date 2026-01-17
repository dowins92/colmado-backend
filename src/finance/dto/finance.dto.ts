import { IsString, IsNumber, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { Currency } from '@prisma/client';

export class ExpenseDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    currencyCode: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsBoolean()
    isOnatPayment: boolean;
}

export class CurrencyRateDto {
    @IsString()
    @IsNotEmpty()
    currencyCode: string;

    @IsNumber()
    @IsNotEmpty()
    rate: number;
}
