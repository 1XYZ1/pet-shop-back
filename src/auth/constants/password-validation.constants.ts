/**
 * Constantes de validación de contraseña
 *
 * Este módulo centraliza las reglas de validación de contraseñas utilizadas
 * en el sistema de autenticación, facilitando su reutilización tanto en
 * backend como en frontend.
 */

/**
 * Regex de validación de contraseña
 *
 * Descomposición del patrón:
 * - (?:(?=.*\d)|(?=.*\W+)): Lookahead no capturante que requiere AL MENOS
 *   un dígito (\d) O al menos un carácter especial (\W+)
 * - (?![.\n]): Lookahead negativo que NO permite punto seguido de salto de línea
 * - (?=.*[A-Z]): Lookahead que requiere AL MENOS una letra mayúscula
 * - (?=.*[a-z]): Lookahead que requiere AL MENOS una letra minúscula
 * - .*$: Coincide con cualquier carácter hasta el final de la cadena
 *
 * Requisitos finales:
 * - Al menos una letra mayúscula (A-Z)
 * - Al menos una letra minúscula (a-z)
 * - Al menos un número (0-9) O un carácter especial (!@#$%^&*, etc.)
 * - Longitud entre PASSWORD_MIN_LENGTH y PASSWORD_MAX_LENGTH caracteres
 * - No permite saltos de línea precedidos por punto
 *
 * @example
 * // Ejemplos de contraseñas VÁLIDAS:
 * "Password1"      // Tiene mayúscula, minúscula y número
 * "MyPass!"        // Tiene mayúscula, minúscula y carácter especial
 * "Secret@2024"    // Combinación completa
 * "Abcdef1"        // Mínimo 6 caracteres con requisitos
 * "Test#Pass"      // Con carácter especial
 *
 * @example
 * // Ejemplos de contraseñas INVÁLIDAS:
 * "password"       // Falta mayúscula y número/especial
 * "PASSWORD"       // Falta minúscula y número/especial
 * "Pass"           // Muy corta (menos de 6 caracteres)
 * "password123"    // Falta mayúscula
 * "PASSWORD123"    // Falta minúscula
 * "Passw"          // Menos de 6 caracteres
 * "abcdefgh"       // Falta mayúscula y número/especial
 */
export const PASSWORD_REGEX = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

/**
 * Longitud mínima permitida para contraseñas
 *
 * Establece el límite inferior de caracteres que debe tener una contraseña.
 * Este valor se utiliza en conjunto con el decorador @MinLength() de class-validator.
 */
export const PASSWORD_MIN_LENGTH = 6;

/**
 * Longitud máxima permitida para contraseñas
 *
 * Establece el límite superior de caracteres que puede tener una contraseña.
 * Este valor se utiliza en conjunto con el decorador @MaxLength() de class-validator.
 *
 * Nota: Este límite ayuda a prevenir ataques de denegación de servicio (DoS)
 * mediante el envío de contraseñas extremadamente largas que consumirían
 * recursos excesivos durante el proceso de hashing con bcrypt.
 */
export const PASSWORD_MAX_LENGTH = 50;

/**
 * Mensaje de error de validación de contraseña
 *
 * Mensaje mostrado al usuario cuando la contraseña no cumple con los
 * requisitos del PASSWORD_REGEX. Este mensaje debe ser claro y explicativo
 * para guiar al usuario en la creación de una contraseña válida.
 *
 * Nota: El mensaje está en inglés para mantener consistencia con el resto
 * de mensajes de validación del sistema.
 */
export const PASSWORD_VALIDATION_MESSAGE =
  'The password must have a Uppercase, lowercase letter and a number';
