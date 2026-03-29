import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { buildWhereAndOrderQuery } from '@/helpers/filter-utils';
import { Articulo } from './entities/articulo.entity';
import { ArticuloTalle } from './entities/articulo-talle.entity';
import { ArticuloColor } from './entities/articulo-color.entity';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';

@Injectable()
export class ArticuloService {
  constructor(
    @InjectRepository(Articulo)
    private repo: Repository<Articulo>,
    @InjectRepository(ArticuloTalle)
    private talleRepo: Repository<ArticuloTalle>,
    @InjectRepository(ArticuloColor)
    private colorRepo: Repository<ArticuloColor>,
    private dataSource: DataSource
  ) {}

  async findAll(conditions: FindManyOptions<Articulo>): Promise<Articulo[]> {
    const qb = this.repo.createQueryBuilder('articulo');
    qb.leftJoinAndSelect('articulo.subgrupo', 'subgrupo');
    qb.leftJoinAndSelect('subgrupo.grupo', 'grupo');
    qb.leftJoinAndSelect('grupo.familia', 'familia');
    buildWhereAndOrderQuery(qb, conditions, 'articulo');
    return await qb.getMany();
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: [
        'subgrupo', 'subgrupo.grupo', 'subgrupo.grupo.familia',
        'curva', 'curvaColor',
        'talles', 'talles.talle',
        'colores', 'colores.color', 'colores.color.codigos',
      ],
    });
  }

  async create(dto: CreateArticuloDto) {
    const articulo = await this.repo.save(dto);

    if (dto.curvaId) {
      await this.dataSource.query(
        `INSERT INTO articulo_talle (articulo_id, talle_id, orden, created_at, updated_at)
         SELECT ?, talle_id, orden, NOW(6), NOW(6)
         FROM curva_talle_detalle
         WHERE curva_id = ? AND deleted_at IS NULL`,
        [articulo.id, dto.curvaId]
      );
    }

    if (dto.curvaColorId) {
      await this.dataSource.query(
        `INSERT INTO articulo_color (articulo_id, color_id, orden, created_at, updated_at)
         SELECT ?, color_id, orden, NOW(6), NOW(6)
         FROM curva_color_detalle
         WHERE curva_id = ? AND deleted_at IS NULL`,
        [articulo.id, dto.curvaColorId]
      );
    }

    return await this.findOne(articulo.id);
  }

  async update(id: number, dto: UpdateArticuloDto) {
    await this.repo.update({ id }, dto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.delete({ id });
    return entity;
  }

  async agregarTalle(articuloId: number, talleId: number, orden?: number) {
    const existente = await this.talleRepo.findOne({ where: { articuloId, talleId } });
    if (!existente) {
      const maxOrden = await this.talleRepo.count({ where: { articuloId } });
      await this.talleRepo.save({ articuloId, talleId, orden: orden ?? maxOrden });
    }
    return await this.findOne(articuloId);
  }

  async agregarColor(articuloId: number, colorId: number, orden?: number) {
    const existente = await this.colorRepo.findOne({ where: { articuloId, colorId } });
    if (!existente) {
      const maxOrden = await this.colorRepo.count({ where: { articuloId } });
      await this.colorRepo.save({ articuloId, colorId, orden: orden ?? maxOrden });
    }
    return await this.findOne(articuloId);
  }
}
