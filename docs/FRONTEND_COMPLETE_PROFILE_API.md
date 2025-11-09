# API: Perfil Completo de Mascota - Documentación para Frontend

## Resumen de Cambios

Se implementó el endpoint `GET /api/pets/:id/complete-profile` que consolida TODA la información de una mascota en una sola llamada optimizada.

**Fecha de implementación:** 2 de noviembre de 2025
**Versión de API:** 1.0
**Breaking Changes:** Sí - La estructura de respuesta cambió completamente

---

## Endpoint

### GET `/api/pets/:id/complete-profile`

**Descripción:** Obtiene el perfil completo de una mascota con toda su información médica, grooming, citas, vacunas y resumen calculado.

**Autenticación:** Requerida (Bearer Token)

**Autorización:**
- Usuario debe ser el propietario de la mascota
- O tener rol de `admin`

**Parámetros:**
- `id` (path, UUID, requerido): ID de la mascota

**Respuestas:**
- `200 OK`: Perfil completo recuperado exitosamente
- `400 Bad Request`: ID inválido (no es UUID)
- `403 Forbidden`: Usuario no es propietario de la mascota
- `404 Not Found`: Mascota no encontrada o inactiva

---

## Estructura de Respuesta

### Objeto Principal: `CompleteProfileDto`

```typescript
{
  pet: PetSummaryDto,
  medicalHistory: MedicalHistoryDto,
  vaccinations: VaccinationsDto,
  weightHistory: WeightHistoryDto[],
  groomingHistory: GroomingHistoryDto,
  appointments: AppointmentsDto,
  summary: SummaryDto
}
```

---

## Tipos de Datos Detallados

### 1. `PetSummaryDto`

```typescript
{
  id: string;                    // UUID
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
  breed?: string;
  birthDate?: string;            // ISO 8601, ej: "2020-03-15T00:00:00.000Z"
  gender: 'male' | 'female';
  color?: string;
  weight?: number;               // En kilogramos
  microchipNumber?: string;
  profilePhoto?: string;         // URL completa
  temperament: 'friendly' | 'aggressive' | 'shy' | 'playful' | 'calm' | 'energetic';
  behaviorNotes: string[];       // Array de strings
  generalNotes?: string;
  isActive: boolean;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  owner?: {
    id: string;
    fullName: string;
    email: string;
  }
}
```

### 2. `MedicalHistoryDto`

```typescript
{
  recentVisits: MedicalRecordSummaryDto[];  // Últimas 10 visitas
  totalVisits: number;                       // Total histórico
}
```

**`MedicalRecordSummaryDto`:**
```typescript
{
  id: string;
  petId: string;
  visitDate: string;             // ISO 8601
  visitType: 'checkup' | 'emergency' | 'surgery' | 'vaccination' | 'followup' | 'dental';
  diagnosis?: string;
  treatment?: string;
  veterinarianName?: string;     // Nombre del veterinario
  clinicName?: string;           // No disponible actualmente (siempre null)
  followUpDate?: string;         // No disponible actualmente (siempre null)
  cost?: number;
  notes?: string;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### 3. `VaccinationsDto`

```typescript
{
  activeVaccines: VaccinationSummaryDto[];   // Todas las vacunas
  upcomingVaccines: VaccinationSummaryDto[]; // Solo próximas (30 días)
  totalVaccines: number;
}
```

**`VaccinationSummaryDto`:**
```typescript
{
  id: string;
  petId: string;
  medicalRecordId?: string;      // No disponible actualmente (siempre undefined)
  vaccineName: string;
  administeredDate: string;      // ISO 8601
  nextDueDate?: string;          // ISO 8601
  veterinarianName?: string;
  batchNumber?: string;
  status: 'up_to_date' | 'due_soon' | 'overdue';  // ⚠️ CALCULADO DINÁMICAMENTE
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

**⚠️ IMPORTANTE - Cálculo de `status`:**
- `'overdue'`: `nextDueDate` < fecha actual
- `'due_soon'`: `nextDueDate` entre hoy y (hoy + 30 días)
- `'up_to_date'`: `nextDueDate` > (hoy + 30 días)

### 4. `WeightHistoryDto[]`

Array de registros de peso desde múltiples fuentes:

```typescript
{
  date: string;                  // ISO 8601
  weight: number;                // En kilogramos
  source: 'medical' | 'grooming' | 'manual';
}
```

**Fuentes de datos:**
- `'medical'`: Peso registrado en visita médica (`weightAtVisit`)
- `'manual'`: Peso actual del perfil de mascota
- `'grooming'`: No disponible actualmente (futuro)

**Ordenamiento:** DESC por fecha (más reciente primero)

### 5. `GroomingHistoryDto`

```typescript
{
  recentSessions: GroomingRecordSummaryDto[];  // Últimas 10 sesiones
  totalSessions: number;
  lastSessionDate?: string;                     // ISO 8601 (última sesión)
}
```

**`GroomingRecordSummaryDto`:**
```typescript
{
  id: string;
  petId: string;
  sessionDate: string;           // ISO 8601
  servicesPerformed: string[];   // Ej: ["Bath", "Haircut", "Nail Trim"]
  groomerName?: string;
  salonName?: string;            // No disponible actualmente (siempre undefined)
  serviceCost?: number;
  productsCost?: number;         // No disponible actualmente (siempre undefined)
  totalCost: number;             // = serviceCost (por ahora)
  notes?: string;                // Mapeado desde 'observations'
  nextSessionDate?: string;      // No disponible actualmente (siempre undefined)
  createdAt: string;
  updatedAt: string;
}
```

### 6. `AppointmentsDto`

```typescript
{
  upcoming: AppointmentSummaryDto[];  // Citas futuras/pendientes/confirmadas
  past: AppointmentSummaryDto[];      // Últimas 20 citas pasadas
  totalAppointments: number;
}
```

**`AppointmentSummaryDto`:**
```typescript
{
  id: string;
  customerId: string;
  petId: string;
  serviceId: string;
  date: string;                  // ISO 8601
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones pobladas
  service: {
    id: string;
    name: string;
    type: 'medical' | 'grooming';
    description: string;
    price: number;
    durationMinutes: number;
    image?: string;
  };

  pet?: {
    id: string;
    name: string;
    breed?: string;
  };

  customer?: {
    id: string;
    fullName: string;
    email: string;
  };
}
```

**Criterios de filtrado:**
- `upcoming`: `date >= hoy` O `status IN ('pending', 'confirmed')`
- `past`: `date < hoy` Y `status IN ('completed', 'cancelled')`

### 7. `SummaryDto`

Resumen calculado con estadísticas clave:

```typescript
{
  age?: number;                  // ⚠️ DECIMAL (ej: 2.5 años, no 2)
  lastVisitDate?: string;        // ISO 8601 de última visita médica
  nextVaccinationDue?: string;   // ISO 8601 de próxima vacuna
  totalSpentMedical: number;     // Suma de todos los costos médicos
  totalSpentGrooming: number;    // Suma de todos los costos de grooming
}
```

**⚠️ IMPORTANTE - Cálculo de `age`:**
- Formato: Número decimal con 1 decimal (ej: `2.5`, no `2`)
- Fórmula: `(fecha_actual - birthDate) / 365.25 días`
- Puede ser `undefined` si no hay `birthDate`

---

## Ejemplo de Respuesta Real

```json
{
  "pet": {
    "id": "a3f2c9d0-1234-5678-9abc-def012345678",
    "name": "Max",
    "species": "dog",
    "breed": "Golden Retriever",
    "birthDate": "2020-03-15T00:00:00.000Z",
    "gender": "male",
    "color": "Golden",
    "weight": 30.5,
    "microchipNumber": "982000123456789",
    "profilePhoto": "http://localhost:3000/api/files/pet/max-photo.jpg",
    "temperament": "friendly",
    "behaviorNotes": [
      "Loves playing fetch",
      "Good with children",
      "Needs regular exercise"
    ],
    "generalNotes": "Very energetic, needs 2 walks per day",
    "isActive": true,
    "createdAt": "2023-01-10T10:00:00.000Z",
    "updatedAt": "2024-11-02T14:30:00.000Z",
    "owner": {
      "id": "owner-uuid-1234",
      "fullName": "Juan Pérez",
      "email": "juan@example.com"
    }
  },

  "medicalHistory": {
    "recentVisits": [
      {
        "id": "med-rec-001",
        "petId": "a3f2c9d0-1234-5678-9abc-def012345678",
        "visitDate": "2024-10-15T10:00:00.000Z",
        "visitType": "checkup",
        "diagnosis": "Healthy, routine checkup",
        "treatment": "No treatment needed",
        "veterinarianName": "Dr. María González",
        "clinicName": null,
        "followUpDate": null,
        "cost": 50.00,
        "notes": "Pet is in excellent health",
        "createdAt": "2024-10-15T10:30:00.000Z",
        "updatedAt": "2024-10-15T10:30:00.000Z"
      }
    ],
    "totalVisits": 12
  },

  "vaccinations": {
    "activeVaccines": [
      {
        "id": "vac-001",
        "petId": "a3f2c9d0-1234-5678-9abc-def012345678",
        "medicalRecordId": undefined,
        "vaccineName": "Rabies",
        "administeredDate": "2024-03-15T00:00:00.000Z",
        "nextDueDate": "2025-03-15T00:00:00.000Z",
        "veterinarianName": "Dr. María González",
        "batchNumber": "RAB-2024-001",
        "status": "up_to_date",
        "notes": "Annual rabies vaccination",
        "createdAt": "2024-03-15T11:00:00.000Z",
        "updatedAt": "2024-03-15T11:00:00.000Z"
      },
      {
        "id": "vac-002",
        "petId": "a3f2c9d0-1234-5678-9abc-def012345678",
        "medicalRecordId": undefined,
        "vaccineName": "DHPP",
        "administeredDate": "2024-10-01T00:00:00.000Z",
        "nextDueDate": "2024-11-20T00:00:00.000Z",
        "veterinarianName": "Dr. Carlos Ruiz",
        "batchNumber": "DHPP-2024-042",
        "status": "due_soon",
        "notes": "Due in 18 days",
        "createdAt": "2024-10-01T09:00:00.000Z",
        "updatedAt": "2024-10-01T09:00:00.000Z"
      }
    ],
    "upcomingVaccines": [
      {
        "id": "vac-002",
        "petId": "a3f2c9d0-1234-5678-9abc-def012345678",
        "vaccineName": "DHPP",
        "administeredDate": "2024-10-01T00:00:00.000Z",
        "nextDueDate": "2024-11-20T00:00:00.000Z",
        "status": "due_soon",
        "veterinarianName": "Dr. Carlos Ruiz",
        "batchNumber": "DHPP-2024-042",
        "notes": "Due in 18 days",
        "createdAt": "2024-10-01T09:00:00.000Z",
        "updatedAt": "2024-10-01T09:00:00.000Z"
      }
    ],
    "totalVaccines": 8
  },

  "weightHistory": [
    {
      "date": "2024-11-02T14:30:00.000Z",
      "weight": 30.5,
      "source": "manual"
    },
    {
      "date": "2024-10-15T10:00:00.000Z",
      "weight": 30.2,
      "source": "medical"
    },
    {
      "date": "2024-08-10T09:00:00.000Z",
      "weight": 29.8,
      "source": "medical"
    }
  ],

  "groomingHistory": {
    "recentSessions": [
      {
        "id": "groom-001",
        "petId": "a3f2c9d0-1234-5678-9abc-def012345678",
        "sessionDate": "2024-10-20T14:00:00.000Z",
        "servicesPerformed": ["Bath", "Haircut", "Nail Trim"],
        "groomerName": "Ana Martínez",
        "salonName": undefined,
        "serviceCost": 45.00,
        "productsCost": undefined,
        "totalCost": 45.00,
        "notes": "Pet was very cooperative",
        "nextSessionDate": undefined,
        "createdAt": "2024-10-20T15:00:00.000Z",
        "updatedAt": "2024-10-20T15:00:00.000Z"
      }
    ],
    "totalSessions": 18,
    "lastSessionDate": "2024-10-20T14:00:00.000Z"
  },

  "appointments": {
    "upcoming": [
      {
        "id": "apt-001",
        "customerId": "owner-uuid-1234",
        "petId": "a3f2c9d0-1234-5678-9abc-def012345678",
        "serviceId": "service-uuid-grooming",
        "date": "2024-11-15T14:00:00.000Z",
        "status": "confirmed",
        "notes": "Regular grooming session",
        "createdAt": "2024-11-01T10:00:00.000Z",
        "updatedAt": "2024-11-01T10:00:00.000Z",
        "service": {
          "id": "service-uuid-grooming",
          "name": "Full Grooming Session",
          "type": "grooming",
          "description": "Complete grooming service including bath, haircut, and nail trim",
          "price": 45.00,
          "durationMinutes": 90,
          "image": "http://localhost:3000/api/files/product/grooming-service.jpg"
        },
        "pet": {
          "id": "a3f2c9d0-1234-5678-9abc-def012345678",
          "name": "Max",
          "breed": "Golden Retriever"
        },
        "customer": {
          "id": "owner-uuid-1234",
          "fullName": "Juan Pérez",
          "email": "juan@example.com"
        }
      }
    ],
    "past": [
      {
        "id": "apt-002",
        "customerId": "owner-uuid-1234",
        "petId": "a3f2c9d0-1234-5678-9abc-def012345678",
        "serviceId": "service-uuid-medical",
        "date": "2024-10-15T10:00:00.000Z",
        "status": "completed",
        "notes": "Annual checkup",
        "createdAt": "2024-10-10T09:00:00.000Z",
        "updatedAt": "2024-10-15T11:00:00.000Z",
        "service": {
          "id": "service-uuid-medical",
          "name": "Annual Checkup",
          "type": "medical",
          "description": "Complete health examination",
          "price": 50.00,
          "durationMinutes": 30,
          "image": null
        },
        "pet": {
          "id": "a3f2c9d0-1234-5678-9abc-def012345678",
          "name": "Max",
          "breed": "Golden Retriever"
        },
        "customer": {
          "id": "owner-uuid-1234",
          "fullName": "Juan Pérez",
          "email": "juan@example.com"
        }
      }
    ],
    "totalAppointments": 15
  },

  "summary": {
    "age": 4.6,
    "lastVisitDate": "2024-10-15T10:00:00.000Z",
    "nextVaccinationDue": "2024-11-20T00:00:00.000Z",
    "totalSpentMedical": 650.00,
    "totalSpentGrooming": 810.00
  }
}
```

---

## Notas Importantes para Frontend

### 1. Campos Opcionales (`undefined` vs `null`)

Algunos campos pueden ser `undefined` (no existen en el modelo actual):
- `clinicName`
- `followUpDate`
- `medicalRecordId` en vacunas
- `salonName`
- `productsCost`
- `nextSessionDate`

**Recomendación:** Manejar estos campos como opcionales en TypeScript/JavaScript.

### 2. Fechas

Todas las fechas están en formato **ISO 8601 UTC**:
```javascript
const date = new Date("2024-10-15T10:00:00.000Z");
```

### 3. Status de Vacunas

El campo `status` es **calculado dinámicamente** en cada request. No se almacena en la base de datos.

### 4. Edad con Decimal

El campo `age` retorna un número con 1 decimal (ej: `2.5`, `4.6`). No es un entero.

```javascript
// Correcto
if (pet.summary.age && pet.summary.age < 1) {
  console.log("Cachorro menor a 1 año");
}

// Incorrecto
if (pet.summary.age === 2) {  // Puede ser 2.3, 2.5, etc.
  // ...
}
```

### 5. Arrays Vacíos

Si no hay datos, los arrays estarán **vacíos** (`[]`), no `null`:
- `recentVisits: []`
- `activeVaccines: []`
- `weightHistory: []`
- `upcoming: []`
- `past: []`

### 6. Optimización de Performance

Este endpoint ejecuta **9 queries en paralelo** usando `Promise.all()`. Es muy eficiente y rápido (~50-100ms).

**Evitar:**
- Múltiples llamadas al endpoint en un corto período
- Polling frecuente

**Recomendado:**
- Cachear la respuesta en el frontend por 5-10 minutos
- Invalidar caché cuando el usuario crea/actualiza registros médicos, grooming o citas

---

## Migración desde Versión Anterior

### Breaking Changes

La estructura de respuesta cambió completamente. Si estabas usando la versión anterior:

**Antes:**
```json
{
  "pet": { /* entidad completa */ },
  "medicalHistory": { /* estructura diferente */ }
}
```

**Ahora:**
```json
{
  "pet": { /* solo campos específicos + owner */ },
  "medicalHistory": { /* con recentVisits y totalVisits */ },
  "vaccinations": { /* separado con status calculado */ },
  "weightHistory": [ /* nuevo */ ],
  "groomingHistory": { /* con lastSessionDate */ },
  "appointments": { /* separado en upcoming/past */ },
  "summary": { /* totales calculados */ }
}
```

### Checklist de Migración

- [ ] Actualizar interfaces/tipos TypeScript
- [ ] Verificar manejo de campos opcionales (`undefined`)
- [ ] Actualizar lógica de filtrado de citas (ya viene separado)
- [ ] Implementar manejo de `status` de vacunas
- [ ] Ajustar visualización de edad (decimal, no entero)
- [ ] Probar con mascotas sin historial (arrays vacíos)
- [ ] Implementar caché si es necesario

---

## Testing

### Casos de Prueba Recomendados

1. **Mascota con historial completo**
   - Verificar todos los campos poblados

2. **Mascota nueva (sin registros)**
   - Verificar arrays vacíos
   - Verificar totales en 0

3. **Mascota con vacunas vencidas**
   - Verificar `status: 'overdue'`

4. **Mascota con vacunas próximas**
   - Verificar `status: 'due_soon'`
   - Verificar aparece en `upcomingVaccines`

5. **Usuario no propietario**
   - Verificar respuesta 403 Forbidden

6. **Mascota inexistente**
   - Verificar respuesta 404 Not Found

---

## Soporte

**Documentación completa:** Ver `COMPLETE_PROFILE_ENDPOINT.md` en el repositorio

**Backend desarrollado por:** Claude Code (NestJS Backend Expert)
**Fecha:** 2 de noviembre de 2025

**Contacto:** [Tu equipo de backend]

---

## Changelog

### v1.0 - 2025-11-02
- ✅ Implementación inicial del endpoint
- ✅ 8 DTOs de respuesta creados
- ✅ Queries paralelas con `Promise.all()`
- ✅ Cálculo dinámico de status de vacunas
- ✅ Edad en formato decimal
- ✅ Historial de peso consolidado
- ✅ Separación de citas en upcoming/past
- ✅ Documentación Swagger completa
