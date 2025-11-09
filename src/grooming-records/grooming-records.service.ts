import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateGroomingRecordDto, UpdateGroomingRecordDto } from './dto';
import { GroomingRecord } from './entities';
import { Pet } from '../pets/entities';
import { User } from '../auth/entities/user.entity';
import { handleDatabaseException, validatePetOwnership } from '../../common/helpers';

/**
 * Servicio de Registros de Grooming (Peluquería)
 *
 * Funcionalidades principales:
 * - Gestión completa de sesiones de grooming
 * - Historial de servicios realizados (baño, corte, uñas, etc.)
 * - Tracking de productos utilizados
 * - Seguimiento de condición de piel y pelaje
 * - Registro de comportamiento durante sesiones
 * - Estadísticas de grooming (sesiones de hoy, totales, etc.)
 * - Validación de ownership
 *
 * Seguridad:
 * - Valida que el usuario tenga acceso a la mascota
 * - Solo groomers/admins pueden crear registros
 * - Owners pueden ver el historial de sus mascotas
 */
@Injectable()
export class GroomingRecordsService {

    private readonly logger = new Logger('GroomingRecordsService');

    constructor(
        @InjectRepository(GroomingRecord)
        private readonly groomingRecordRepository: Repository<GroomingRecord>,

        @InjectRepository(Pet)
        private readonly petRepository: Repository<Pet>,
    ) {}

    /**
     * Crea un nuevo registro de sesión de grooming
     *
     * @param createGroomingRecordDto - Datos de la sesión
     * @param user - Usuario que crea el registro (groomer o admin)
     * @returns El registro de grooming creado
     *
     * Validaciones:
     * - Verifica que la mascota exista
     * - Verifica ownership (owner de la mascota o admin)
     * - Asocia al usuario actual como groomer
     */
    async create(
        createGroomingRecordDto: CreateGroomingRecordDto,
        user: User
    ): Promise<GroomingRecord> {
        const { petId, ...recordData } = createGroomingRecordDto;

        // Busca y valida la mascota
        const pet = await this.findAndValidatePet(petId, user);

        try {
            // Crea el registro de grooming
            const groomingRecord = this.groomingRecordRepository.create({
                ...recordData,
                pet,
                groomer: user,
            });

            await this.groomingRecordRepository.save(groomingRecord);

            return groomingRecord;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * Obtiene el historial completo de grooming de una mascota
     *
     * @param petId - UUID de la mascota
     * @param user - Usuario que solicita el historial
     * @returns Array de registros ordenados cronológicamente (más recientes primero)
     */
    async getGroomingRecordsByPet(petId: string, user: User): Promise<GroomingRecord[]> {
        if (!isUUID(petId)) {
            throw new BadRequestException(`${petId} no es un UUID válido`);
        }

        // Valida ownership
        await this.findAndValidatePet(petId, user);

        // Obtiene todos los registros de grooming de la mascota
        const records = await this.groomingRecordRepository.find({
            where: { pet: { id: petId } },
            order: { sessionDate: 'DESC' },
        });

        return records;
    }

    /**
     * Obtiene un registro de grooming específico por ID
     *
     * @param id - UUID del registro
     * @param user - Usuario que solicita el registro
     * @returns El registro de grooming
     *
     * @throws NotFoundException si no existe
     * @throws ForbiddenException si no tiene permiso
     */
    async findOne(id: string, user: User): Promise<GroomingRecord> {
        if (!isUUID(id)) {
            throw new BadRequestException(`${id} no es un UUID válido`);
        }

        const record = await this.groomingRecordRepository.findOne({
            where: { id },
        });

        if (!record) {
            throw new NotFoundException(`Registro de grooming con id ${id} no encontrado`);
        }

        // Valida ownership a través de la mascota
        this.validatePetOwnership(record.pet, user);

        return record;
    }

    /**
     * Actualiza un registro de grooming existente
     *
     * @param id - UUID del registro a actualizar
     * @param updateGroomingRecordDto - Nuevos datos
     * @param user - Usuario que actualiza
     * @returns El registro actualizado
     */
    async update(
        id: string,
        updateGroomingRecordDto: UpdateGroomingRecordDto,
        user: User
    ): Promise<GroomingRecord> {
        // Valida que existe y tiene permiso
        const record = await this.findOne(id, user);

        try {
            // Aplica los cambios
            const updatedRecord = await this.groomingRecordRepository.preload({
                id,
                ...updateGroomingRecordDto,
            });

            if (!updatedRecord) {
                throw new NotFoundException(`Registro de grooming con id ${id} no encontrado`);
            }

            await this.groomingRecordRepository.save(updatedRecord);

            return updatedRecord;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * Obtiene las sesiones de grooming del día actual
     *
     * @param user - Usuario que solicita (admin ve todas, users solo sus mascotas)
     * @returns Array de sesiones de hoy
     *
     * Útil para:
     * - Dashboard del día
     * - Lista de mascotas agendadas para hoy
     * - Control de operaciones diarias
     */
    async findTodaySessions(user: User): Promise<GroomingRecord[]> {
        // Obtiene inicio y fin del día actual
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const isAdmin = user.roles.includes('admin');

        // Query base
        const queryBuilder = this.groomingRecordRepository
            .createQueryBuilder('grooming')
            .leftJoinAndSelect('grooming.pet', 'pet')
            .leftJoinAndSelect('grooming.groomer', 'groomer')
            .leftJoinAndSelect('pet.owner', 'owner')
            .where('grooming.sessionDate BETWEEN :startOfDay AND :endOfDay', {
                startOfDay,
                endOfDay
            })
            .orderBy('grooming.sessionDate', 'ASC');

        // Si no es admin, solo muestra sesiones de sus mascotas
        if (!isAdmin) {
            queryBuilder.andWhere('owner.id = :userId', { userId: user.id });
        }

        return await queryBuilder.getMany();
    }

    /**
     * Obtiene estadísticas de grooming
     *
     * @param user - Usuario que solicita (admin ve todas, users solo sus mascotas)
     * @returns Objeto con estadísticas diversas
     *
     * Incluye:
     * - Total de sesiones registradas
     * - Total de ingresos generados
     * - Promedio de duración de sesiones
     * - Sesiones de hoy
     * - Sesiones del mes actual
     */
    async getStats(user: User) {
        const isAdmin = user.roles.includes('admin');

        // Query base para contar sesiones
        let queryBuilder = this.groomingRecordRepository
            .createQueryBuilder('grooming')
            .leftJoin('grooming.pet', 'pet')
            .leftJoin('pet.owner', 'owner');

        // Filtrar por ownership si no es admin
        if (!isAdmin) {
            queryBuilder = queryBuilder.where('owner.id = :userId', { userId: user.id });
        }

        // Total de sesiones
        const totalSessions = await queryBuilder.getCount();

        // Total de ingresos (suma de serviceCost)
        const revenueResult = await queryBuilder
            .select('SUM(grooming.serviceCost)', 'total')
            .getRawOne();
        const totalRevenue = parseFloat(revenueResult?.total || 0);

        // Promedio de duración
        const durationResult = await queryBuilder
            .select('AVG(grooming.durationMinutes)', 'average')
            .getRawOne();
        const averageDuration = parseFloat(durationResult?.average || 0);

        // Sesiones de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        let todayQuery = this.groomingRecordRepository
            .createQueryBuilder('grooming')
            .leftJoin('grooming.pet', 'pet')
            .leftJoin('pet.owner', 'owner')
            .where('grooming.sessionDate BETWEEN :today AND :endOfToday', {
                today,
                endOfToday
            });

        if (!isAdmin) {
            todayQuery = todayQuery.andWhere('owner.id = :userId', { userId: user.id });
        }

        const sessionsToday = await todayQuery.getCount();

        // Sesiones del mes actual
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        let monthQuery = this.groomingRecordRepository
            .createQueryBuilder('grooming')
            .leftJoin('grooming.pet', 'pet')
            .leftJoin('pet.owner', 'owner')
            .where('grooming.sessionDate BETWEEN :startOfMonth AND :endOfMonth', {
                startOfMonth,
                endOfMonth
            });

        if (!isAdmin) {
            monthQuery = monthQuery.andWhere('owner.id = :userId', { userId: user.id });
        }

        const sessionsThisMonth = await monthQuery.getCount();

        return {
            totalSessions,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            averageDurationMinutes: parseFloat(averageDuration.toFixed(2)),
            sessionsToday,
            sessionsThisMonth,
        };
    }

    // ==================== HELPER METHODS ====================

    /**
     * Busca una mascota y valida que el usuario tenga permiso
     *
     * @param petId - UUID de la mascota
     * @param user - Usuario que solicita acceso
     * @returns La mascota si existe y tiene permiso
     */
    private async findAndValidatePet(petId: string, user: User): Promise<Pet> {
        if (!isUUID(petId)) {
            throw new BadRequestException(`${petId} no es un UUID válido`);
        }

        const pet = await this.petRepository.findOne({
            where: { id: petId, isActive: true },
        });

        if (!pet) {
            throw new NotFoundException(`Mascota con id ${petId} no encontrada`);
        }

        // Valida ownership
        this.validatePetOwnership(pet, user);

        return pet;
    }

    /**
     * Valida que el usuario sea owner de la mascota o admin
     * Utiliza helper compartido con mensaje personalizado
     *
     * @param pet - Mascota a validar
     * @param user - Usuario que intenta acceder
     */
    private validatePetOwnership(pet: Pet, user: User): void {
        validatePetOwnership(pet, user, 'No tienes permiso para acceder a los registros de esta mascota');
    }

    /**
     * Maneja errores de base de datos
     * Utiliza helper compartido para consistencia
     *
     * @param error - Error capturado
     */
    private handleDBExceptions(error: any): never {
        handleDatabaseException(error, this.logger);
    }

    /**
     * Elimina todos los registros de grooming
     * Método utilitario para seed
     */
    async deleteAllRecords() {
        await this.groomingRecordRepository.delete({});
    }

}
