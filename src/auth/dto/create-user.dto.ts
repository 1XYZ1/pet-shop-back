import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_VALIDATION_MESSAGE,
} from '../constants';


export class CreateUserDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    @Matches(PASSWORD_REGEX, {
        message: PASSWORD_VALIDATION_MESSAGE
    })
    password: string;

    @IsString()
    @MinLength(1)
    fullName: string;

}