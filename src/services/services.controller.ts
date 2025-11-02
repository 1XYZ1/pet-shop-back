import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { Service } from './entities';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';

/**
 * Controlador para gestionar los servicios de la tienda de mascotas
 * Endpoints para crear, leer, actualizar y eliminar servicios
 *
 * Rutas base: /api/services
 */
@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Crea un nuevo servicio
   * Solo accesible para administradores
   *
   * POST /api/services
   */
  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: Service,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  create(
    @Body() createServiceDto: CreateServiceDto,
    @GetUser() user: User,
  ) {
    return this.servicesService.create(createServiceDto, user);
  }

  /**
   * Obtiene todos los servicios con paginación
   * Ruta pública - No requiere autenticación
   *
   * GET /api/services?limit=10&offset=0
   */
  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of services retrieved successfully',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.servicesService.findAll(paginationDto);
  }

  /**
   * Obtiene todos los servicios sin paginación (para admin)
   * Solo accesible para administradores
   *
   * GET /api/services/all
   */
  @Get('all')
  @Auth(ValidRoles.admin)
  @ApiResponse({
    status: 200,
    description: 'All services retrieved successfully',
    type: [Service],
  })
  findAllAdmin() {
    return this.servicesService.findAllAdmin();
  }

  /**
   * Obtiene un servicio específico por ID o nombre
   * Ruta pública - No requiere autenticación
   *
   * GET /api/services/:term
   */
  @Get(':term')
  @ApiResponse({
    status: 200,
    description: 'Service retrieved successfully',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('term') term: string) {
    return this.servicesService.findOne(term);
  }

  /**
   * Actualiza un servicio existente
   * Solo accesible para administradores
   *
   * PATCH /api/services/:id
   */
  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: Service,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetUser() user: User,
  ) {
    return this.servicesService.update(id, updateServiceDto, user);
  }

  /**
   * Elimina un servicio
   * Solo accesible para administradores
   *
   * DELETE /api/services/:id
   */
  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiResponse({
    status: 200,
    description: 'Service deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
