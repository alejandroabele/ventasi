import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { MetodoPago } from './entities/metodo-pago.entity';
import { CuotaMetodoPago } from './entities/cuota-metodo-pago.entity';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';
import { CreateCuotaDto } from './dto/create-cuota.dto';

@Injectable()
export class MetodoPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private repo: Repository<MetodoPago>,
    @InjectRepository(CuotaMetodoPago)
    private cuotaRepo: Repository<CuotaMetodoPago>,
  ) {}

  async findAll(conditions: FindManyOptions<MetodoPago>) {
    return await this.repo.find({
      ...conditions,
      where: transformToGenericFilters(conditions.where as Record<string, unknown>),
      relations: ['cuotas'],
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id }, relations: ['cuotas'] });
  }

  async create(dto: CreateMetodoPagoDto) {
    return await this.repo.save(dto);
  }

  async update(id: number, dto: UpdateMetodoPagoDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const tieneVentas = await this.tieneVentas(id);
    if (tieneVentas) {
      await this.repo.update({ id }, { activo: 0 });
      return await this.findOne(id);
    }
    const entity = await this.findOne(id);
    await this.repo.softDelete({ id });
    return entity;
  }

  async addCuota(metodoPagoId: number, dto: CreateCuotaDto) {
    const metodo = await this.repo.findOne({ where: { id: metodoPagoId } });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');

    const existente = await this.cuotaRepo.findOne({
      where: { metodoPagoId, cantidadCuotas: dto.cantidadCuotas },
    });
    if (existente) throw new BadRequestException('Ya existe esa cantidad de cuotas para este método');

    return await this.cuotaRepo.save({ ...dto, metodoPagoId });
  }

  async updateCuota(id: number, dto: Partial<CreateCuotaDto>) {
    await this.cuotaRepo.update({ id }, dto);
    return await this.cuotaRepo.findOne({ where: { id } });
  }

  async removeCuota(id: number) {
    const entity = await this.cuotaRepo.findOne({ where: { id } });
    await this.cuotaRepo.update({ id }, { activo: 0 });
    return entity;
  }

  private async tieneVentas(id: number): Promise<boolean> {
    const result = await this.repo.manager.query(
      `SELECT COUNT(*) AS total FROM venta_forma_pago WHERE metodo_pago_id = ? AND deleted_at IS NULL`,
      [id],
    );
    return parseInt(result[0].total) > 0;
  }
}
