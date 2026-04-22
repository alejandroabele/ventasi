import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MetodoPago } from './metodo-pago.entity';

@Entity('cuota_metodo_pago')
export class CuotaMetodoPago extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'metodo_pago_id', type: 'int' })
  metodoPagoId: number;

  @ManyToOne(() => MetodoPago, (m) => m.cuotas)
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago: MetodoPago;

  @Column({ name: 'cantidad_cuotas', type: 'int' })
  cantidadCuotas: number;

  @Column({ name: 'tasa_interes', type: 'varchar', length: 20, default: '0.00' })
  tasaInteres: string;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: number;
}
