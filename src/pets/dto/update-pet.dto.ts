import { PartialType } from '@nestjs/swagger';
import { CreatePetDto } from './create-pet.dto';

/**
 * DTO para actualizar una mascota existente
 *
 * Hereda de CreatePetDto usando PartialType, lo que hace que todos
 * los campos sean opcionales y mantengan las mismas validaciones
 *
 * Permite actualizar uno o múltiples campos sin necesidad de enviar
 * toda la información de la mascota
 */
export class UpdatePetDto extends PartialType(CreatePetDto) {}
