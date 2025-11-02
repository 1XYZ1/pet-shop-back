import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { ServicesModule } from '../services/services.module';
import { AppointmentsModule } from '../appointments/appointments.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { User } from '../auth/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Vaccination } from '../medical-records/entities/vaccination.entity';
import { GroomingRecord } from '../grooming-records/entities/grooming-record.entity';
import { AppointmentPet } from '../appointments/entities/appointment-pet.entity';

/**
 * Módulo de Seed
 * Proporciona un endpoint para poblar la base de datos con datos de ejemplo
 *
 * Imports necesarios:
 * - ProductsModule: Para insertar productos de ejemplo
 * - AuthModule: Para insertar usuarios de ejemplo
 * - ServicesModule: Para insertar servicios de ejemplo
 * - AppointmentsModule: Para insertar citas de ejemplo
 * - TypeOrmModule: Para acceder a repositorios de mascotas y registros
 */
@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Pet,
      MedicalRecord,
      Vaccination,
      GroomingRecord,
      AppointmentPet,
    ]),
    ProductsModule,
    AuthModule,
    ServicesModule,
    AppointmentsModule,
  ]
})
export class SeedModule {}
