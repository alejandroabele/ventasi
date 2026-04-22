import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCuotaDto {
  @IsInt()
  @Min(1)
  cantidadCuotas: number;

  @IsString()
  @IsNotEmpty()
  tasaInteres: string;

  @IsOptional()
  activo?: number;
}
