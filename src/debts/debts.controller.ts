import { Controller, Get, Post, Body, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('debts')
@ApiBearerAuth()
@Controller('debts')
export class DebtsController {
    constructor(private readonly debtsService: DebtsService) { }

    @Post()
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Create a new debt' })
    create(@Body() createDebtDto: CreateDebtDto, @Request() req: any) {
        return this.debtsService.create(createDebtDto, req.businessId);
    }

    @Post('payment')
    @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
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
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Soft-delete a debt' })
    remove(@Param('id') id: string) {
        return this.debtsService.remove(id);
    }
}
