import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { Pet } from './entities';

import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { GroomingRecordsModule } from '../grooming-records/grooming-records.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { MedicalRecord, Vaccination } from '../medical-records/entities';
import { GroomingRecord } from '../grooming-records/entities';
import { Appointment } from '../appointments/entities';

/**
 * Módulo de Mascotas
 *
 * Responsabilidades:
 * - Gestión completa del CRUD de mascotas
 * - Vista unificada getCompleteProfile con toda la información
 * - Validación de ownership por usuario
 * - Integración con sistema de autenticación
 *
 * Entidades:
 * - Pet: Perfil de mascotas con datos básicos, médicos y comportamiento
 *
 * Repositorios inyectados:
 * - Pet: Para operaciones CRUD de mascotas
 * - MedicalRecord: Para consultar historial médico en complete-profile
 * - Vaccination: Para consultar vacunas en complete-profile
 * - GroomingRecord: Para consultar historial de grooming en complete-profile
 * - Appointment: Para consultar citas en complete-profile
 *
 * Dependencias:
 * - AuthModule: Para decoradores @Auth() y @GetUser()
 * - MedicalRecordsModule: Para acceder a entidades de registros médicos
 * - GroomingRecordsModule: Para acceder a entidades de grooming
 * - AppointmentsModule: Para acceder a entidades de appointments
 * - TypeOrmModule: Para repositorios de todas las entidades
 *
 * Exporta:
 * - TypeOrmModule.forFeature([Pet]): Para que otros módulos puedan
 *   inyectar el repositorio Pet (ej: MedicalRecordsModule, AppointmentsModule)
 * - PetsService: Para que otros módulos puedan usar los métodos del servicio
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            Pet,
            MedicalRecord,
            Vaccination,
            GroomingRecord,
            Appointment,
        ]),
        ConfigModule,
        AuthModule,
        FilesModule,
        forwardRef(() => MedicalRecordsModule),
        forwardRef(() => GroomingRecordsModule),
        forwardRef(() => AppointmentsModule),
    ],
    controllers: [PetsController],
    providers: [PetsService],
    exports: [
        TypeOrmModule.forFeature([Pet]),
        PetsService,
    ],
})
export class PetsModule {}
