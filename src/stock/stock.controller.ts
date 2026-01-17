import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
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
    async entry(@Body() dto: StockEntryDto, @Request() req: any) {
        return this.stockService.entry(dto, req.businessId);
    }

    @Post('transfer')
    @ApiOperation({ summary: 'Transfer stock between locations' })
    @Roles(Role.OWNER, Role.MANAGER)
    async transfer(@Body() stockTransferDto: StockTransferDto, @Request() req: any) {
        return this.stockService.transfer(stockTransferDto, req.businessId);
    }

    @Get('available')
    @ApiOperation({ summary: 'Get all products with total available stock across all locations' })
    @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
    findAvailableStock(@Request() req: any) {
        return this.stockService.findAvailableStock(req.businessId);
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Get current stock for a product across all locations' })
    @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
    findProductStock(@Param('productId') productId: string, @Request() req: any) {
        return this.stockService.findProductStock(productId, req.businessId);
    }
}
