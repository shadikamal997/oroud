import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async findAll() {
    return this.citiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.citiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: any) {
    return this.citiesService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.citiesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }

  @Get(':id/shops')
  async getCityShops(@Param('id') id: string) {
    return this.citiesService.getCityShops(id);
  }
}
