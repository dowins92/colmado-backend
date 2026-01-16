import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PointOfSaleService } from './point-of-sale.service';
import { CreatePointOfSaleDto } from './dto/create-point-of-sale.dto';
import { UpdatePointOfSaleDto } from './dto/update-point-of-sale.dto';

@ApiTags('point-of-sale')
@ApiBearerAuth()
@Controller('point-of-sale')
export class PointOfSaleController {
    constructor(private readonly pointOfSaleService: PointOfSaleService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new point of sale' })
    create(@Body() createPointOfSaleDto: CreatePointOfSaleDto) {
        return this.pointOfSaleService.create(createPointOfSaleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all points of sale' })
    findAll() {
        return this.pointOfSaleService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a point of sale by ID' })
    findOne(@Param('id') id: string) {
        return this.pointOfSaleService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a point of sale' })
    update(@Param('id') id: string, @Body() updatePointOfSaleDto: UpdatePointOfSaleDto) {
        return this.pointOfSaleService.update(id, updatePointOfSaleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft-delete a point of sale' })
    remove(@Param('id') id: string) {
        return this.pointOfSaleService.remove(id);
    }
}
