import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class CreatePaymentDto {
    @ApiProperty()
    @IsString()
    debtId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ enum: Currency, default: Currency.CUP })
    @IsEnum(Currency)
    currency: Currency;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    rateAtMoment: number;
}
