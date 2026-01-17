import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Create a new product' })
    create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
        return this.productsService.create(createProductDto, req.businessId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    findAll(@Request() req: any) {
        return this.productsService.findAll(req.businessId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.productsService.findOne(id, req.businessId);
    }

    @Patch(':id')
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Update a product' })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: any) {
        return this.productsService.update(id, updateProductDto, req.businessId);
    }

    @Delete(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Soft-delete a product' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.productsService.remove(id, req.businessId);
    }
}
