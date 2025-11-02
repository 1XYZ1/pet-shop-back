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

import { GroomingRecordsService } from './grooming-records.service';
import { CreateGroomingRecordDto, UpdateGroomingRecordDto } from './dto';
import { GroomingRecord } from './entities';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';

/**
 * Controlador de Registros de Grooming
 *
 * Endpoints para:
 * - Gestionar sesiones de peluquería (baño, corte, uñas, etc.)
 * - Consultar historial de grooming por mascota
 * - Obtener sesiones del día actual
 * - Estadísticas de grooming
 *
 * Rutas base: /api/grooming-records
 */
@ApiTags('Grooming Records')
@Controller('grooming-records')
export class GroomingRecordsController {

    constructor(
        private readonly groomingRecordsService: GroomingRecordsService
    ) {}

    /**
     * POST /api/grooming-records
     * Crea un nuevo registro de sesión de grooming
     *
     * Permisos: Solo administradores
     */
    @Post()
    @Auth(ValidRoles.admin)
    @ApiResponse({
        status: 201,
        description: 'Registro de grooming creado exitosamente',
        type: GroomingRecord,
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
    create(
        @Body() createGroomingRecordDto: CreateGroomingRecordDto,
        @GetUser() user: User
    ) {
        return this.groomingRecordsService.create(createGroomingRecordDto, user);
    }

    /**
     * GET /api/grooming-records/pet/:petId
     * Obtiene el historial de grooming de una mascota
     *
     * Permisos: Owner de la mascota o admin
     */
    @Get('pet/:petId')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Historial de grooming recuperado exitosamente',
        type: [GroomingRecord],
    })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
    getGroomingRecordsByPet(
        @Param('petId', ParseUUIDPipe) petId: string,
        @GetUser() user: User
    ) {
        return this.groomingRecordsService.getGroomingRecordsByPet(petId, user);
    }

    /**
     * GET /api/grooming-records/today
     * Obtiene las sesiones de grooming del día actual
     *
     * Permisos: Cualquier usuario autenticado
     * - Admins ven todas las sesiones de hoy
     * - Users ven solo las de sus mascotas
     */
    @Get('today')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Sesiones de hoy recuperadas exitosamente',
        type: [GroomingRecord],
    })
    findTodaySessions(@GetUser() user: User) {
        return this.groomingRecordsService.findTodaySessions(user);
    }

    /**
     * GET /api/grooming-records/stats
     * Obtiene estadísticas de grooming
     *
     * Permisos: Cualquier usuario autenticado
     */
    @Get('stats')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Estadísticas recuperadas exitosamente',
    })
    getStats(@GetUser() user: User) {
        return this.groomingRecordsService.getStats(user);
    }

    /**
     * GET /api/grooming-records/:id
     * Obtiene un registro de grooming específico
     *
     * Permisos: Owner de la mascota o admin
     */
    @Get(':id')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Registro de grooming encontrado',
        type: GroomingRecord,
    })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado' })
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User
    ) {
        return this.groomingRecordsService.findOne(id, user);
    }

    /**
     * PATCH /api/grooming-records/:id
     * Actualiza un registro de grooming existente
     *
     * Permisos: Solo administradores
     */
    @Patch(':id')
    @Auth(ValidRoles.admin)
    @ApiResponse({
        status: 200,
        description: 'Registro de grooming actualizado exitosamente',
        type: GroomingRecord,
    })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateGroomingRecordDto: UpdateGroomingRecordDto,
        @GetUser() user: User
    ) {
        return this.groomingRecordsService.update(id, updateGroomingRecordDto, user);
    }

}
