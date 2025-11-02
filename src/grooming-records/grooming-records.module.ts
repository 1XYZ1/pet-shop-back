import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroomingRecordsService } from './grooming-records.service';
import { GroomingRecordsController } from './grooming-records.controller';
import { GroomingRecord } from './entities';

import { AuthModule } from '../auth/auth.module';
import { PetsModule } from '../pets/pets.module';

/**
 * Módulo de Registros de Grooming
 *
 * Responsabilidades:
 * - Gestión de sesiones de peluquería
 * - Historial de servicios de grooming
 * - Tracking de productos y condiciones
 * - Estadísticas y reportes
 *
 * Dependencias:
 * - AuthModule: Para decoradores @Auth() y @GetUser()
 * - PetsModule: Para acceso al repositorio Pet y validación de ownership
 *
 * Exporta:
 * - TypeOrmModule.forFeature: Para que otros módulos puedan inyectar el repositorio
 * - GroomingRecordsService: Para uso en otros módulos (ej: vista unificada)
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([GroomingRecord]),
        AuthModule,
        forwardRef(() => PetsModule),
    ],
    controllers: [GroomingRecordsController],
    providers: [GroomingRecordsService],
    exports: [
        TypeOrmModule.forFeature([GroomingRecord]),
        GroomingRecordsService,
    ],
})
export class GroomingRecordsModule {}
