import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Bebidas' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Productos líquidos, refrescos, cervezas, etc.', required: false })
    @IsString()
    @IsOptional()
    description?: string;
}
