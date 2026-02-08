import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    // TODO: Implement find all users
    return { message: 'Get all users - to be implemented' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // TODO: Implement find one user
    return { message: `Get user ${id} - to be implemented` };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    // TODO: Implement update user
    return { message: `Update user ${id} - to be implemented` };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // TODO: Implement delete user
    return { message: `Delete user ${id} - to be implemented` };
  }
}
