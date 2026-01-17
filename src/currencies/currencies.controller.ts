import { Controller, Get, Post, Body } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CreateExchangeRateDto, CreateCurrencyDto } from './dto/create-exchange-rate.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrenciesController {
    constructor(private readonly currenciesService: CurrenciesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all currencies' })
    @ApiResponse({ status: 200, description: 'Return all currencies.' })
    getCurrencies() {
        return this.currenciesService.getCurrencies();
    }

    @Post()
    @ApiOperation({ summary: 'Create a new currency' })
    @ApiResponse({ status: 201, description: 'The currency has been successfully created.' })
    createCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
        return this.currenciesService.createCurrency(createCurrencyDto);
    }

    @Get('rates')
    @ApiOperation({ summary: 'Get latest exchange rates' })
    @ApiResponse({ status: 200, description: 'Return latest exchange rates for all currencies.' })
    getRates() {
        return this.currenciesService.getLatestRates();
    }

    @Post('rates')
    @ApiOperation({ summary: 'Update an exchange rate' })
    @ApiResponse({ status: 201, description: 'The exchange rate has been successfully updated.' })
    updateRate(@Body() createExchangeRateDto: CreateExchangeRateDto) {
        return this.currenciesService.updateRate(createExchangeRateDto);
    }
}
