import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('business')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business')
export class BusinessController {
    constructor(private readonly businessService: BusinessService) { }

    @Post()
    @Roles(Role.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new business (SUPERADMIN only)' })
    create(@Body() createBusinessDto: CreateBusinessDto) {
        return this.businessService.create(createBusinessDto);
    }

    @Get()
    @Roles(Role.SUPERADMIN)
    @ApiOperation({ summary: 'Get all businesses (SUPERADMIN only)' })
    findAll() {
        return this.businessService.findAll();
    }

    @Get('mine/access')
    @Roles(Role.SUPERADMIN, Role.OWNER, Role.MANAGER, Role.CASHIER)
    @ApiOperation({ summary: 'Get businesses the current user has access to' })
    findMine(@Request() req: any) {
        return this.businessService.findByUserId(req.user.id);
    }

    @Get(':id')
    @Roles(Role.SUPERADMIN, Role.OWNER)
    @ApiOperation({ summary: 'Get a business by ID' })
    findOne(@Param('id') id: string) {
        return this.businessService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.SUPERADMIN, Role.OWNER)
    @ApiOperation({ summary: 'Update a business' })
    update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
        return this.businessService.update(id, updateBusinessDto);
    }

    @Delete(':id')
    @Roles(Role.SUPERADMIN)
    @ApiOperation({ summary: 'Soft-delete a business (SUPERADMIN only)' })
    remove(@Param('id') id: string) {
        return this.businessService.remove(id);
    }
}
