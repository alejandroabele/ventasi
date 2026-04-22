import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { MetodoPago } from '@/modules/metodo-pago/entities/metodo-pago.entity';
import { CuotaMetodoPago } from '@/modules/metodo-pago/entities/cuota-metodo-pago.entity';

@Entity('venta_forma_pago')
export class VentaFormaPago extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id', type: 'int' })
  ventaId: number;

  @ManyToOne(() => Venta, (v) => v.formasPago)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ name: 'metodo_pago_id', type: 'int' })
  metodoPagoId: number;

  @ManyToOne(() => MetodoPago)
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago: MetodoPago;

  @Column({ name: 'cuota_metodo_pago_id', type: 'int', nullable: true })
  cuotaMetodoPagoId?: number;

  @ManyToOne(() => CuotaMetodoPago, { nullable: true })
  @JoinColumn({ name: 'cuota_metodo_pago_id' })
  cuotaMetodoPago?: CuotaMetodoPago;

  @Column({ name: 'cantidad_cuotas', type: 'int', default: 1 })
  cantidadCuotas: number;

  @Column({ name: 'tasa_interes', type: 'varchar', length: 20, default: '0.00' })
  tasaInteres: string;

  @Column({ name: 'monto_base', type: 'varchar', length: 20, default: '0.0000' })
  montoBase: string;

  @Column({ name: 'monto_con_interes', type: 'varchar', length: 20, default: '0.0000' })
  montoConInteres: string;
}
