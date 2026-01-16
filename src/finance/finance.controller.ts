import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { ExpenseDto, CurrencyRateDto } from './dto/finance.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Post('expense')
    @Roles(Role.OWNER, Role.MANAGER)
    async createExpense(@Body() dto: ExpenseDto) {
        return this.financeService.createExpense(dto);
    }

    @Post('rate')
    @Roles(Role.OWNER)
    async createRate(@Body() dto: CurrencyRateDto) {
        return this.financeService.createCurrencyRate(dto);
    }

    @Get('daily-summary')
    @Roles(Role.OWNER, Role.MANAGER)
    async getSummary(@Query('date') dateStr?: string) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.financeService.getDailySummary(date);
    }
}
