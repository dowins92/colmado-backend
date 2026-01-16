import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { BulkSaleDto } from './dto/bulk-sale.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post('bulk')
    @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
    @ApiOperation({ summary: 'Process a bulk sale' })
    async createBulkSale(@Body() bulkSaleDto: BulkSaleDto) {
        return this.salesService.createBulkSale(bulkSaleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all sales history' })
    findAll() {
        return this.salesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a sale by ID with details' })
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }
}
