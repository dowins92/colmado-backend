import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class StockTransferDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    fromLocationId: string;

    @IsString()
    @IsNotEmpty()
    toLocationId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    rate: number;
}
