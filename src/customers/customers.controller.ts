import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Create a new customer' })
    create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any) {
        return this.customersService.create(createCustomerDto, req.businessId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all customers' })
    findAll(@Request() req: any) {
        return this.customersService.findAll(req.businessId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a customer by ID' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.customersService.findOne(id, req.businessId);
    }

    @Patch(':id')
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Update a customer' })
    update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req: any) {
        return this.customersService.update(id, updateCustomerDto, req.businessId);
    }

    @Delete(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Soft-delete a customer' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.customersService.remove(id, req.businessId);
    }
}
