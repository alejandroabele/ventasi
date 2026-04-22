import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateVentaDetalleDto {
  @IsInt()
  articuloVarianteId: number;

  @IsString()
  @IsNotEmpty()
  cantidad: string;

  @IsString()
  @IsNotEmpty()
  precioUnitario: string;

  @IsOptional()
  @IsString()
  descuentoPorcentaje?: string;

  @IsOptional()
  @IsString()
  descuentoMonto?: string;

  @IsString()
  subtotalLinea: string;
}

export class CreateVentaFormaPagoDto {
  @IsInt()
  metodoPagoId: number;

  @IsOptional()
  @IsInt()
  cuotaMetodoPagoId?: number;

  @IsInt()
  cantidadCuotas: number;

  @IsString()
  tasaInteres: string;

  @IsString()
  montoBase: string;

  @IsString()
  montoConInteres: string;
}

export class CreateVentaDto {
  @IsOptional()
  @IsInt()
  visitaId?: number;

  @IsInt()
  clienteId: number;

  @IsInt()
  vendedorId: number;

  @IsInt()
  listaPrecioId: number;

  @IsString()
  @IsNotEmpty()
  tipoComprobante: string;

  @IsString()
  fecha: string;

  @IsString()
  subtotal: string;

  @IsOptional()
  @IsString()
  descuentoPorcentaje?: string;

  @IsOptional()
  @IsString()
  descuentoMonto?: string;

  @IsOptional()
  @IsString()
  recargoPorcentaje?: string;

  @IsOptional()
  @IsString()
  recargoMonto?: string;

  @IsString()
  baseImponible: string;

  @IsString()
  iva: string;

  @IsString()
  total: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaDetalleDto)
  detalles: CreateVentaDetalleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaFormaPagoDto)
  formasPago: CreateVentaFormaPagoDto[];
}
