import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Articulo } from '@/modules/articulo/entities/articulo.entity';
import { Talle } from '@/modules/talle/entities/talle.entity';
import { Color } from '@/modules/color/entities/color.entity';

@Entity('articulo_variante')
export class ArticuloVariante extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'articulo_id', type: 'int' })
  articuloId: number;

  @ManyToOne(() => Articulo)
  @JoinColumn({ name: 'articulo_id' })
  articulo: Articulo;

  @Column({ name: 'talle_id', type: 'int' })
  talleId: number;

  @ManyToOne(() => Talle)
  @JoinColumn({ name: 'talle_id' })
  talle: Talle;

  @Column({ name: 'color_id', type: 'int' })
  colorId: number;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @Column({ name: 'cantidad', type: 'varchar', length: 100, default: '0' })
  cantidad: string;
}
