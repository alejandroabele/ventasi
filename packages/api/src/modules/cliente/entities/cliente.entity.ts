import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cliente')
export class Cliente extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  telefono?: string;
}
