import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment, AppointmentPet } from './entities';
import { Pet } from '../pets/entities/pet.entity';
import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
import { PetsModule } from '../pets/pets.module';

/**
 * Módulo de Appointments
 * Gestiona el sistema de agendamiento de citas para servicios de la tienda de mascotas
 *
 * Imports:
 * - TypeOrmModule: Registra las entidades Appointment, AppointmentPet y Pet
 *   Pet se incluye para permitir la inyección de su repositorio en el servicio
 * - AuthModule: Necesario para los decoradores de autenticación (@Auth, @GetUser)
 * - ServicesModule: Necesario para validar que los servicios existen
 * - PetsModule: Necesario para vincular mascotas a las citas
 *
 * Exports:
 * - TypeOrmModule: Permite que otros módulos inyecten los repositorios
 * - AppointmentsService: Permite que otros módulos (como Seed) usen el servicio
 */
@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [
    TypeOrmModule.forFeature([Appointment, AppointmentPet, Pet]),
    AuthModule,
    ServicesModule,
    PetsModule,
  ],
  exports: [
    TypeOrmModule,
    AppointmentsService,
  ],
})
export class AppointmentsModule {}
