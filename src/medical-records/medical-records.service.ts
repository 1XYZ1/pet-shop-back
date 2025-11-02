import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import {
    CreateMedicalRecordDto,
    UpdateMedicalRecordDto,
    CreateVaccinationDto,
    UpdateVaccinationDto
} from './dto';
import { MedicalRecord, Vaccination } from './entities';
import { Pet } from '../pets/entities';
import { User } from '../auth/entities/user.entity';

/**
 * Servicio de Registros Médicos Veterinarios
 *
 * Funcionalidades principales:
 * - Gestión completa de registros médicos (consultas, cirugías, emergencias)
 * - Gestión de vacunaciones y alertas de refuerzo
 * - Validación de ownership: solo owner o admin pueden acceder
 * - Historial cronológico de atenciones veterinarias
 * - Control de vacunas próximas a vencer
 *
 * Seguridad:
 * - Valida que el usuario tenga acceso a la mascota antes de crear/ver registros
 * - Solo veterinarios/admins pueden crear registros médicos
 * - Owners pueden ver el historial de sus mascotas
 */
@Injectable()
export class MedicalRecordsService {

    private readonly logger = new Logger('MedicalRecordsService');

    constructor(
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,

        @InjectRepository(Vaccination)
        private readonly vaccinationRepository: Repository<Vaccination>,

        @InjectRepository(Pet)
        private readonly petRepository: Repository<Pet>,
    ) {}

    // ==================== MEDICAL RECORDS ====================

    /**
     * Crea un nuevo registro médico veterinario
     *
     * @param createMedicalRecordDto - Datos del registro médico
     * @param user - Usuario que crea el registro (veterinario o admin)
     * @returns El registro médico creado
     *
     * Validaciones:
     * - Verifica que la mascota exista
     * - Verifica que el usuario tenga permiso (owner de la mascota o admin)
     * - Asocia al usuario actual como veterinarian
     */
    async createMedicalRecord(
        createMedicalRecordDto: CreateMedicalRecordDto,
        user: User
    ): Promise<MedicalRecord> {
        const { petId, ...recordData } = createMedicalRecordDto;

        // Busca y valida la mascota
        const pet = await this.findAndValidatePet(petId, user);

        try {
            // Crea el registro médico
            const medicalRecord = this.medicalRecordRepository.create({
                ...recordData,
                pet,
                veterinarian: user,
            });

            await this.medicalRecordRepository.save(medicalRecord);

            return medicalRecord;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * Obtiene el historial médico completo de una mascota
     *
     * @param petId - UUID de la mascota
     * @param user - Usuario que solicita el historial
     * @returns Array de registros médicos ordenados cronológicamente (más recientes primero)
     *
     * Validaciones:
     * - Verifica que la mascota exista
     * - Verifica ownership (owner o admin)
     */
    async getMedicalRecordsByPet(petId: string, user: User): Promise<MedicalRecord[]> {
        // Valida UUID
        if (!isUUID(petId)) {
            throw new BadRequestException(`${petId} no es un UUID válido`);
        }

        // Busca y valida ownership
        await this.findAndValidatePet(petId, user);

        // Obtiene todos los registros médicos de la mascota
        const records = await this.medicalRecordRepository.find({
            where: { pet: { id: petId } },
            order: { visitDate: 'DESC' },
        });

        return records;
    }

    /**
     * Obtiene un registro médico específico por ID
     *
     * @param id - UUID del registro médico
     * @param user - Usuario que solicita el registro
     * @returns El registro médico
     *
     * @throws NotFoundException si no existe
     * @throws ForbiddenException si no tiene permiso
     */
    async findOneMedicalRecord(id: string, user: User): Promise<MedicalRecord> {
        if (!isUUID(id)) {
            throw new BadRequestException(`${id} no es un UUID válido`);
        }

        const record = await this.medicalRecordRepository.findOne({
            where: { id },
        });

        if (!record) {
            throw new NotFoundException(`Registro médico con id ${id} no encontrado`);
        }

        // Valida ownership a través de la mascota
        this.validatePetOwnership(record.pet, user);

        return record;
    }

    /**
     * Actualiza un registro médico existente
     *
     * @param id - UUID del registro a actualizar
     * @param updateMedicalRecordDto - Nuevos datos
     * @param user - Usuario que actualiza
     * @returns El registro actualizado
     */
    async updateMedicalRecord(
        id: string,
        updateMedicalRecordDto: UpdateMedicalRecordDto,
        user: User
    ): Promise<MedicalRecord> {
        // Valida que existe y tiene permiso
        const record = await this.findOneMedicalRecord(id, user);

        try {
            // Aplica los cambios
            const updatedRecord = await this.medicalRecordRepository.preload({
                id,
                ...updateMedicalRecordDto,
            });

            if (!updatedRecord) {
                throw new NotFoundException(`Registro médico con id ${id} no encontrado`);
            }

            await this.medicalRecordRepository.save(updatedRecord);

            return updatedRecord;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    // ==================== VACCINATIONS ====================

    /**
     * Registra una nueva vacuna aplicada a una mascota
     *
     * @param createVaccinationDto - Datos de la vacuna
     * @param user - Usuario que registra (veterinario o admin)
     * @returns La vacuna registrada
     */
    async createVaccination(
        createVaccinationDto: CreateVaccinationDto,
        user: User
    ): Promise<Vaccination> {
        const { petId, ...vaccinationData } = createVaccinationDto;

        // Busca y valida la mascota
        const pet = await this.findAndValidatePet(petId, user);

        try {
            // Crea el registro de vacuna
            const vaccination = this.vaccinationRepository.create({
                ...vaccinationData,
                pet,
                veterinarian: user,
            });

            await this.vaccinationRepository.save(vaccination);

            return vaccination;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * Obtiene todas las vacunas de una mascota
     *
     * @param petId - UUID de la mascota
     * @param user - Usuario que solicita
     * @returns Array de vacunas ordenadas por fecha de aplicación
     */
    async getVaccinationsByPet(petId: string, user: User): Promise<Vaccination[]> {
        if (!isUUID(petId)) {
            throw new BadRequestException(`${petId} no es un UUID válido`);
        }

        // Valida ownership
        await this.findAndValidatePet(petId, user);

        // Obtiene vacunas
        const vaccinations = await this.vaccinationRepository.find({
            where: { pet: { id: petId } },
            order: { administeredDate: 'DESC' },
        });

        return vaccinations;
    }

    /**
     * Obtiene vacunas próximas a vencer (dentro de los próximos 30 días)
     *
     * @param user - Usuario que solicita (admin ve todas, users solo sus mascotas)
     * @returns Array de vacunas con nextDueDate próximo
     *
     * Útil para:
     * - Alertas automáticas
     * - Recordatorios a clientes
     * - Dashboard de administración
     */
    async getUpcomingVaccinations(user: User): Promise<Vaccination[]> {
        // Calcula fecha límite (hoy + 30 días)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const isAdmin = user.roles.includes('admin');

        // Query base
        const queryBuilder = this.vaccinationRepository
            .createQueryBuilder('vaccination')
            .leftJoinAndSelect('vaccination.pet', 'pet')
            .leftJoinAndSelect('vaccination.veterinarian', 'veterinarian')
            .leftJoinAndSelect('pet.owner', 'owner')
            .where('vaccination.nextDueDate <= :dueDate', { dueDate: thirtyDaysFromNow })
            .andWhere('vaccination.nextDueDate >= :today', { today: new Date() })
            .orderBy('vaccination.nextDueDate', 'ASC');

        // Si no es admin, solo muestra vacunas de sus mascotas
        if (!isAdmin) {
            queryBuilder.andWhere('owner.id = :userId', { userId: user.id });
        }

        return await queryBuilder.getMany();
    }

    /**
     * Actualiza un registro de vacunación
     *
     * @param id - UUID de la vacuna
     * @param updateVaccinationDto - Nuevos datos
     * @param user - Usuario que actualiza
     * @returns La vacuna actualizada
     */
    async updateVaccination(
        id: string,
        updateVaccinationDto: UpdateVaccinationDto,
        user: User
    ): Promise<Vaccination> {
        if (!isUUID(id)) {
            throw new BadRequestException(`${id} no es un UUID válido`);
        }

        const vaccination = await this.vaccinationRepository.findOne({
            where: { id },
        });

        if (!vaccination) {
            throw new NotFoundException(`Vacuna con id ${id} no encontrada`);
        }

        // Valida ownership
        this.validatePetOwnership(vaccination.pet, user);

        try {
            const updatedVaccination = await this.vaccinationRepository.preload({
                id,
                ...updateVaccinationDto,
            });

            if (!updatedVaccination) {
                throw new NotFoundException(`Vacuna con id ${id} no encontrada`);
            }

            await this.vaccinationRepository.save(updatedVaccination);

            return updatedVaccination;

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Busca una mascota y valida que el usuario tenga permiso
     *
     * @param petId - UUID de la mascota
     * @param user - Usuario que solicita acceso
     * @returns La mascota si existe y tiene permiso
     *
     * @throws BadRequestException si el ID no es UUID
     * @throws NotFoundException si la mascota no existe
     * @throws ForbiddenException si no tiene permiso
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
     *
     * @param pet - Mascota a validar
     * @param user - Usuario que intenta acceder
     *
     * @throws ForbiddenException si no tiene permiso
     */
    private validatePetOwnership(pet: Pet, user: User): void {
        const isOwner = pet.owner.id === user.id;
        const isAdmin = user.roles.includes('admin');

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException(
                'No tienes permiso para acceder a los registros de esta mascota'
            );
        }
    }

    /**
     * Maneja errores de base de datos
     *
     * @param error - Error capturado
     */
    private handleDBExceptions(error: any): never {
        if (error.code === '23505') {
            throw new BadRequestException(error.detail);
        }

        this.logger.error(error);

        throw new InternalServerErrorException(
            'Error inesperado, revise los logs del servidor'
        );
    }

    /**
     * Elimina todos los registros médicos y vacunas
     * Método utilitario para seed
     */
    async deleteAllRecords() {
        await this.vaccinationRepository.delete({});
        await this.medicalRecordRepository.delete({});
    }

}
