import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoMetodoPago } from '../entities/metodo-pago.entity';

export class CreateMetodoPagoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(TipoMetodoPago)
  @IsOptional()
  tipo?: TipoMetodoPago;

  @IsOptional()
  activo?: number;
}
