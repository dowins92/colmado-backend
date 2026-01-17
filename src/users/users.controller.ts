import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Create a new user (Owner only)' })
    create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
        return this.usersService.create(createUserDto, req.businessId);
    }

    @Get()
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Get all users (Owner only)' })
    findAll(@Request() req: any) {
        return this.usersService.findAll(req.businessId);
    }

    @Get(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Get a user by ID (Owner only)' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.usersService.findOne(id, req.businessId);
    }

    @Patch(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Update a user (Owner only)' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
        return this.usersService.update(id, updateUserDto, req.businessId);
    }

    @Delete(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Delete a user (Owner only)' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.usersService.remove(id, req.businessId);
    }
}
