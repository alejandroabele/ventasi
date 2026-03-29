import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArticuloDto {
  @IsNumber()
  subgrupoId: number;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  codigo: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @IsOptional()
  @IsString()
  codigoQr?: string;

  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsNumber()
  curvaId?: number;

  @IsOptional()
  @IsNumber()
  curvaColorId?: number;
}
