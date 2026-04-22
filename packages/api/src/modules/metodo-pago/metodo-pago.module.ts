import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoPagoService } from './metodo-pago.service';
import { MetodoPagoController } from './metodo-pago.controller';
import { MetodoPago } from './entities/metodo-pago.entity';
import { CuotaMetodoPago } from './entities/cuota-metodo-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoPago, CuotaMetodoPago])],
  controllers: [MetodoPagoController],
  providers: [MetodoPagoService],
  exports: [MetodoPagoService],
})
export class MetodoPagoModule {}
