import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities';
import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';

/**
 * Módulo de Appointments
 * Gestiona el sistema de agendamiento de citas para servicios de la tienda de mascotas
 *
 * Imports:
 * - TypeOrmModule: Registra la entidad Appointment para usar con el repositorio
 * - AuthModule: Necesario para los decoradores de autenticación (@Auth, @GetUser)
 * - ServicesModule: Necesario para validar que los servicios existen al crear/actualizar citas
 *
 * Exports:
 * - TypeOrmModule: Permite que otros módulos inyecten el repositorio de Appointment
 * - AppointmentsService: Permite que otros módulos (como Seed) usen el servicio
 */
@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    AuthModule,
    ServicesModule,
  ],
  exports: [
    TypeOrmModule,
    AppointmentsService,
  ],
})
export class AppointmentsModule {}
