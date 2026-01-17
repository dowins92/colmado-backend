import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @Post()
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Create a new warehouse' })
    create(@Body() createWarehouseDto: CreateWarehouseDto, @Request() req: any) {
        return this.warehousesService.create(createWarehouseDto, req.businessId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all warehouses' })
    findAll(@Request() req: any) {
        return this.warehousesService.findAll(req.businessId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a warehouse by ID' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.warehousesService.findOne(id, req.businessId);
    }

    @Patch(':id')
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Update a warehouse' })
    update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto, @Request() req: any) {
        return this.warehousesService.update(id, updateWarehouseDto, req.businessId);
    }

    @Delete(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Soft-delete a warehouse' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.warehousesService.remove(id, req.businessId);
    }
}
