# Códigos de Error - Pet Shop API

Este documento describe todos los códigos de error HTTP utilizados en la API, sus escenarios y los mensajes user-facing esperados.

## Tabla de Contenido

- [Formato de Respuesta de Error](#formato-de-respuesta-de-error)
- [Códigos de Estado 4xx (Client Errors)](#códigos-de-estado-4xx-client-errors)
- [Códigos de Estado 5xx (Server Errors)](#códigos-de-estado-5xx-server-errors)
- [Errores de Base de Datos](#errores-de-base-de-datos)
- [Errores de Validación](#errores-de-validación)
- [Errores por Módulo](#errores-por-módulo)

---

## Formato de Respuesta de Error

Todas las respuestas de error siguen un formato estandarizado:

```json
{
  "statusCode": 400,
  "message": "Mensaje descriptivo del error o array de mensajes",
  "error": "Bad Request",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/products"
}
```

**Campos:**
- `statusCode`: Código HTTP del error
- `message`: Mensaje(s) descriptivo(s) en español para el usuario
- `error`: Nombre descriptivo del tipo de error
- `timestamp`: Marca de tiempo ISO 8601
- `path`: Ruta del endpoint donde ocurrió el error

---

## Códigos de Estado 4xx (Client Errors)

### 400 Bad Request

**Descripción:** La solicitud contiene datos inválidos o no puede ser procesada.

**Escenarios comunes:**

#### Validación de DTOs
```json
{
  "statusCode": 400,
  "message": [
    "El correo debe ser un texto válido",
    "Ingresa un correo electrónico válido",
    "La contraseña debe tener al menos 6 caracteres"
  ],
  "error": "Bad Request"
}
```

#### Stock insuficiente
```json
{
  "statusCode": 400,
  "message": "Insufficient stock. Available: 5, Requested: 10",
  "error": "Bad Request"
}
```

#### Talla no disponible
```json
{
  "statusCode": 400,
  "message": "Size 'XXL' is not available for this product. Available sizes: S, M, L, XL",
  "error": "Bad Request"
}
```

#### Violación de constraint único (23505)
```json
{
  "statusCode": 400,
  "message": "Ya existe un registro con estos datos",
  "error": "Bad Request"
}
```

#### Campo requerido faltante (23502)
```json
{
  "statusCode": 400,
  "message": "Falta un campo requerido",
  "error": "Bad Request"
}
```

---

### 401 Unauthorized

**Descripción:** Autenticación requerida o credenciales inválidas.

**Escenarios comunes:**

#### Token no proporcionado
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Token expirado
```json
{
  "statusCode": 401,
  "message": "Token has expired",
  "error": "Unauthorized"
}
```

#### Credenciales incorrectas
```json
{
  "statusCode": 401,
  "message": "Credentials are not valid (email)",
  "error": "Unauthorized"
}
```

**Endpoints afectados:** Todos los que usan `@Auth()` decorator

---

### 403 Forbidden

**Descripción:** El usuario está autenticado pero no tiene permisos para esta acción.

**Escenarios comunes:**

#### Falta de rol requerido
```json
{
  "statusCode": 403,
  "message": "User needs admin role",
  "error": "Forbidden"
}
```

#### Violación de ownership
```json
{
  "statusCode": 403,
  "message": "No tienes permiso para acceder a esta mascota",
  "error": "Forbidden"
}
```

**Endpoints afectados:** Rutas con `@Auth(ValidRoles.admin)`

---

### 404 Not Found

**Descripción:** El recurso solicitado no existe.

**Escenarios comunes:**

#### Producto no encontrado
```json
{
  "statusCode": 404,
  "message": "Product with abc-123-def not found",
  "error": "Not Found"
}
```

#### Mascota no encontrada
```json
{
  "statusCode": 404,
  "message": "Pet with ID '123e4567-e89b-12d3-a456-426614174000' not found",
  "error": "Not Found"
}
```

#### Imagen no encontrada
```json
{
  "statusCode": 404,
  "message": "No se encontró la imagen del producto: product-123.jpg",
  "error": "Not Found"
}
```

---

### 409 Conflict

**Descripción:** La solicitud entra en conflicto con el estado actual del recurso.

**Escenarios comunes:**

#### Transición de estado inválida
```json
{
  "statusCode": 409,
  "message": "Cannot transition from COMPLETED to PENDING",
  "error": "Conflict"
}
```

---

## Códigos de Estado 5xx (Server Errors)

### 500 Internal Server Error

**Descripción:** Error inesperado del servidor.

**Escenario:**
```json
{
  "statusCode": 500,
  "message": "Error inesperado, revise los logs del servidor",
  "error": "Internal Server Error"
}
```

**Nota:** Estos errores se loggean completos en el servidor pero NO se exponen detalles al cliente.

---

## Errores de Base de Datos

La aplicación maneja automáticamente errores específicos de PostgreSQL:

| Código PG | Descripción | HTTP Status | Mensaje User-Facing |
|-----------|-------------|-------------|---------------------|
| 23505 | Unique constraint violation | 400 | Ya existe un registro con estos datos |
| 23503 | Foreign key violation | 400 | Referencia inválida a otro registro |
| 23502 | NOT NULL violation | 400 | Falta un campo requerido |
| 23514 | CHECK constraint violation | 400 | Valor no válido para este campo |

**Implementación:** `src/common/helpers/database-exception.helper.ts`

---

## Errores de Validación

Los errores de validación provienen de `class-validator` y retornan arrays de mensajes:

### Ejemplo: Registro de usuario
```json
{
  "statusCode": 400,
  "message": [
    "El correo debe ser un texto válido",
    "Ingresa un correo electrónico válido",
    "La contraseña debe tener al menos 6 caracteres",
    "La contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial"
  ],
  "error": "Bad Request"
}
```

### Validaciones comunes por tipo de campo:

#### Email
- `"El correo debe ser un texto válido"`
- `"Ingresa un correo electrónico válido"`

#### Contraseña
- `"La contraseña debe ser un texto válido"`
- `"La contraseña debe tener al menos 6 caracteres"`
- `"La contraseña no puede exceder 50 caracteres"`
- `"La contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial"`

#### Números
- `"El precio debe ser un número válido"`
- `"El precio debe ser mayor a cero"`
- `"El stock debe ser un número entero"`

#### UUIDs
- `"El ID de producto debe ser un UUID válido"`
- `"El ID de mascota debe ser un UUID válido"`

#### Enums
- `"El tipo de producto no es válido"`
- `"La especie seleccionada no es válida"`
- `"El género seleccionado no es válido"`

---

## Errores por Módulo

### Auth Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Email duplicado | 400 | No se pudo crear la cuenta. Por favor, intenta con otros datos. |
| Email inválido | 400 | Ingresa un correo electrónico válido |
| Contraseña débil | 400 | La contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial |
| Credenciales incorrectas (email) | 401 | Credentials are not valid (email) |
| Credenciales incorrectas (password) | 401 | Credentials are not valid (password) |
| Sin rol necesario | 403 | User needs admin role |

### Products Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Producto no encontrado | 404 | Product with {term} not found |
| Título duplicado | 400 | Ya existe un registro con estos datos |
| Título vacío | 400 | El título no puede estar vacío |
| Precio negativo | 400 | El precio debe ser mayor a cero |
| Stock negativo | 400 | El stock debe ser mayor a cero |
| Imagen no encontrada | 404 | No se encontró la imagen del producto: {filename} |

### Cart Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Producto no existe | 404 | Product with {id} not found |
| Talla no disponible | 400 | Size '{size}' is not available for this product. Available sizes: {sizes} |
| Stock insuficiente (agregar) | 400 | Insufficient stock. Available: {stock}, Requested: {quantity} |
| Stock insuficiente (actualizar) | 400 | Cannot add {qty} more. You already have {existing} in cart. Stock available: {stock} |
| Item no encontrado | 404 | Cart item with ID '{id}' not found in your cart |
| Límite de sincronización | 400 | Cannot sync more than 50 items at once. Please reduce the number of items. |

### Pets Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Mascota no encontrada | 404 | Pet with ID '{id}' not found |
| Sin permiso para ver mascota | 403 | No tienes permiso para acceder a esta mascota |
| Nombre vacío | 400 | El nombre no puede estar vacío |
| Peso negativo | 400 | El peso debe ser mayor a cero |
| Fecha futura | 400 | La fecha de nacimiento no puede ser en el futuro |
| Microchip duplicado | 400 | Ya existe un registro con estos datos |

### Services Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Servicio no encontrado | 404 | Service with ID {id} not found |
| Nombre duplicado | 400 | Ya existe un registro con estos datos |
| Nombre muy corto | 400 | El nombre debe tener al menos 3 caracteres |
| Precio negativo | 400 | El precio debe ser mayor a cero |
| Duración negativa | 400 | La duración debe ser mayor a cero |

### Appointments Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Cita no encontrada | 404 | Appointment with ID {id} not found |
| Mascota no pertenece al usuario | 403 | Pet does not belong to the authenticated user |
| Servicio no encontrado | 404 | Service with ID {id} not found |
| Fecha inválida | 400 | La fecha debe estar en formato ISO 8601 válido |
| Transición de estado inválida | 409 | Cannot transition from {current} to {new} |

### Medical Records Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Registro no encontrado | 404 | Medical record with ID {id} not found |
| Sin permiso para ver registro | 403 | No tienes permiso para acceder a estos registros médicos |
| Mascota no encontrada | 404 | Pet with ID '{id}' not found |
| Fecha requerida | 400 | Visit date is required |
| Tipo de visita inválido | 400 | Visit type must be a valid enum value |

### Grooming Records Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Registro no encontrado | 404 | Grooming record with ID {id} not found |
| Sin permiso para ver registro | 403 | No tienes permiso para acceder a estos registros de grooming |
| Mascota no encontrada | 404 | Pet with ID '{id}' not found |
| Fecha requerida | 400 | Session date is required |

### Files Module

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Imagen producto no encontrada | 404 | No se encontró la imagen del producto: {filename} |
| Imagen mascota no encontrada | 404 | No se encontró la imagen de la mascota: {filename} |
| Formato archivo inválido | 400 | File must be jpg/jpeg/png/gif |
| Archivo muy grande | 413 | File size exceeds maximum allowed |

### WebSocket (Messages WS)

| Escenario | Status | Mensaje |
|-----------|--------|---------|
| Usuario no encontrado | Error | Usuario no encontrado |
| Usuario inactivo | Error | Usuario no activo |
| Token inválido | Error | Invalid token |

---

## Best Practices para Manejo de Errores

### Para Desarrolladores Backend:

1. **Usar el helper centralizado:**
   ```typescript
   try {
     await this.repository.save(entity);
   } catch (error) {
     handleDatabaseException(error, this.logger);
   }
   ```

2. **Mensajes personalizados:**
   ```typescript
   handleDatabaseException(error, this.logger, {
     uniqueViolation: 'Este email ya está registrado',
     foreignKeyViolation: 'La mascota especificada no existe'
   });
   ```

3. **Lanzar excepciones específicas:**
   ```typescript
   if (!product) {
     throw new NotFoundException(`Product with ID ${id} not found`);
   }
   ```

4. **NO exponer detalles internos:**
   ```typescript
   // ❌ MAL
   throw new Error(error.stack);

   // ✅ BIEN
   this.logger.error(error);
   throw new InternalServerErrorException('Error inesperado, revise los logs');
   ```

### Para Desarrolladores Frontend:

1. **Parsear respuestas de error:**
   ```typescript
   try {
     await api.post('/products', data);
   } catch (error) {
     if (error.response?.data?.message) {
       const messages = Array.isArray(error.response.data.message)
         ? error.response.data.message
         : [error.response.data.message];

       messages.forEach(msg => toast.error(msg));
     }
   }
   ```

2. **Manejar errores por status code:**
   ```typescript
   if (error.response?.status === 401) {
     // Redirigir a login
   } else if (error.response?.status === 403) {
     // Mostrar "Sin permisos"
   }
   ```

---

## Logging de Errores

Los errores se loggean con diferentes niveles según su gravedad:

### Error (500+)
```typescript
this.logger.error('Database exception:', error);
```

### Warning (400-499)
```typescript
this.logger.warn(`Intento de conexión con usuario inexistente: ${userId}`);
```

### Debug (información operacional)
```typescript
this.logger.debug(`Imagen de producto recuperada: ${imageName}`);
```

### Log (operaciones exitosas)
```typescript
this.logger.log(`Cliente conectado: ${user.fullName}`);
```

---

## Contacto y Soporte

Para reportar errores no documentados o sugerir mejoras:
- Revisar logs del servidor en caso de errores 5xx
- Verificar formato de request antes de reportar errores 4xx
- Consultar esta documentación antes de hacer cambios en mensajes de error

---

**Última actualización:** 2025-01-15
**Versión de la API:** 1.0
**Mantenedores:** Backend Team
