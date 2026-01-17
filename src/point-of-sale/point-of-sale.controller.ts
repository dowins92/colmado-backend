import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PointOfSaleService } from './point-of-sale.service';
import { CreatePointOfSaleDto } from './dto/create-point-of-sale.dto';
import { UpdatePointOfSaleDto } from './dto/update-point-of-sale.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('point-of-sale')
@ApiBearerAuth()
@Controller('point-of-sale')
export class PointOfSaleController {
    constructor(private readonly pointOfSaleService: PointOfSaleService) { }

    @Post()
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Create a new point of sale' })
    create(@Body() createPointOfSaleDto: CreatePointOfSaleDto, @Request() req: any) {
        return this.pointOfSaleService.create(createPointOfSaleDto, req.businessId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all points of sale' })
    findAll(@Request() req: any) {
        return this.pointOfSaleService.findAll(req.businessId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a point of sale by ID' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.pointOfSaleService.findOne(id, req.businessId);
    }

    @Patch(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Update a point of sale' })
    update(@Param('id') id: string, @Body() updatePointOfSaleDto: UpdatePointOfSaleDto, @Request() req: any) {
        return this.pointOfSaleService.update(id, updatePointOfSaleDto, req.businessId);
    }

    @Delete(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Soft-delete a point of sale' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.pointOfSaleService.remove(id, req.businessId);
    }
}
