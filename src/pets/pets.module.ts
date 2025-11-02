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
 * Dependencias:
 * - AuthModule: Para decoradores @Auth() y @GetUser()
 * - MedicalRecordsModule: Para historial médico en complete-profile
 * - GroomingRecordsModule: Para historial de grooming en complete-profile
 * - AppointmentsModule: Para appointments en complete-profile
 * - TypeOrmModule: Para repositorio de Pet
 *
 * Exporta:
 * - TypeOrmModule.forFeature([Pet]): Para que otros módulos puedan
 *   inyectar el repositorio Pet (ej: MedicalRecordsModule, AppointmentsModule)
 * - PetsService: Para que otros módulos puedan usar los métodos del servicio
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Pet]),
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
