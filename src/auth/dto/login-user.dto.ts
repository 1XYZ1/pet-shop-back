import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_VALIDATION_MESSAGE,
} from '../constants';


export class LoginUserDto {

    @IsString({ message: 'El correo debe ser un texto válido' })
    @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
    email: string;

    @IsString({ message: 'La contraseña debe ser un texto válido' })
    @MinLength(PASSWORD_MIN_LENGTH, {
        message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
    })
    @MaxLength(PASSWORD_MAX_LENGTH, {
        message: `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`
    })
    @Matches(PASSWORD_REGEX, {
        message: PASSWORD_VALIDATION_MESSAGE
    })
    password: string;

}