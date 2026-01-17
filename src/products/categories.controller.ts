import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('product-categories')
@ApiBearerAuth()
@Controller('product-categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Create a new product category' })
    create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
        return this.categoriesService.create(createCategoryDto, req.businessId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all product categories' })
    findAll(@Request() req: any) {
        return this.categoriesService.findAll(req.businessId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product category by ID' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.categoriesService.findOne(id, req.businessId);
    }

    @Patch(':id')
    @Roles(Role.OWNER, Role.MANAGER)
    @ApiOperation({ summary: 'Update a product category' })
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req: any) {
        return this.categoriesService.update(id, updateCategoryDto, req.businessId);
    }

    @Delete(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Delete a product category' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.categoriesService.remove(id, req.businessId);
    }
}
