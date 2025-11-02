import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord, Vaccination } from './entities';

import { AuthModule } from '../auth/auth.module';
import { PetsModule } from '../pets/pets.module';

/**
 * Módulo de Registros Médicos Veterinarios
 *
 * Responsabilidades:
 * - Gestión de consultas veterinarias, cirugías, emergencias
 * - Control de vacunaciones y alertas de refuerzo
 * - Historial médico completo de mascotas
 * - Tracking de peso, temperatura y diagnósticos
 *
 * Entidades:
 * - MedicalRecord: Registros de consultas y procedimientos veterinarios
 * - Vaccination: Control de vacunas aplicadas y próximas
 *
 * Dependencias:
 * - AuthModule: Para decoradores @Auth() y @GetUser()
 * - PetsModule: Para acceso al repositorio Pet y validación de ownership
 *
 * Exporta:
 * - TypeOrmModule.forFeature: Para que otros módulos puedan inyectar los repositorios
 * - MedicalRecordsService: Para uso en otros módulos (ej: vista unificada en PetsModule)
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([MedicalRecord, Vaccination]),
        AuthModule,
        forwardRef(() => PetsModule),
    ],
    controllers: [MedicalRecordsController],
    providers: [MedicalRecordsService],
    exports: [
        TypeOrmModule.forFeature([MedicalRecord, Vaccination]),
        MedicalRecordsService,
    ],
})
export class MedicalRecordsModule {}
