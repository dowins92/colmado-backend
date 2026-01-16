import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { StockEntryDto } from './dto/stock-entry.dto';
import { StockTransferDto } from './dto/stock-transfer.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) { }

    @Post('entry')
    @Roles(Role.OWNER, Role.MANAGER)
    async entry(@Body() dto: StockEntryDto) {
        return this.stockService.entry(dto);
    }

    @Post('transfer')
    @ApiOperation({ summary: 'Transfer stock between locations' })
    @Roles(Role.OWNER, Role.MANAGER)
    async transfer(@Body() stockTransferDto: StockTransferDto) {
        return this.stockService.transfer(stockTransferDto);
    }

    @Get('movements')
    @ApiOperation({ summary: 'Get all stock movements' })
    @Roles(Role.OWNER, Role.MANAGER)
    findAllMovements() {
        return this.stockService.findAllMovements();
    }

    @Get('available')
    @ApiOperation({ summary: 'Get all products with total available stock across all locations' })
    @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
    findAvailableStock() {
        return this.stockService.findAvailableStock();
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Get current stock for a product across all locations' })
    @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
    findProductStock(@Param('productId') productId: string) {
        return this.stockService.findProductStock(productId);
    }
}
