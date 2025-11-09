# 🐾 Pet Shop API V2 - Documentación de Cambios (Reestructuración Veterinaria)

**Fecha:** Noviembre 2025
**Versión:** 2.0.0
**Rama:** `feature/pet-shop-restructure`

---

## 📋 Resumen General

Esta actualización transforma la API de una tienda genérica a una **Pet Shop especializada** con productos para mascotas (gatos y perros) y un sistema completo de **servicios veterinarios y peluquería con agendamiento de citas**.

### Cambios Principales:

1. ✅ **Productos:** Campo `gender` eliminado → Campo `category` agregado (cats/dogs)
2. ✅ **Nuevo módulo:** Services (Servicios de peluquería y veterinaria)
3. ✅ **Nuevo módulo:** Appointments (Sistema de agendamiento de citas)
4. ✅ **Seed actualizado:** 30 productos para mascotas + 7 servicios + 7 citas de ejemplo

---

## 🔄 Cambios en Endpoints Existentes

### **Products Module**

#### ❌ DEPRECADO: Campo `gender`

**Antes:**
```typescript
{
  "gender": "men" | "women" | "kid" | "unisex"
}
```

**Ahora:**
```typescript
{
  "category": "cats" | "dogs"
}
```

#### Endpoints Modificados:

##### 1. `GET /api/products`
**Antes:**
```http
GET /api/products?gender=men&limit=10&offset=0
```

**Ahora:**
```http
GET /api/products?category=dogs&limit=10&offset=0
```

**Query Parameters:**
- `category?: 'cats' | 'dogs'` - Filtra por categoría (reemplaza a `gender`)
- `limit?: number` - Límite de resultados (default: 10)
- `offset?: number` - Offset para paginación (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Alimento Premium Perros Adultos",
      "price": 45.99,
      "description": "Alimento balanceado para perros adultos...",
      "slug": "alimento_premium_perros_adultos",
      "stock": 50,
      "sizes": ["3kg", "7kg", "15kg", "20kg"],
      "category": "dogs",  // ← CAMBIO
      "tags": ["alimento", "nutricion", "adultos"],
      "images": [
        {
          "id": "uuid",
          "url": "http://localhost:3000/api/files/product/dog-food-adult.jpg"
        }
      ],
      "user": {
        "id": "uuid",
        "email": "admin@petshop.com",
        "fullName": "Admin User"
      }
    }
  ],
  "total": 30,
  "limit": 10,
  "offset": 0
}
```

---

##### 2. `GET /api/products/filtered`
**Antes:**
```http
GET /api/products/filtered?gender=women&minPrice=10&maxPrice=100
```

**Ahora:**
```http
GET /api/products/filtered?category=cats&minPrice=10&maxPrice=100&sizes=M,L&tags=alimento,premium
```

**Query Parameters:**
- `category?: 'cats' | 'dogs'` - Filtra por categoría (reemplaza a `gender`)
- `minPrice?: number` - Precio mínimo
- `maxPrice?: number` - Precio máximo
- `sizes?: string` - Tallas separadas por coma (ej: "3kg,7kg,15kg")
- `tags?: string` - Tags separados por coma (ej: "alimento,premium")
- `limit?: number` - Límite de resultados (default: 10)
- `offset?: number` - Offset para paginación (default: 0)

---

##### 3. `POST /api/products` (Crear producto)
**🔐 Requiere autenticación**

**Body Antes:**
```json
{
  "title": "Product Name",
  "price": 100,
  "description": "Description...",
  "slug": "product-name",
  "stock": 10,
  "sizes": ["S", "M", "L"],
  "gender": "men",  // ← DEPRECADO
  "tags": ["tag1", "tag2"],
  "images": ["image1.jpg"]
}
```

**Body Ahora:**
```json
{
  "title": "Alimento Premium Gatos Adultos",
  "price": 38.99,
  "description": "Alimento balanceado para gatos adultos...",
  "slug": "alimento_premium_gatos_adultos",
  "stock": 45,
  "sizes": ["1kg", "3kg", "7kg"],
  "category": "cats",  // ← NUEVO (requerido)
  "tags": ["alimento", "nutricion", "adultos"],
  "images": ["cat-food-adult.jpg"]
}
```

**Validaciones:**
- `category` es **requerido** y debe ser `'cats'` o `'dogs'`

---

##### 4. `PATCH /api/products/:id` (Actualizar producto)
**🔐 Requiere autenticación**

El campo `gender` ya no es válido. Usar `category` en su lugar.

**Body:**
```json
{
  "category": "dogs",  // ← NUEVO
  "price": 49.99,
  "stock": 100
}
```

---

## ✨ Nuevos Endpoints - Services Module

Base URL: `/api/services`

### 1. `GET /api/services`
**🔐 Requiere autenticación**

Obtiene listado de servicios con paginación.

**Request:**
```http
GET /api/services?limit=10&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit?: number` - Límite de resultados (default: 10, max: 100)
- `offset?: number` - Offset para paginación (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Peluquería Canina Básica",
      "description": "Servicio de peluquería básica que incluye: baño, secado, corte de uñas y limpieza de oídos.",
      "price": 35.00,
      "durationMinutes": 90,
      "type": "grooming",
      "image": "grooming-basic.jpg",
      "isActive": true,
      "user": {
        "id": "uuid",
        "email": "admin@petshop.com",
        "fullName": "Admin User"
      },
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T10:00:00.000Z"
    }
  ],
  "total": 7,
  "limit": 10,
  "offset": 0
}
```

**Tipos de Servicio:**
- `grooming` - Peluquería canina
- `veterinary` - Consulta veterinaria

---

### 2. `GET /api/services/:term`
**🔐 Requiere autenticación**

Obtiene un servicio específico por ID o nombre.

**Request:**
```http
GET /api/services/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "name": "Peluquería Canina Básica",
  "description": "Servicio de peluquería básica...",
  "price": 35.00,
  "durationMinutes": 90,
  "type": "grooming",
  "image": "grooming-basic.jpg",
  "isActive": true,
  "user": {...},
  "createdAt": "2025-11-01T10:00:00.000Z",
  "updatedAt": "2025-11-01T10:00:00.000Z"
}
```

---

### 3. `POST /api/services`
**🔐 Requiere autenticación (ADMIN ONLY)**

Crea un nuevo servicio.

**Request:**
```http
POST /api/services
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Peluquería Canina Premium",
  "description": "Servicio completo de peluquería que incluye baño con productos premium...",
  "price": 65.00,
  "durationMinutes": 150,
  "type": "grooming",
  "image": "grooming-premium.jpg"
}
```

**Validaciones:**
- `name`: string, mínimo 3 caracteres, único
- `description`: string, mínimo 10 caracteres
- `price`: number, positivo
- `durationMinutes`: integer, positivo
- `type`: enum ("grooming" | "veterinary")
- `image`: string, opcional

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "name": "Peluquería Canina Premium",
  ...
}
```

---

### 4. `PATCH /api/services/:id`
**🔐 Requiere autenticación (ADMIN ONLY)**

Actualiza un servicio existente.

**Request:**
```http
PATCH /api/services/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "price": 40.00,
  "isActive": false
}
```

**Response:** `200 OK`

---

### 5. `DELETE /api/services/:id`
**🔐 Requiere autenticación (ADMIN ONLY)**

Elimina un servicio.

**Request:**
```http
DELETE /api/services/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
Authorization: Bearer {admin_token}
```

**Response:** `200 OK`

---

## 📅 Nuevos Endpoints - Appointments Module

Base URL: `/api/appointments`

### 1. `GET /api/appointments`
**🔐 Requiere autenticación**

Obtiene listado de citas.

**Permisos:**
- **Usuarios normales:** Solo ven sus propias citas
- **Administradores:** Ven todas las citas del sistema

**Request:**
```http
GET /api/appointments?status=pending&serviceId=uuid&dateFrom=2025-11-01&dateTo=2025-11-30&limit=10&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'` - Filtra por estado
- `serviceId?: string` - Filtra por servicio (UUID)
- `dateFrom?: string` - Fecha inicio (ISO 8601)
- `dateTo?: string` - Fecha fin (ISO 8601)
- `limit?: number` - Límite de resultados (default: 10, max: 100)
- `offset?: number` - Offset para paginación (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "appointment-uuid",
      "date": "2025-11-05T10:00:00.000Z",
      "status": "confirmed",
      "notes": "Primera vez que viene Max a peluquería",
      "petName": "Max",
      "petBreed": "Golden Retriever",
      "service": {
        "id": "service-uuid",
        "name": "Peluquería Canina Premium",
        "price": 65.00,
        "durationMinutes": 150,
        "type": "grooming"
      },
      "customer": {
        "id": "user-uuid",
        "email": "cliente1@petshop.com",
        "fullName": "Ana López"
      },
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T10:00:00.000Z"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

**Estados de Cita:**
- `pending` - Pendiente de confirmación
- `confirmed` - Confirmada
- `completed` - Completada
- `cancelled` - Cancelada

---

### 2. `GET /api/appointments/:id`
**🔐 Requiere autenticación**

Obtiene una cita específica.

**Permisos:**
- Solo el dueño de la cita o administradores pueden verla

**Request:**
```http
GET /api/appointments/appointment-uuid
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "appointment-uuid",
  "date": "2025-11-05T10:00:00.000Z",
  "status": "confirmed",
  "notes": "Primera vez que viene Max",
  "petName": "Max",
  "petBreed": "Golden Retriever",
  "service": {...},
  "customer": {...},
  "createdAt": "2025-11-01T10:00:00.000Z",
  "updatedAt": "2025-11-01T10:00:00.000Z"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido o no proporcionado
- `403 Forbidden` - Usuario no autorizado para ver esta cita
- `404 Not Found` - Cita no encontrada

---

### 3. `POST /api/appointments`
**🔐 Requiere autenticación**

Crea una nueva cita.

**Request:**
```http
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2025-11-10T14:00:00.000Z",
  "serviceId": "service-uuid",
  "petName": "Luna",
  "petBreed": "Pastor Alemán",
  "notes": "Primera consulta, necesita vacuna antirrábica"
}
```

**Validaciones:**
- `date`: string (ISO 8601), debe ser fecha futura
- `serviceId`: string (UUID), debe existir el servicio
- `petName`: string, mínimo 2 caracteres
- `petBreed`: string, opcional
- `notes`: string, opcional

**Response:** `201 Created`
```json
{
  "id": "new-appointment-uuid",
  "date": "2025-11-10T14:00:00.000Z",
  "status": "pending",
  "petName": "Luna",
  "petBreed": "Pastor Alemán",
  "notes": "Primera consulta...",
  "service": {...},
  "customer": {...},
  "createdAt": "2025-11-10T10:00:00.000Z",
  "updatedAt": "2025-11-10T10:00:00.000Z"
}
```

**Errores:**
- `400 Bad Request` - Validación fallida (fecha pasada, servicio no existe, etc.)
- `401 Unauthorized` - Token inválido

---

### 4. `PATCH /api/appointments/:id`
**🔐 Requiere autenticación**

Actualiza una cita existente.

**Permisos:**
- **Usuarios normales:** Solo pueden actualizar: `date`, `petName`, `petBreed`, `notes`
- **Administradores:** Pueden actualizar cualquier campo incluyendo `status`

**Request (Usuario normal):**
```http
PATCH /api/appointments/appointment-uuid
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "date": "2025-11-11T15:00:00.000Z",
  "notes": "Cambio de horario solicitado por el cliente"
}
```

**Request (Administrador):**
```http
PATCH /api/appointments/appointment-uuid
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Response:** `200 OK`

**Errores:**
- `403 Forbidden` - Usuario intenta actualizar cita de otro usuario o campo no autorizado
- `404 Not Found` - Cita no encontrada

---

### 5. `DELETE /api/appointments/:id`
**🔐 Requiere autenticación**

Cancela (no elimina) una cita cambiando su estado a `cancelled`.

**Permisos:**
- Solo el dueño de la cita o administradores pueden cancelarla

**Request:**
```http
DELETE /api/appointments/appointment-uuid
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Appointment cancelled successfully",
  "appointment": {
    "id": "appointment-uuid",
    "status": "cancelled",
    ...
  }
}
```

**Errores:**
- `403 Forbidden` - Usuario no autorizado
- `404 Not Found` - Cita no encontrada

---

## 🗄️ Nuevos Modelos de Datos

### Service Entity
```typescript
{
  id: string;                    // UUID
  name: string;                  // Nombre único del servicio
  description: string;           // Descripción detallada
  price: number;                 // Precio del servicio
  durationMinutes: number;       // Duración estimada en minutos
  type: 'grooming' | 'veterinary';
  image?: string;                // URL de imagen (opcional)
  isActive: boolean;             // Si el servicio está activo
  user: User;                    // Usuario que creó el servicio
  createdAt: Date;
  updatedAt: Date;
}
```

### Appointment Entity
```typescript
{
  id: string;                    // UUID
  date: Date;                    // Fecha y hora de la cita
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;                // Notas adicionales (opcional)
  petName: string;               // Nombre de la mascota
  petBreed?: string;             // Raza de la mascota (opcional)
  service: Service;              // Servicio reservado
  customer: User;                // Usuario que agendó la cita
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔐 Control de Acceso y Permisos

### Roles Disponibles:
- `user` - Usuario normal (cliente)
- `admin` - Administrador

### Matriz de Permisos:

| Recurso | Acción | User | Admin |
|---------|--------|------|-------|
| **Products** |
| GET /api/products | Ver productos | ✅ | ✅ |
| POST /api/products | Crear producto | ✅ | ✅ |
| PATCH /api/products/:id | Actualizar producto | ✅ (solo propios) | ✅ |
| DELETE /api/products/:id | Eliminar producto | ✅ (solo propios) | ✅ |
| **Services** |
| GET /api/services | Ver servicios | ✅ | ✅ |
| POST /api/services | Crear servicio | ❌ | ✅ |
| PATCH /api/services/:id | Actualizar servicio | ❌ | ✅ |
| DELETE /api/services/:id | Eliminar servicio | ❌ | ✅ |
| **Appointments** |
| GET /api/appointments | Ver citas | ✅ (solo propias) | ✅ (todas) |
| POST /api/appointments | Crear cita | ✅ | ✅ |
| PATCH /api/appointments/:id | Actualizar cita | ✅ (solo propias, campos limitados) | ✅ (todas, todos los campos) |
| DELETE /api/appointments/:id | Cancelar cita | ✅ (solo propias) | ✅ (todas) |

---

## 🌱 Seed Data (Datos de Ejemplo)

Para poblar la base de datos con datos de ejemplo, ejecutar:

```http
GET http://localhost:3000/api/seed
```

**⚠️ ADVERTENCIA:** Este endpoint eliminará todos los datos existentes y creará nuevos datos de prueba.

### Datos Incluidos:

#### Usuarios (8):
- **Admin:** `admin@petshop.com` / `Abc123` (rol: admin)
- **User:** `user@petshop.com` / `Abc123` (rol: user)
- **Cliente 1:** `cliente1@petshop.com` / `Abc123` (rol: user)
- **Cliente 2:** `cliente2@petshop.com` / `Abc123` (rol: user)
- **Cliente 3:** `cliente3@petshop.com` / `Abc123` (rol: user)
- **VIP 1:** `vip1@petshop.com` / `Abc123` (rol: user)
- **VIP 2:** `vip2@petshop.com` / `Abc123` (rol: user)
- **VIP 3:** `vip3@petshop.com` / `Abc123` (rol: user)

#### Productos (30):
- **15 para Perros:**
  - Alimentos (3): Premium adultos, cachorros, snacks dentales
  - Accesorios (3): Collar, correa, arnés
  - Juguetes (3): Pelota lanzadora, cuerda dental, kong
  - Higiene (3): Shampoo, cepillo, cortauñas
  - Descanso (3): Cama ortopédica, manta térmica, transportadora

- **15 para Gatos:**
  - Alimentos (3): Premium adultos, gatitos, snacks salmón
  - Accesorios (3): Collar antipulgas, comedero, fuente de agua
  - Juguetes (3): Ratón interactivo, varita plumas, túnel
  - Areneros (3): Arenero autolimpiable, arena carbón, cepillo
  - Descanso (3): Rascador torre, cama iglú, hamaca ventana

#### Servicios (7):
- **Grooming (3):**
  - Peluquería Canina Básica - $35 - 90min
  - Peluquería Canina Premium - $65 - 150min
  - Peluquería Express - $25 - 60min

- **Veterinary (4):**
  - Consulta Veterinaria General - $45 - 30min
  - Vacunación y Desparasitación - $55 - 20min
  - Consulta de Emergencia - $85 - 45min
  - Chequeo Geriátrico - $95 - 60min

#### Citas (7):
- 3 confirmadas (futuras)
- 2 pendientes (futuras)
- 1 completada (pasada)
- 1 cancelada (pasada)

---

## 🚨 Breaking Changes (Cambios No Compatibles)

### 1. ❌ Campo `gender` eliminado

**Impacto:** ALTO
**Acción requerida:** Actualizar todo el frontend que use `gender`

**Antes:**
```javascript
// Filtrar productos por género
fetch('/api/products?gender=men')

// Crear producto con género
{
  ...product,
  gender: 'women'
}
```

**Ahora:**
```javascript
// Filtrar productos por categoría
fetch('/api/products?category=dogs')

// Crear producto con categoría
{
  ...product,
  category: 'cats'
}
```

**Componentes afectados:**
- Filtros de productos
- Formularios de creación/edición de productos
- Cards/listas de productos
- Páginas de detalle de producto

---

### 2. 🔄 Estructura de respuesta de productos

**Antes:**
```json
{
  "id": "uuid",
  "title": "T-Shirt",
  "gender": "men",
  ...
}
```

**Ahora:**
```json
{
  "id": "uuid",
  "title": "Alimento Premium Perros",
  "category": "dogs",
  ...
}
```

---

### 3. 🆕 Nuevos valores de `sizes`

Ahora los tamaños reflejan pesos/medidas para mascotas:
- **Alimentos:** `"1kg"`, `"3kg"`, `"7kg"`, `"15kg"`, `"20kg"`
- **Accesorios:** `"S"`, `"M"`, `"L"`, `"XL"`
- **General:** `"500g"`, `"1kg"`, etc.

---

## 📝 Recomendaciones para el Frontend

### 1. **Actualización de Filtros**

Reemplazar selector de género por selector de categoría:

```jsx
// Antes
<select name="gender">
  <option value="men">Hombres</option>
  <option value="women">Mujeres</option>
  <option value="kid">Niños</option>
  <option value="unisex">Unisex</option>
</select>

// Ahora
<select name="category">
  <option value="">Todas las categorías</option>
  <option value="dogs">🐶 Para Perros</option>
  <option value="cats">🐱 Para Gatos</option>
</select>
```

---

### 2. **Integrar Módulo de Servicios**

Crear nuevas páginas/componentes:

```
/services                  → Lista de servicios disponibles
/services/:id              → Detalle de servicio
/appointments              → Mis citas (usuario)
/appointments/new          → Agendar nueva cita
/appointments/:id          → Detalle de cita
/admin/appointments        → Gestión de citas (admin)
```

---

### 3. **Gestión de Estado para Citas**

Considerar estados para UI:

```typescript
enum AppointmentStatus {
  PENDING = 'pending',      // Badge amarillo
  CONFIRMED = 'confirmed',  // Badge verde
  COMPLETED = 'completed',  // Badge gris
  CANCELLED = 'cancelled',  // Badge rojo
}
```

---

### 4. **Validación de Fechas en Frontend**

Al crear/editar citas, validar:
- ✅ Fecha debe ser futura
- ✅ Horario de atención (sugerido: 9:00 AM - 6:00 PM, Lunes a Sábado)
- ✅ No permitir citas en domingos o feriados

---

### 5. **Integración con Calendario**

Recomendación: Usar componente de calendario para:
- Mostrar disponibilidad de horarios
- Visualizar citas existentes
- Facilitar selección de fecha/hora

Librerías sugeridas:
- React: `react-big-calendar`, `fullcalendar`
- Vue: `vue-cal`, `fullcalendar-vue`
- Angular: `@fullcalendar/angular`

---

### 6. **Notificaciones y Confirmaciones**

Implementar feedback visual para:
- ✅ Cita creada exitosamente
- ✅ Cita confirmada
- ⚠️ Cita pendiente de confirmación
- ❌ Cita cancelada
- 📧 Recordatorio 24h antes (futuro)

---

## 🧪 Testing

### Endpoints a Probar:

1. **Products con nueva categoría:**
```bash
# Obtener productos de perros
curl -X GET "http://localhost:3000/api/products?category=dogs"

# Obtener productos de gatos
curl -X GET "http://localhost:3000/api/products?category=cats"
```

2. **Services:**
```bash
# Listar servicios
curl -X GET "http://localhost:3000/api/services" \
  -H "Authorization: Bearer {token}"

# Crear servicio (admin)
curl -X POST "http://localhost:3000/api/services" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Service",
    "description": "Test description",
    "price": 50,
    "durationMinutes": 60,
    "type": "grooming"
  }'
```

3. **Appointments:**
```bash
# Crear cita
curl -X POST "http://localhost:3000/api/appointments" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-15T10:00:00.000Z",
    "serviceId": "{service-uuid}",
    "petName": "Firulais",
    "petBreed": "Labrador"
  }'

# Ver mis citas
curl -X GET "http://localhost:3000/api/appointments" \
  -H "Authorization: Bearer {token}"
```

---

## 🐛 Errores Comunes

### 1. **400 Bad Request al crear producto**
```json
{
  "statusCode": 400,
  "message": ["category must be a valid enum value"],
  "error": "Bad Request"
}
```
**Solución:** Asegurarse de enviar `category: "cats"` o `category: "dogs"`

---

### 2. **403 Forbidden al ver cita de otro usuario**
```json
{
  "statusCode": 403,
  "message": "You can only access your own appointments",
  "error": "Forbidden"
}
```
**Solución:** Los usuarios solo pueden ver sus propias citas. Usar cuenta admin para ver todas.

---

### 3. **400 Bad Request al crear cita con fecha pasada**
```json
{
  "statusCode": 400,
  "message": "Appointment date must be in the future",
  "error": "Bad Request"
}
```
**Solución:** Usar fecha futura en formato ISO 8601.

---

### 4. **404 Not Found al buscar servicio**
```json
{
  "statusCode": 404,
  "message": "Service with id 'xxx' not found",
  "error": "Not Found"
}
```
**Solución:** Verificar que el UUID del servicio sea correcto. Ejecutar seed para crear servicios de ejemplo.

---

## 📊 Migración de Datos

Si tienes datos existentes en producción:

### Opción 1: Migración Manual (Recomendado)

```sql
-- 1. Agregar columna category
ALTER TABLE products ADD COLUMN category VARCHAR(10);

-- 2. Migrar datos (adaptar según tu lógica de negocio)
UPDATE products SET category = 'dogs' WHERE gender IN ('men', 'women');
UPDATE products SET category = 'cats' WHERE gender = 'kid';

-- 3. Hacer category NOT NULL
ALTER TABLE products ALTER COLUMN category SET NOT NULL;

-- 4. Eliminar columna gender
ALTER TABLE products DROP COLUMN gender;

-- 5. Crear índice
CREATE INDEX idx_products_category ON products(category);
```

### Opción 2: Sincronización Automática (Solo desarrollo)

TypeORM sincronizará automáticamente el schema cuando `synchronize: true`.

**⚠️ ADVERTENCIA:** NO usar en producción.

---

## 🔜 Mejoras Futuras Sugeridas

### Backend:
- [ ] Validación de horarios disponibles (evitar solapamiento)
- [ ] Sistema de notificaciones por email
- [ ] Recordatorios automáticos 24h antes de cita
- [ ] Soft delete en appointments (mantener historial)
- [ ] Estadísticas y reportes de citas
- [ ] Filtro de servicios por tipo en endpoint separado
- [ ] Implementar rate limiting

### Frontend:
- [ ] Dashboard de citas para usuarios
- [ ] Panel de administración para gestionar citas
- [ ] Calendario interactivo con disponibilidad
- [ ] Sistema de notificaciones push
- [ ] Exportar citas a PDF/Excel
- [ ] Filtros avanzados por rango de fechas
- [ ] Chat en tiempo real con veterinarios (WebSocket)

---

## 📞 Soporte

Para reportar bugs o solicitar features:
- **Email:** dev@petshop.com
- **Documentación completa:** [docs.petshop.com](http://docs.petshop.com)
- **API Swagger:** [http://localhost:3000/api](http://localhost:3000/api)

---

## 📄 Changelog

### [2.0.0] - 2025-11-01

#### Added
- ✅ Nuevo campo `category` en productos (cats/dogs)
- ✅ Módulo completo de Services (servicios veterinarios y peluquería)
- ✅ Módulo completo de Appointments (agendamiento de citas)
- ✅ 30 nuevos productos para mascotas en seed
- ✅ 7 servicios predefinidos en seed
- ✅ 7 citas de ejemplo en seed
- ✅ Validaciones de fechas futuras en appointments
- ✅ Control de acceso por roles en appointments
- ✅ Enums compartidos en módulo common

#### Changed
- 🔄 Campo `gender` reemplazado por `category` en productos
- 🔄 Valores de `sizes` actualizados para productos de mascotas
- 🔄 Seed completamente reescrito con productos para mascotas

#### Removed
- ❌ Campo `gender` eliminado de Product entity
- ❌ Validaciones de gender eliminadas de DTOs
- ❌ Filtros por gender eliminados de queries
- ❌ Productos genéricos eliminados del seed

#### Fixed
- 🐛 Eliminada lógica de "unisex" en filtros de productos

---

**Última actualización:** Noviembre 2025
**Versión del documento:** 1.0.0
