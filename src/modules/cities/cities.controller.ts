import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async findAll() {
    // TODO: Implement find all cities
    return { message: 'Get all cities - to be implemented' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // TODO: Implement find one city
    return { message: `Get city ${id} - to be implemented` };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: any) {
    // TODO: Implement create city
    return { message: 'Create city - to be implemented' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: any) {
    // TODO: Implement update city
    return { message: `Update city ${id} - to be implemented` };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    // TODO: Implement delete city
    return { message: `Delete city ${id} - to be implemented` };
  }

  @Get(':id/shops')
  async getCityShops(@Param('id') id: string) {
    // TODO: Implement get city shops
    return { message: `Get shops for city ${id} - to be implemented` };
  }
}
