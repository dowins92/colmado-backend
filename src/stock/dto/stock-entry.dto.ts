import { IsString, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { Currency } from '@prisma/client';

export class StockEntryDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    totalCost: number;

    @IsEnum(Currency)
    @IsNotEmpty()
    currency: Currency;

    @IsNumber()
    @IsNotEmpty()
    rate: number;
}
