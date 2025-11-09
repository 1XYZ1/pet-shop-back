import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones HTTP
 *
 * Propósito:
 * - Estandarizar el formato de respuesta de errores en toda la API
 * - Proporcionar información consistente al cliente
 * - Facilitar el debugging con timestamps y paths
 * - Evitar exposición de detalles sensibles del sistema
 *
 * Formato de respuesta:
 * ```json
 * {
 *   "statusCode": 400,
 *   "message": "Mensaje de error o array de mensajes",
 *   "error": "Bad Request",
 *   "timestamp": "2025-01-15T10:30:00.000Z",
 *   "path": "/api/products"
 * }
 * ```
 *
 * Uso:
 * Este filtro se registra globalmente en main.ts:
 * ```typescript
 * app.useGlobalFilters(new HttpExceptionFilter());
 * ```
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // Logger específico para el filtro de excepciones
  private readonly logger = new Logger('HttpExceptionFilter');

  /**
   * Intercepta y transforma todas las excepciones HTTP lanzadas en la aplicación
   *
   * @param exception - Excepción HTTP capturada
   * @param host - Contexto de ejecución (HTTP, WebSocket, RPC)
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    // Obtiene el contexto HTTP para acceder a request y response
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extrae el código de estado HTTP de la excepción
    const status = exception.getStatus();

    // Obtiene la respuesta de error de la excepción
    const exceptionResponse = exception.getResponse();

    // Extrae el mensaje de error (puede ser string o array)
    let errorMessage: string | string[];

    if (typeof exceptionResponse === 'string') {
      // Caso simple: mensaje directo
      errorMessage = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // Caso complejo: objeto con propiedad 'message'
      const responseObj = exceptionResponse as any;
      errorMessage = responseObj.message || 'Error desconocido';
    } else {
      errorMessage = 'Error inesperado';
    }

    // Determina el nombre del error basado en el status code
    const errorName = this.getErrorName(status);

    // Construye la respuesta estandarizada
    const errorResponse = {
      statusCode: status,
      message: errorMessage,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Logging estructurado para debugging
    // Solo loggea errores 5xx (errores de servidor) para evitar spam de logs
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `HTTP ${status} Error: ${JSON.stringify(errorMessage)}`,
        {
          path: request.url,
          method: request.method,
          statusCode: status,
          timestamp: errorResponse.timestamp,
        },
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      // Loggea errores 4xx como warnings (errores del cliente)
      this.logger.warn(
        `HTTP ${status} Client Error: ${request.method} ${request.url}`,
        {
          message: errorMessage,
          statusCode: status,
        },
      );
    }

    // Envía la respuesta JSON al cliente
    response.status(status).json(errorResponse);
  }

  /**
   * Obtiene el nombre descriptivo del error basado en el código HTTP
   *
   * @param statusCode - Código de estado HTTP
   * @returns Nombre descriptivo del error
   */
  private getErrorName(statusCode: number): string {
    // Mapeo de códigos HTTP a nombres descriptivos
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      402: 'Payment Required',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    // Retorna el nombre si existe, o un nombre genérico basado en la categoría
    return (
      errorNames[statusCode] ||
      (statusCode >= 500
        ? 'Server Error'
        : statusCode >= 400
        ? 'Client Error'
        : 'Error')
    );
  }
}
