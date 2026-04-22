import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CuotaMetodoPago } from './cuota-metodo-pago.entity';

export enum TipoMetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA_CREDITO = 'tarjeta_credito',
  TARJETA_DEBITO = 'tarjeta_debito',
  TRANSFERENCIA = 'transferencia',
  QR = 'qr',
  OTRO = 'otro',
}

@Entity('metodo_pago')
export class MetodoPago extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ name: 'tipo', type: 'varchar', length: 30, default: TipoMetodoPago.OTRO })
  tipo: TipoMetodoPago;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: number;

  @OneToMany(() => CuotaMetodoPago, (c) => c.metodoPago)
  cuotas: CuotaMetodoPago[];
}
