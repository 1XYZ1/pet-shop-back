import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { PetsService } from './pets.service';
import { CreatePetDto, UpdatePetDto } from './dto';
import { Pet } from './entities';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { petImageFilter, fileNamer } from '../files/helpers';

/**
 * Controlador de Mascotas
 *
 * Maneja todos los endpoints relacionados con la gestión de mascotas
 * Todos los endpoints requieren autenticación mediante JWT
 *
 * Rutas base: /api/pets
 */
@ApiTags('Pets')
@Controller('pets')
export class PetsController {

    constructor(
        private readonly petsService: PetsService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * POST /api/pets
     * Crea una nueva mascota asociada al usuario autenticado
     *
     * @param createPetDto - Datos de la mascota a crear
     * @param user - Usuario autenticado (extraído del token JWT)
     * @returns La mascota creada
     *
     * Permisos: Cualquier usuario autenticado
     */
    @Post()
    @Auth()
    @ApiResponse({
        status: 201,
        description: 'Mascota creada exitosamente',
        type: Pet,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos o microchip duplicado',
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado - Token inválido o faltante',
    })
    create(
        @Body() createPetDto: CreatePetDto,
        @GetUser() user: User
    ) {
        return this.petsService.create(createPetDto, user);
    }

    /**
     * GET /api/pets
     * Obtiene la lista de mascotas del usuario autenticado
     *
     * @param paginationDto - Parámetros de paginación (limit, offset)
     * @param user - Usuario autenticado
     * @returns Lista paginada de mascotas
     *
     * Comportamiento:
     * - Usuarios regulares: solo ven sus mascotas
     * - Administradores: ven todas las mascotas
     */
    @Get()
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Lista de mascotas recuperada exitosamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado',
    })
    findAll(
        @Query() paginationDto: PaginationDto,
        @GetUser() user: User
    ) {
        return this.petsService.findAll(paginationDto, user);
    }

    /**
     * GET /api/pets/:id/complete-profile
     * Obtiene el perfil completo de una mascota
     * Consolida toda la información en una sola respuesta
     *
     * @param id - UUID de la mascota
     * @param user - Usuario autenticado
     * @returns Perfil completo con historial médico, vacunas, grooming, etc.
     *
     * Validaciones:
     * - El usuario debe ser owner de la mascota o admin
     */
    @Get(':id/complete-profile')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Perfil completo recuperado exitosamente',
    })
    @ApiResponse({
        status: 400,
        description: 'ID inválido (no es UUID)',
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado - No eres el dueño de esta mascota',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    getCompleteProfile(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User
    ) {
        return this.petsService.getCompleteProfile(id, user);
    }

    /**
     * GET /api/pets/:id
     * Obtiene una mascota específica por ID
     *
     * @param id - UUID de la mascota
     * @param user - Usuario autenticado
     * @returns Mascota con sus datos completos
     *
     * Validaciones:
     * - El usuario debe ser owner de la mascota o admin
     */
    @Get(':id')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Mascota encontrada',
        type: Pet,
    })
    @ApiResponse({
        status: 400,
        description: 'ID inválido (no es UUID)',
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado - No eres el dueño de esta mascota',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User
    ) {
        return this.petsService.findOne(id, user);
    }

    /**
     * PATCH /api/pets/:id
     * Actualiza información de una mascota existente
     *
     * @param id - UUID de la mascota
     * @param updatePetDto - Campos a actualizar
     * @param user - Usuario autenticado
     * @returns Mascota actualizada
     *
     * Permisos: Solo el owner o un admin pueden actualizar
     */
    @Patch(':id')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Mascota actualizada exitosamente',
        type: Pet,
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
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePetDto: UpdatePetDto,
        @GetUser() user: User
    ) {
        return this.petsService.update(id, updatePetDto, user);
    }

    /**
     * PATCH /api/pets/:id/photo
     * Actualiza la foto de perfil de una mascota
     *
     * @param id - UUID de la mascota
     * @param file - Archivo de imagen (jpg, jpeg, png, gif)
     * @param user - Usuario autenticado
     * @returns Mascota con la nueva foto de perfil
     *
     * Validaciones:
     * - Solo el owner o admin pueden actualizar
     * - Formatos permitidos: jpg, jpeg, png, gif
     * - La foto anterior se elimina automáticamente
     */
    @Patch(':id/photo')
    @Auth()
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: petImageFilter,
            storage: diskStorage({
                destination: './static/pets',
                filename: fileNamer,
            }),
        }),
    )
    @ApiResponse({
        status: 200,
        description: 'Foto de perfil actualizada exitosamente',
        type: Pet,
    })
    @ApiResponse({
        status: 400,
        description: 'Archivo inválido o validación fallida',
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado - No eres el dueño de esta mascota',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    updatePhoto(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: User
    ) {
        if (!file) {
            throw new BadRequestException('Make sure that the file is an image');
        }

        const secureUrl = `${this.configService.get('HOST_API')}/files/pet/${file.filename}`;

        return this.petsService.updatePhoto(id, secureUrl, file.filename, user);
    }

    /**
     * DELETE /api/pets/:id/photo
     * Elimina la foto de perfil de una mascota
     *
     * @param id - UUID de la mascota
     * @param user - Usuario autenticado
     * @returns Mascota sin foto de perfil
     *
     * Comportamiento:
     * - Elimina el archivo físico del servidor
     * - Establece profilePhoto en null
     * - Solo el owner o admin pueden eliminar
     */
    @Delete(':id/photo')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Foto de perfil eliminada exitosamente',
        type: Pet,
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado - No eres el dueño de esta mascota',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    deletePhoto(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User
    ) {
        return this.petsService.deletePhoto(id, user);
    }

    /**
     * DELETE /api/pets/:id
     * Elimina una mascota (soft delete)
     *
     * @param id - UUID de la mascota
     * @param user - Usuario autenticado
     * @returns Mensaje de confirmación
     *
     * Comportamiento:
     * - No elimina físicamente, solo marca isActive = false
     * - Los registros relacionados permanecen intactos
     * - Solo el owner o admin pueden eliminar
     */
    @Delete(':id')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Mascota eliminada exitosamente',
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado',
    })
    @ApiResponse({
        status: 404,
        description: 'Mascota no encontrada',
    })
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User
    ) {
        return this.petsService.remove(id, user);
    }

}
