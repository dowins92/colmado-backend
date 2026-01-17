import { IsString, IsNumber, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Currency } from '@prisma/client';

export class SaleItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}

export class BulkSaleDto {
    @IsString()
    @IsNotEmpty()
    posId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaleItemDto)
    items: SaleItemDto[];

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsNumber()
    @IsNotEmpty()
    rate: number;

    @IsString()
    @IsOptional()
    customerId?: string;

    @IsNumber()
    @IsOptional()
    paidAmount?: number;
}
