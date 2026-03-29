import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { ArticuloService } from './articulo.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { IsNumber, IsOptional } from 'class-validator';

class AgregarTalleDto {
  @IsNumber()
  talleId: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

class AgregarColorDto {
  @IsNumber()
  colorId: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

@Controller('articulos')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class ArticuloController {
  constructor(private readonly service: ArticuloService) {}

  @Post()
  @RequirePermissions(PERMISOS.ARTICULO_CREAR)
  create(@Body() dto: CreateArticuloDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.ARTICULO_VER)
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};
    return this.service.findAll({ where, order: orderBy, take, skip });
  }

  @Get(':id')
  @RequirePermissions(PERMISOS.ARTICULO_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticuloDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.ARTICULO_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/talles')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  agregarTalle(@Param('id', ParseIntPipe) id: number, @Body() dto: AgregarTalleDto) {
    return this.service.agregarTalle(id, dto.talleId, dto.orden);
  }

  @Post(':id/colores')
  @RequirePermissions(PERMISOS.ARTICULO_EDITAR)
  agregarColor(@Param('id', ParseIntPipe) id: number, @Body() dto: AgregarColorDto) {
    return this.service.agregarColor(id, dto.colorId, dto.orden);
  }
}
