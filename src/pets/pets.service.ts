import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

import { CreatePetDto, UpdatePetDto } from './dto';
import { Pet } from './entities';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { MedicalRecord, Vaccination } from '../medical-records/entities';
import { GroomingRecord } from '../grooming-records/entities';
import { Appointment } from '../appointments/entities';
import {
    CompleteProfileDto,
    PetSummaryDto,
    MedicalRecordSummaryDto,
    VaccinationSummaryDto,
    GroomingRecordSummaryDto,
    AppointmentSummaryDto,
    WeightHistoryDto,
    WeightSource,
} from './dto/responses';

/**
 * Servicio principal para manejar todas las operaciones CRUD de mascotas
 *
 * Funcionalidades principales:
 * - Crear mascotas asociadas a un usuario (owner)
 * - Listar mascotas con filtros por ownership
 * - Obtener detalle de una mascota específica
 * - Actualizar información de mascotas
 * - Eliminar mascotas (soft delete)
 * - Validación de ownership en todas las operaciones
 *
 * Seguridad:
 * - Los usuarios regulares solo pueden ver/modificar sus propias mascotas
 * - Los administradores pueden ver/modificar todas las mascotas
 */
@Injectable()
export class PetsService {

    // Logger específico para este servicio - facilita debugging
    private readonly logger = new Logger('PetsService');

    constructor(
        @InjectRepository(Pet)
        private readonly petRepository: Repository<Pet>,

        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,

        @InjectRepository(Vaccination)
        private readonly vaccinationRepository: Repository<Vaccination>,

        @InjectRepository(GroomingRecord)
        private readonly groomingRecordRepository: Repository<GroomingRecord>,

        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
    ) {}

    /**
     * Crea una nueva mascota en el sistema
     *
     * @param createPetDto - Datos de la mascota a crear
     * @param user - Usuario que está creando la mascota (será el owner)
     * @returns La mascota creada con sus relaciones
     *
     * Validaciones:
     * - Todos los campos del DTO son validados automáticamente por class-validator
     * - El usuario actual se asigna automáticamente como owner
     * - Se verifica que el microchipNumber sea único si se proporciona
     */
    async create(createPetDto: CreatePetDto, user: User): Promise<Pet> {
        try {
            // Crea la instancia de la mascota en memoria
            const pet = this.petRepository.create({
                ...createPetDto,
                owner: user, // Asocia al usuario actual como dueño
            });

            // Guarda en la base de datos
            await this.petRepository.save(pet);

            return pet;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * Obtiene una lista paginada de mascotas
     *
     * @param paginationDto - Parámetros de paginación (limit, offset)
     * @param user - Usuario que solicita la lista
     * @returns Lista de mascotas con información de paginación
     *
     * Comportamiento:
     * - Usuarios regulares: solo ven sus propias mascotas
     * - Administradores: ven todas las mascotas del sistema
     * - Solo retorna mascotas activas (isActive = true)
     */
    async findAll(paginationDto: PaginationDto, user: User) {
        const { limit = 10, offset = 0 } = paginationDto;

        // Determina si el usuario es administrador
        const isAdmin = user.roles.includes('admin');

        // Construye el filtro de consulta
        const whereCondition: any = { isActive: true };

        // Si no es admin, solo muestra sus mascotas
        if (!isAdmin) {
            whereCondition.owner = { id: user.id };
        }

        // Consulta paginada con relaciones
        const pets = await this.petRepository.find({
            take: limit,
            skip: offset,
            where: whereCondition,
            order: {
                createdAt: 'DESC', // Más recientes primero
            },
        });

        // Cuenta total para paginación
        const totalPets = await this.petRepository.count({
            where: whereCondition,
        });

        return {
            count: totalPets,
            pages: Math.ceil(totalPets / limit),
            data: pets,
        };
    }

    /**
     * Obtiene una mascota específica por ID
     *
     * @param id - UUID de la mascota
     * @param user - Usuario que solicita la información
     * @returns La mascota con sus relaciones básicas
     *
     * Validaciones:
     * - Verifica que el ID sea un UUID válido
     * - Verifica que la mascota exista y esté activa
     * - Verifica ownership (excepto para admins)
     *
     * @throws NotFoundException si la mascota no existe
     * @throws ForbiddenException si el usuario no tiene permiso
     */
    async findOne(id: string, user: User): Promise<Pet> {
        // Valida formato de UUID
        if (!isUUID(id)) {
            throw new BadRequestException(`${id} no es un UUID válido`);
        }

        // Busca la mascota con relaciones eager (owner ya viene incluido)
        const pet = await this.petRepository.findOne({
            where: { id, isActive: true },
        });

        // Verifica que exista
        if (!pet) {
            throw new NotFoundException(`Mascota con id ${id} no encontrada`);
        }

        // Verifica ownership
        this.validateOwnership(pet, user);

        return pet;
    }

    /**
     * Actualiza información de una mascota existente
     *
     * @param id - UUID de la mascota a actualizar
     * @param updatePetDto - Nuevos datos de la mascota
     * @param user - Usuario que realiza la actualización
     * @returns La mascota actualizada
     *
     * Validaciones:
     * - Verifica que la mascota exista
     * - Verifica ownership antes de permitir modificación
     * - Valida todos los campos del DTO
     *
     * @throws NotFoundException si la mascota no existe
     * @throws ForbiddenException si el usuario no tiene permiso
     */
    async update(id: string, updatePetDto: UpdatePetDto, user: User): Promise<Pet> {
        // Primero valida ownership buscando la mascota
        const pet = await this.findOne(id, user);

        try {
            // Aplica los cambios (preload busca y aplica sin guardar aún)
            const updatedPet = await this.petRepository.preload({
                id,
                ...updatePetDto,
            });

            if (!updatedPet) {
                throw new NotFoundException(`Mascota con id ${id} no encontrada`);
            }

            // Guarda los cambios
            await this.petRepository.save(updatedPet);

            return updatedPet;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * Elimina una mascota (soft delete)
     *
     * @param id - UUID de la mascota a eliminar
     * @param user - Usuario que realiza la eliminación
     * @returns Mensaje de confirmación
     *
     * Comportamiento:
     * - No elimina físicamente el registro de la base de datos
     * - Marca el campo isActive como false
     * - Los registros relacionados (médicos, grooming) permanecen intactos
     * - Solo el owner o un admin pueden eliminar
     *
     * @throws NotFoundException si la mascota no existe
     * @throws ForbiddenException si el usuario no tiene permiso
     */
    async remove(id: string, user: User): Promise<{ message: string }> {
        // Valida ownership
        const pet = await this.findOne(id, user);

        // Soft delete: marca como inactivo
        pet.isActive = false;
        await this.petRepository.save(pet);

        return {
            message: `Mascota ${pet.name} eliminada exitosamente`,
        };
    }

    /**
     * Obtiene el perfil completo de una mascota
     * Consolida toda la información en una sola respuesta
     *
     * @param id - UUID de la mascota
     * @param user - Usuario que solicita el perfil
     * @returns CompleteProfileDto con toda la información transformada a DTOs
     *
     * Incluye:
     * - Datos básicos de la mascota (PetSummaryDto)
     * - Historial médico reciente (últimas 10 consultas)
     * - Vacunas con status calculado dinámicamente
     * - Evolución del peso desde múltiples fuentes
     * - Historial de grooming (últimas 10 sesiones)
     * - Appointments (upcoming y past separados correctamente)
     * - Resumen con datos calculados (edad decimal, gastos totales)
     *
     * Optimización:
     * - Todas las queries se ejecutan en paralelo usando Promise.all()
     * - Transformación a DTOs con métodos estáticos fromEntity()
     */
    async getCompleteProfile(id: string, user: User): Promise<CompleteProfileDto> {
        // Valida ownership y obtiene la mascota
        const pet = await this.findOne(id, user);

        const now = new Date();

        // ==================== QUERIES PARALELAS ====================
        // Ejecutar todas las queries en paralelo para mejorar performance
        const [
            // Registros médicos
            allMedicalRecords,
            medicalRecordsCount,

            // Vacunas
            allVaccinations,
            vaccinationsCount,

            // Sesiones de grooming
            allGroomingSessions,
            groomingSessionsCount,

            // Appointments upcoming (futuras o pending/confirmed)
            upcomingAppointments,

            // Appointments past (pasadas y completed/cancelled)
            pastAppointments,

            // Total de appointments
            appointmentsCount,

        ] = await Promise.all([
            // 1. Registros médicos recientes (últimas 10)
            this.medicalRecordRepository.find({
                where: { pet: { id } },
                order: { visitDate: 'DESC' },
                take: 10,
            }),

            // 2. Total de registros médicos
            this.medicalRecordRepository.count({
                where: { pet: { id } },
            }),

            // 3. Todas las vacunas (para calcular status y filtrar)
            this.vaccinationRepository.find({
                where: { pet: { id } },
                order: { administeredDate: 'DESC' },
            }),

            // 4. Total de vacunas
            this.vaccinationRepository.count({
                where: { pet: { id } },
            }),

            // 5. Sesiones de grooming recientes (últimas 10)
            this.groomingRecordRepository.find({
                where: { pet: { id } },
                order: { sessionDate: 'DESC' },
                take: 10,
            }),

            // 6. Total de sesiones de grooming
            this.groomingRecordRepository.count({
                where: { pet: { id } },
            }),

            // 7. Appointments futuros (fecha >= hoy)
            this.appointmentRepository.find({
                where: { pet: { id }, date: MoreThan(now) },
                order: { date: 'ASC' },
            }),

            // 8. Appointments pasados (fecha < hoy)
            this.appointmentRepository.find({
                where: { pet: { id }, date: LessThan(now) },
                order: { date: 'DESC' },
                take: 20,
            }),

            // 9. Total de appointments
            this.appointmentRepository.count({
                where: { pet: { id } },
            }),
        ]);

        // ==================== TRANSFORMACIONES A DTOS ====================

        // 1. Transformar mascota a PetSummaryDto
        const petDto = PetSummaryDto.fromEntity(pet);

        // 2. Transformar registros médicos a DTOs
        const medicalRecordDtos = allMedicalRecords.map(record =>
            MedicalRecordSummaryDto.fromEntity(record)
        );

        // 3. Transformar vacunas a DTOs
        const vaccinationDtos = allVaccinations.map(vaccination =>
            VaccinationSummaryDto.fromEntity(vaccination)
        );

        // Filtrar vacunas próximas (próximos 30 días)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const upcomingVaccines = vaccinationDtos.filter(v => {
            if (!v.nextDueDate) return false;
            const dueDate = new Date(v.nextDueDate);
            return dueDate >= now && dueDate <= thirtyDaysFromNow;
        });

        // 4. Construir historial de peso desde múltiples fuentes
        const weightHistory: WeightHistoryDto[] = [];

        // Agregar peso actual de la mascota (source: manual)
        if (pet.weight) {
            weightHistory.push(
                WeightHistoryDto.fromPetProfile(pet.updatedAt, Number(pet.weight))
            );
        }

        // Agregar pesos de consultas médicas (source: medical)
        allMedicalRecords
            .filter(record => record.weightAtVisit)
            .forEach(record => {
                weightHistory.push(
                    WeightHistoryDto.fromMedicalRecord(record.visitDate, Number(record.weightAtVisit))
                );
            });

        // Ordenar por fecha descendente (más reciente primero)
        weightHistory.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // 5. Transformar sesiones de grooming a DTOs
        const groomingRecordDtos = allGroomingSessions.map(session =>
            GroomingRecordSummaryDto.fromEntity(session)
        );

        // Última sesión de grooming (si existe)
        const lastSessionDate = groomingRecordDtos.length > 0
            ? groomingRecordDtos[0].date
            : undefined;

        // 6. Transformar appointments a DTOs
        const upcomingAppointmentDtos = upcomingAppointments.map(appointment =>
            AppointmentSummaryDto.fromEntity(appointment)
        );

        const pastAppointmentDtos = pastAppointments.map(appointment =>
            AppointmentSummaryDto.fromEntity(appointment)
        );

        // ==================== CÁLCULOS DEL RESUMEN ====================

        // Calcular edad en años con decimales (ej: 2.5 años)
        const age = pet.birthDate
            ? parseFloat(
                ((now.getTime() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)
            )
            : undefined;

        // Última visita médica
        const lastVisitDate = medicalRecordDtos.length > 0
            ? medicalRecordDtos[0].date
            : undefined;

        // Próxima vacuna a aplicar (vacuna más cercana que esté pendiente o vencida)
        const nextVaccinationDue = vaccinationDtos
            .filter(v => {
                if (!v.nextDueDate) return false;
                const dueDate = new Date(v.nextDueDate);
                return dueDate >= now; // Solo vacunas futuras o del día de hoy
            })
            .sort((a, b) => {
                if (!a.nextDueDate) return 1;
                if (!b.nextDueDate) return -1;
                return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
            })[0]?.nextDueDate;

        // Total gastado en servicios médicos
        const totalSpentMedical = allMedicalRecords
            .filter(r => r.serviceCost)
            .reduce((sum, r) => sum + Number(r.serviceCost), 0);

        // Total gastado en grooming
        const totalSpentGrooming = allGroomingSessions
            .filter(s => s.serviceCost)
            .reduce((sum, s) => sum + Number(s.serviceCost), 0);

        // ==================== CONSTRUIR DTO DE RESPUESTA ====================

        const completeProfile: CompleteProfileDto = {
            pet: petDto,
            medicalHistory: {
                recentVisits: medicalRecordDtos,
                totalVisits: medicalRecordsCount,
            },
            vaccinations: {
                activeVaccines: vaccinationDtos,
                upcomingVaccines,
                totalVaccines: vaccinationsCount,
            },
            weightHistory,
            groomingHistory: {
                recentSessions: groomingRecordDtos,
                totalSessions: groomingSessionsCount,
                lastSessionDate,
            },
            appointments: {
                upcoming: upcomingAppointmentDtos,
                past: pastAppointmentDtos,
                totalAppointments: appointmentsCount,
            },
            summary: {
                age,
                lastVisitDate,
                nextVaccinationDue,
                totalSpentMedical: parseFloat(totalSpentMedical.toFixed(2)),
                totalSpentGrooming: parseFloat(totalSpentGrooming.toFixed(2)),
            },
        };

        return completeProfile;
    }

    /**
     * Valida que el usuario tenga permiso para acceder/modificar una mascota
     *
     * @param pet - Mascota a validar
     * @param user - Usuario que intenta acceder
     *
     * @throws ForbiddenException si el usuario no es owner ni admin
     *
     * Lógica:
     * - Si el usuario es admin: siempre tiene acceso
     * - Si el usuario es el owner: tiene acceso
     * - En cualquier otro caso: acceso denegado
     */
    private validateOwnership(pet: Pet, user: User): void {
        const isOwner = pet.owner.id === user.id;
        const isAdmin = user.roles.includes('admin');

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException(
                'No tienes permiso para acceder a esta mascota'
            );
        }
    }

    /**
     * Maneja errores específicos de la base de datos de forma centralizada
     *
     * @param error - Error capturado de TypeORM
     *
     * Casos manejados:
     * - 23505: Violación de constraint único (ej: microchipNumber duplicado)
     * - Otros: Error genérico sin exponer detalles internos
     */
    private handleDBExceptions(error: any): never {
        // Error de constraint único (ej: microchip duplicado)
        if (error.code === '23505') {
            throw new BadRequestException(
                'Ya existe una mascota con ese número de microchip'
            );
        }

        // Registra el error para debugging
        this.logger.error(error);

        // Lanza error genérico
        throw new InternalServerErrorException(
            'Error inesperado, revise los logs del servidor'
        );
    }

    /**
     * Actualiza la foto de perfil de una mascota
     *
     * @param id - UUID de la mascota
     * @param photoUrl - URL completa de la nueva foto
     * @param fileName - Nombre del archivo guardado
     * @param user - Usuario que solicita la actualización
     * @returns La mascota con la foto actualizada
     *
     * Comportamiento:
     * - Valida ownership antes de actualizar
     * - Si existía una foto anterior, la elimina del filesystem
     * - En caso de error al guardar, elimina la nueva foto
     * - Actualiza el campo profilePhoto con la nueva URL
     */
    async updatePhoto(
        id: string,
        photoUrl: string,
        fileName: string,
        user: User
    ): Promise<Pet> {
        // Validar ownership y obtener la mascota
        const pet = await this.findOne(id, user);

        // Si había una foto anterior, eliminarla del sistema de archivos
        if (pet.profilePhoto) {
            const oldFileName = pet.profilePhoto.split('/').pop();
            const oldPath = join(__dirname, '../../static/pets', oldFileName);

            if (existsSync(oldPath)) {
                try {
                    unlinkSync(oldPath);
                    this.logger.log(`Deleted old photo: ${oldFileName}`);
                } catch (error) {
                    this.logger.error(`Error deleting old photo: ${error}`);
                }
            }
        }

        // Actualizar con la nueva URL
        pet.profilePhoto = photoUrl;

        try {
            await this.petRepository.save(pet);
            return pet;
        } catch (error) {
            // Si falla la actualización, eliminar el archivo nuevo
            const newPath = join(__dirname, '../../static/pets', fileName);
            if (existsSync(newPath)) {
                unlinkSync(newPath);
            }
            this.handleDBExceptions(error);
        }
    }

    /**
     * Elimina la foto de perfil de una mascota
     *
     * @param id - UUID de la mascota
     * @param user - Usuario que solicita la eliminación
     * @returns La mascota sin foto de perfil
     *
     * Comportamiento:
     * - Valida ownership antes de eliminar
     * - Elimina el archivo físico del servidor
     * - Establece profilePhoto en null
     * - Si no hay foto, retorna la mascota sin cambios
     */
    async deletePhoto(id: string, user: User): Promise<Pet> {
        // Validar ownership y obtener la mascota
        const pet = await this.findOne(id, user);

        // Si no hay foto, retornar sin hacer nada
        if (!pet.profilePhoto) {
            return pet;
        }

        // Extraer el nombre del archivo de la URL
        const fileName = pet.profilePhoto.split('/').pop();
        const filePath = join(__dirname, '../../static/pets', fileName);

        // Eliminar el archivo físico si existe
        if (existsSync(filePath)) {
            try {
                unlinkSync(filePath);
                this.logger.log(`Deleted photo: ${fileName}`);
            } catch (error) {
                this.logger.error(`Error deleting photo: ${error}`);
                throw new InternalServerErrorException(
                    'Error al eliminar el archivo de foto'
                );
            }
        }

        // Actualizar el registro en la base de datos
        pet.profilePhoto = null;

        try {
            await this.petRepository.save(pet);
            return pet;
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * Elimina todas las mascotas de la base de datos
     *
     * Método utilitario usado principalmente en el seed para limpiar datos
     * NO debe usarse en producción sin extremo cuidado
     *
     * @returns Resultado de la operación de eliminación
     */
    async deleteAllPets() {
        const query = this.petRepository.createQueryBuilder('pet');

        try {
            return await query
                .delete()
                .where({})
                .execute();
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

}
