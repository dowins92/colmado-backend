import { IsString, IsNumber, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { Currency } from '@prisma/client';

export class ExpenseDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsEnum(Currency)
    @IsNotEmpty()
    currency: Currency;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsBoolean()
    isOnatPayment: boolean;
}

export class CurrencyRateDto {
    @IsEnum(Currency)
    @IsNotEmpty()
    currency: Currency;

    @IsNumber()
    @IsNotEmpty()
    rate: number;
}
