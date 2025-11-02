import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { MedicalRecordsService } from './medical-records.service';
import {
    CreateMedicalRecordDto,
    UpdateMedicalRecordDto,
    CreateVaccinationDto,
    UpdateVaccinationDto
} from './dto';
import { MedicalRecord, Vaccination } from './entities';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';

/**
 * Controlador de Registros Médicos y Vacunaciones
 *
 * Endpoints para:
 * - Gestionar consultas veterinarias, cirugías, emergencias
 * - Registrar y consultar vacunaciones
 * - Obtener historial médico completo
 * - Alertas de vacunas próximas a vencer
 *
 * Rutas base: /api/medical-records
 *
 * Seguridad:
 * - Todos los endpoints requieren autenticación
 * - Crear registros: requiere rol admin o veterinario
 * - Consultar historial: owner de la mascota o admin
 */
@ApiTags('Medical Records')
@Controller('medical-records')
export class MedicalRecordsController {

    constructor(
        private readonly medicalRecordsService: MedicalRecordsService
    ) {}

    // ==================== MEDICAL RECORDS ====================

    /**
     * POST /api/medical-records
     * Crea un nuevo registro médico veterinario
     *
     * @param createMedicalRecordDto - Datos del registro médico
     * @param user - Usuario autenticado (veterinario)
     * @returns El registro médico creado
     *
     * Permisos: Solo administradores
     */
    @Post()
    @Auth(ValidRoles.admin)
    @ApiResponse({
        status: 201,
        description: 'Registro médico creado exitosamente',
        type: MedicalRecord,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos',
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado - Requiere rol de veterinario/admin',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    createMedicalRecord(
        @Body() createMedicalRecordDto: CreateMedicalRecordDto,
        @GetUser() user: User
    ) {
        return this.medicalRecordsService.createMedicalRecord(
            createMedicalRecordDto,
            user
        );
    }

    /**
     * GET /api/medical-records/pet/:petId
     * Obtiene el historial médico completo de una mascota
     *
     * @param petId - UUID de la mascota
     * @param user - Usuario autenticado
     * @returns Array de registros médicos ordenados cronológicamente
     *
     * Permisos: Owner de la mascota o admin
     */
    @Get('pet/:petId')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Historial médico recuperado exitosamente',
        type: [MedicalRecord],
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado - No eres el dueño de esta mascota',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    getMedicalRecordsByPet(
        @Param('petId', ParseUUIDPipe) petId: string,
        @GetUser() user: User
    ) {
        return this.medicalRecordsService.getMedicalRecordsByPet(petId, user);
    }

    /**
     * GET /api/medical-records/:id
     * Obtiene un registro médico específico por ID
     *
     * @param id - UUID del registro médico
     * @param user - Usuario autenticado
     * @returns El registro médico
     *
     * Permisos: Owner de la mascota o admin
     */
    @Get(':id')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Registro médico encontrado',
        type: MedicalRecord,
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado',
    })
    @ApiResponse({
        status: 404,
        description: 'Registro médico no encontrado',
    })
    findOneMedicalRecord(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User
    ) {
        return this.medicalRecordsService.findOneMedicalRecord(id, user);
    }

    /**
     * PATCH /api/medical-records/:id
     * Actualiza un registro médico existente
     *
     * @param id - UUID del registro médico
     * @param updateMedicalRecordDto - Campos a actualizar
     * @param user - Usuario autenticado
     * @returns El registro médico actualizado
     *
     * Permisos: Solo administradores
     */
    @Patch(':id')
    @Auth(ValidRoles.admin)
    @ApiResponse({
        status: 200,
        description: 'Registro médico actualizado exitosamente',
        type: MedicalRecord,
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado',
    })
    @ApiResponse({
        status: 404,
        description: 'Registro médico no encontrado',
    })
    updateMedicalRecord(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
        @GetUser() user: User
    ) {
        return this.medicalRecordsService.updateMedicalRecord(
            id,
            updateMedicalRecordDto,
            user
        );
    }

    // ==================== VACCINATIONS ====================

    /**
     * POST /api/medical-records/vaccinations
     * Registra una nueva vacuna aplicada a una mascota
     *
     * @param createVaccinationDto - Datos de la vacuna
     * @param user - Usuario autenticado (veterinario)
     * @returns La vacuna registrada
     *
     * Permisos: Solo administradores
     */
    @Post('vaccinations')
    @Auth(ValidRoles.admin)
    @ApiResponse({
        status: 201,
        description: 'Vacuna registrada exitosamente',
        type: Vaccination,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos',
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    createVaccination(
        @Body() createVaccinationDto: CreateVaccinationDto,
        @GetUser() user: User
    ) {
        return this.medicalRecordsService.createVaccination(
            createVaccinationDto,
            user
        );
    }

    /**
     * GET /api/medical-records/vaccinations/pet/:petId
     * Obtiene todas las vacunas de una mascota
     *
     * @param petId - UUID de la mascota
     * @param user - Usuario autenticado
     * @returns Array de vacunas ordenadas por fecha de aplicación
     *
     * Permisos: Owner de la mascota o admin
     */
    @Get('vaccinations/pet/:petId')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Vacunas recuperadas exitosamente',
        type: [Vaccination],
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    getVaccinationsByPet(
        @Param('petId', ParseUUIDPipe) petId: string,
        @GetUser() user: User
    ) {
        return this.medicalRecordsService.getVaccinationsByPet(petId, user);
    }

    /**
     * GET /api/medical-records/vaccinations/due
     * Obtiene vacunas próximas a vencer (dentro de los próximos 30 días)
     *
     * @param user - Usuario autenticado
     * @returns Array de vacunas con nextDueDate próximo
     *
     * Comportamiento:
     * - Administradores: ven todas las vacunas próximas a vencer del sistema
     * - Usuarios regulares: solo ven las de sus mascotas
     */
    @Get('vaccinations/due')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Vacunas próximas a vencer recuperadas exitosamente',
        type: [Vaccination],
    })
    getUpcomingVaccinations(@GetUser() user: User) {
        return this.medicalRecordsService.getUpcomingVaccinations(user);
    }

    /**
     * PATCH /api/medical-records/vaccinations/:id
     * Actualiza un registro de vacunación
     *
     * @param id - UUID de la vacuna
     * @param updateVaccinationDto - Campos a actualizar
     * @param user - Usuario autenticado
     * @returns La vacuna actualizada
     *
     * Permisos: Solo administradores
     */
    @Patch('vaccinations/:id')
    @Auth(ValidRoles.admin)
    @ApiResponse({
        status: 200,
        description: 'Vacuna actualizada exitosamente',
        type: Vaccination,
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado',
    })
    @ApiResponse({
        status: 404,
        description: 'Vacuna no encontrada',
    })
    updateVaccination(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateVaccinationDto: UpdateVaccinationDto,
        @GetUser() user: User
    ) {
        return this.medicalRecordsService.updateVaccination(
            id,
            updateVaccinationDto,
            user
        );
    }

}
