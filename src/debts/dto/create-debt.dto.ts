import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class CreateDebtDto {
    @ApiProperty()
    @IsString()
    customerId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ example: 'USD' })
    @IsString()
    @IsOptional()
    currencyCode?: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    rateAtMoment: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    saleId?: string;
}
