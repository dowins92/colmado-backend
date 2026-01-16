import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('debts')
@ApiBearerAuth()
@Controller('debts')
export class DebtsController {
    constructor(private readonly debtsService: DebtsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new debt' })
    create(@Body() createDebtDto: CreateDebtDto) {
        return this.debtsService.create(createDebtDto);
    }

    @Post('payment')
    @ApiOperation({ summary: 'Record a payment for a debt' })
    createPayment(@Body() createPaymentDto: CreatePaymentDto) {
        return this.debtsService.createPayment(createPaymentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all active debts' })
    findAll() {
        return this.debtsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a debt by ID with payment history' })
    findOne(@Param('id') id: string) {
        return this.debtsService.findOne(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft-delete a debt' })
    remove(@Param('id') id: string) {
        return this.debtsService.remove(id);
    }
}
