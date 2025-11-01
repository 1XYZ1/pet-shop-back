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

import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, FindAppointmentsQueryDto } from './dto';
import { Appointment } from './entities';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities/user.entity';

/**
 * Controlador para gestionar las citas de la tienda de mascotas
 * Endpoints para crear, leer, actualizar y eliminar citas
 *
 * Control de acceso:
 * - Usuarios autenticados pueden crear citas y gestionar las suyas
 * - Administradores pueden ver y gestionar todas las citas
 *
 * Rutas base: /api/appointments
 */
@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * Crea una nueva cita
   * Accesible para usuarios autenticados
   *
   * POST /api/appointments
   */
  @Post()
  @Auth()
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid date or service' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetUser() user: User,
  ) {
    return this.appointmentsService.create(createAppointmentDto, user);
  }

  /**
   * Obtiene todas las citas con filtros y paginación
   * - Usuarios normales solo ven sus propias citas
   * - Administradores ven todas las citas
   *
   * GET /api/appointments?limit=10&offset=0&status=pending
   */
  @Get()
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully',
  })
  findAll(
    @Query() queryDto: FindAppointmentsQueryDto,
    @GetUser() user: User,
  ) {
    return this.appointmentsService.findAll(queryDto, user);
  }

  /**
   * Obtiene una cita específica por ID
   * - Usuarios normales solo pueden ver sus propias citas
   * - Administradores pueden ver cualquier cita
   *
   * GET /api/appointments/:id
   */
  @Get(':id')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your appointment' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.appointmentsService.findOne(id, user);
  }

  /**
   * Actualiza una cita existente
   * - Usuarios normales solo pueden actualizar sus propias citas (no pueden cambiar estado)
   * - Administradores pueden actualizar cualquier cita y cambiar el estado
   *
   * PATCH /api/appointments/:id
   */
  @Patch(':id')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your appointment or cannot change status' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @GetUser() user: User,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, user);
  }

  /**
   * Elimina una cita
   * - Usuarios normales solo pueden eliminar sus propias citas
   * - Administradores pueden eliminar cualquier cita
   *
   * DELETE /api/appointments/:id
   */
  @Delete(':id')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Appointment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your appointment' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.appointmentsService.remove(id, user);
  }
}
