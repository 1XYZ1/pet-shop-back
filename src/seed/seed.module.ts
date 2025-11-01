import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { ServicesModule } from '../services/services.module';
import { AppointmentsModule } from '../appointments/appointments.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

/**
 * Módulo de Seed
 * Proporciona un endpoint para poblar la base de datos con datos de ejemplo
 *
 * Imports necesarios:
 * - ProductsModule: Para insertar productos de ejemplo
 * - AuthModule: Para insertar usuarios de ejemplo
 * - ServicesModule: Para insertar servicios de ejemplo
 * - AppointmentsModule: Para insertar citas de ejemplo
 */
@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ProductsModule,
    AuthModule,
    ServicesModule,
    AppointmentsModule,
  ]
})
export class SeedModule {}
