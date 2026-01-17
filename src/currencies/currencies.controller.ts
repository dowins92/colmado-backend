import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CreateExchangeRateDto, CreateCurrencyDto } from './dto/create-exchange-rate.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Currencies')
@ApiBearerAuth()
@Controller('currencies')
export class CurrenciesController {
    constructor(private readonly currenciesService: CurrenciesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all currencies' })
    @ApiResponse({ status: 200, description: 'Return all currencies.' })
    getCurrencies(@Request() req: any) {
        return this.currenciesService.getCurrencies(req.businessId);
    }

    @Post()
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Create a new currency' })
    @ApiResponse({ status: 201, description: 'The currency has been successfully created.' })
    createCurrency(@Body() createCurrencyDto: CreateCurrencyDto, @Request() req: any) {
        return this.currenciesService.createCurrency(createCurrencyDto, req.businessId);
    }

    @Get('rates')
    @ApiOperation({ summary: 'Get latest exchange rates' })
    @ApiResponse({ status: 200, description: 'Return latest exchange rates for all currencies.' })
    getRates(@Request() req: any) {
        return this.currenciesService.getLatestRates(req.businessId);
    }

    @Post('rates')
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Update an exchange rate' })
    @ApiResponse({ status: 201, description: 'The exchange rate has been successfully updated.' })
    updateRate(@Body() createExchangeRateDto: CreateExchangeRateDto, @Request() req: any) {
        return this.currenciesService.updateRate(createExchangeRateDto, req.businessId);
    }
}
