import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { MetodoPagoService } from './metodo-pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';
import { CreateCuotaDto } from './dto/create-cuota.dto';

@Controller('metodos-pago')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class MetodoPagoController {
  constructor(private readonly service: MetodoPagoService) {}

  @Post()
  @RequirePermissions(PERMISOS.METODO_PAGO_CREAR)
  create(@Body() dto: CreateMetodoPagoDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISOS.METODO_PAGO_VER)
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
  @RequirePermissions(PERMISOS.METODO_PAGO_VER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISOS.METODO_PAGO_EDITAR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMetodoPagoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.METODO_PAGO_ELIMINAR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/cuotas')
  @RequirePermissions(PERMISOS.METODO_PAGO_EDITAR)
  addCuota(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCuotaDto) {
    return this.service.addCuota(id, dto);
  }

  @Patch('cuotas/:cuotaId')
  @RequirePermissions(PERMISOS.METODO_PAGO_EDITAR)
  updateCuota(@Param('cuotaId', ParseIntPipe) cuotaId: number, @Body() dto: Partial<CreateCuotaDto>) {
    return this.service.updateCuota(cuotaId, dto);
  }

  @Delete('cuotas/:cuotaId')
  @RequirePermissions(PERMISOS.METODO_PAGO_EDITAR)
  removeCuota(@Param('cuotaId', ParseIntPipe) cuotaId: number) {
    return this.service.removeCuota(cuotaId);
  }
}
