import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './entities';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de Services
 * Gestiona los servicios ofrecidos en la tienda de mascotas (peluquería y veterinaria)
 *
 * Imports:
 * - TypeOrmModule: Registra la entidad Service para usar con el repositorio
 * - AuthModule: Necesario para los decoradores de autenticación (@Auth, @GetUser)
 *
 * Exports:
 * - TypeOrmModule: Permite que otros módulos inyecten el repositorio de Service
 * - ServicesService: Permite que otros módulos (como Seed) usen el servicio
 */
@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [
    TypeOrmModule.forFeature([Service]),
    AuthModule,
  ],
  exports: [
    TypeOrmModule,
    ServicesService,
  ],
})
export class ServicesModule {}
