# Endpoint: Perfil Completo de Mascota

## Resumen

El frontend necesita un nuevo endpoint que devuelva toda la información consolidada de una mascota en una sola llamada.

## Endpoint Requerido

```
GET /api/pets/:id/complete-profile
```

**Permisos:** Usuario autenticado (propietario de la mascota) o Admin

## Respuesta Esperada

```typescript
{
  // Información básica de la mascota
  pet: {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
    breed?: string;
    birthDate: string; // ISO 8601
    gender: 'male' | 'female';
    color?: string;
    weight?: number;
    microchipNumber?: string;
    profilePhoto?: string; // URL de la foto
    temperament: 'friendly' | 'aggressive' | 'shy' | 'playful' | 'calm' | 'energetic';
    behaviorNotes: string[];
    generalNotes?: string;
    isActive: boolean;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    owner?: {
      id: string;
      fullName: string;
      email: string;
    }
  },

  // Historial médico
  medicalHistory: {
    recentVisits: MedicalRecord[]; // Últimas 5-10 visitas ordenadas por fecha DESC
    totalVisits: number; // Total de visitas médicas de esta mascota
  },

  // Vacunas
  vaccinations: {
    activeVaccines: Vaccination[]; // Vacunas activas/vigentes
    upcomingVaccines: Vaccination[]; // Vacunas próximas a vencer (próximos 30 días)
    totalVaccines: number; // Total de vacunas registradas
  },

  // Historial de peso (opcional, puede estar vacío si no se ha registrado)
  weightHistory: [
    {
      date: string; // ISO 8601
      weight: number;
      source: 'medical' | 'grooming' | 'manual'
    }
  ],

  // Historial de grooming
  groomingHistory: {
    recentSessions: GroomingRecord[]; // Últimas 5-10 sesiones ordenadas por fecha DESC
    totalSessions: number; // Total de sesiones de grooming
    lastSessionDate?: string; // ISO 8601 de la última sesión (si existe)
  },

  // Citas
  appointments: {
    upcoming: Appointment[]; // Citas futuras o pending/confirmed
    past: Appointment[]; // Citas pasadas (completed/cancelled)
    totalAppointments: number; // Total de citas
  },

  // Resumen calculado
  summary: {
    age: number; // Edad en años (puede ser decimal: 2.5 años)
    lastVisitDate?: string; // ISO 8601 de la última visita médica
    nextVaccinationDue?: string; // ISO 8601 de la próxima vacuna a aplicar
    totalSpentMedical: number; // Suma de todos los costos médicos
    totalSpentGrooming: number; // Suma de todos los costos de grooming
  }
}
```

## Detalles de los Sub-objetos

### MedicalRecord (en recentVisits)
```typescript
{
  id: string;
  petId: string;
  visitDate: string; // ISO 8601
  visitType: 'checkup' | 'emergency' | 'surgery' | 'vaccination' | 'followup' | 'dental';
  diagnosis?: string;
  treatment?: string;
  veterinarianName?: string;
  clinicName?: string;
  followUpDate?: string; // ISO 8601
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Vaccination (en activeVaccines / upcomingVaccines)
```typescript
{
  id: string;
  petId: string;
  medicalRecordId?: string; // Relación con registro médico si aplica
  vaccineName: string;
  administeredDate: string; // ISO 8601
  nextDueDate?: string; // ISO 8601
  veterinarianName?: string;
  batchNumber?: string;
  status: 'up_to_date' | 'due_soon' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### GroomingRecord (en recentSessions)
```typescript
{
  id: string;
  petId: string;
  sessionDate: string; // ISO 8601
  servicesPerformed: string[]; // Ej: ["Bath", "Haircut", "Nail Trim"]
  groomerName?: string;
  salonName?: string;
  serviceCost?: number;
  productsCost?: number;
  totalCost: number; // serviceCost + productsCost
  notes?: string;
  nextSessionDate?: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}
```

### Appointment (en upcoming / past)
```typescript
{
  id: string;
  customerId: string;
  petId: string;
  serviceId: string;
  date: string; // ISO 8601
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
  },

  pet?: {
    id: string;
    name: string;
    breed?: string;
  },

  customer?: {
    id: string;
    fullName: string;
    email: string;
  }
}
```

## Lógica de Negocio Recomendada

### 1. Validaciones
- Verificar que el usuario autenticado es el propietario de la mascota O es admin
- Verificar que la mascota existe y está activa (`isActive: true`)
- Si la mascota no existe: 404 Not Found
- Si el usuario no tiene permisos: 403 Forbidden

### 2. Queries Necesarias

**Mascota:**
```sql
SELECT * FROM pets WHERE id = :petId AND isActive = true
```

**Historial Médico:**
```sql
-- Visitas recientes
SELECT * FROM medical_records
WHERE petId = :petId
ORDER BY visitDate DESC
LIMIT 10

-- Total de visitas
SELECT COUNT(*) FROM medical_records WHERE petId = :petId
```

**Vacunas:**
```sql
-- Vacunas activas (vigentes)
SELECT * FROM vaccinations
WHERE petId = :petId
  AND status IN ('up_to_date', 'due_soon', 'overdue')
ORDER BY nextDueDate ASC

-- Vacunas próximas (dentro de 30 días)
SELECT * FROM vaccinations
WHERE petId = :petId
  AND nextDueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
  AND status = 'due_soon'

-- Total de vacunas
SELECT COUNT(*) FROM vaccinations WHERE petId = :petId
```

**Grooming:**
```sql
-- Sesiones recientes
SELECT * FROM grooming_records
WHERE petId = :petId
ORDER BY sessionDate DESC
LIMIT 10

-- Total de sesiones
SELECT COUNT(*) FROM grooming_records WHERE petId = :petId

-- Última sesión
SELECT MAX(sessionDate) FROM grooming_records WHERE petId = :petId
```

**Citas:**
```sql
-- Citas próximas (futuras o pending/confirmed)
SELECT * FROM appointments
WHERE petId = :petId
  AND (date >= NOW() OR status IN ('pending', 'confirmed'))
ORDER BY date ASC

-- Citas pasadas
SELECT * FROM appointments
WHERE petId = :petId
  AND date < NOW()
  AND status IN ('completed', 'cancelled')
ORDER BY date DESC
LIMIT 20

-- Total de citas
SELECT COUNT(*) FROM appointments WHERE petId = :petId
```

**Resumen - Cálculos:**
```sql
-- Edad (calcular en código o en query)
-- En código: Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))

-- Última visita médica
SELECT MAX(visitDate) FROM medical_records WHERE petId = :petId

-- Próxima vacuna
SELECT MIN(nextDueDate) FROM vaccinations
WHERE petId = :petId
  AND nextDueDate >= NOW()
  AND status != 'expired'

-- Gasto total médico
SELECT SUM(cost) FROM medical_records WHERE petId = :petId AND cost IS NOT NULL

-- Gasto total grooming
SELECT SUM(totalCost) FROM grooming_records WHERE petId = :petId AND totalCost IS NOT NULL
```

### 3. Optimización

**Importante:** Todas estas queries deberían ejecutarse en **paralelo** usando `Promise.all()` para mejorar el rendimiento.

```typescript
// Ejemplo en Node.js
const [
  pet,
  medicalRecords,
  totalVisits,
  vaccinations,
  upcomingVaccines,
  totalVaccines,
  groomingRecords,
  totalGrooming,
  lastGroomingDate,
  upcomingAppointments,
  pastAppointments,
  totalAppointments,
  lastVisitDate,
  nextVaccinationDate,
  totalSpentMedical,
  totalSpentGrooming
] = await Promise.all([
  // ... todas las queries
]);
```

## Ejemplo de Respuesta Real

```json
{
  "pet": {
    "id": "uuid-1234",
    "name": "Max",
    "species": "dog",
    "breed": "Golden Retriever",
    "birthDate": "2020-03-15T00:00:00.000Z",
    "gender": "male",
    "color": "Golden",
    "weight": 30.5,
    "temperament": "friendly",
    "behaviorNotes": ["Loves playing fetch", "Good with children"],
    "isActive": true,
    "createdAt": "2023-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  },
  "medicalHistory": {
    "recentVisits": [
      {
        "id": "med-001",
        "visitDate": "2024-01-05T10:00:00.000Z",
        "visitType": "checkup",
        "diagnosis": "Healthy, routine checkup",
        "cost": 50.00
      }
    ],
    "totalVisits": 8
  },
  "vaccinations": {
    "activeVaccines": [
      {
        "id": "vac-001",
        "vaccineName": "Rabies",
        "administeredDate": "2023-03-15T00:00:00.000Z",
        "nextDueDate": "2024-03-15T00:00:00.000Z",
        "status": "due_soon"
      }
    ],
    "upcomingVaccines": [],
    "totalVaccines": 5
  },
  "weightHistory": [
    {
      "date": "2024-01-05T00:00:00.000Z",
      "weight": 30.5,
      "source": "medical"
    }
  ],
  "groomingHistory": {
    "recentSessions": [
      {
        "id": "groom-001",
        "sessionDate": "2024-01-02T00:00:00.000Z",
        "servicesPerformed": ["Bath", "Haircut"],
        "totalCost": 45.00
      }
    ],
    "totalSessions": 12,
    "lastSessionDate": "2024-01-02T00:00:00.000Z"
  },
  "appointments": {
    "upcoming": [
      {
        "id": "apt-001",
        "date": "2024-02-15T14:00:00.000Z",
        "status": "confirmed",
        "service": {
          "name": "Grooming Session",
          "type": "grooming",
          "price": 45.00
        }
      }
    ],
    "past": [],
    "totalAppointments": 3
  },
  "summary": {
    "age": 3.8,
    "lastVisitDate": "2024-01-05T10:00:00.000Z",
    "nextVaccinationDue": "2024-03-15T00:00:00.000Z",
    "totalSpentMedical": 400.00,
    "totalSpentGrooming": 540.00
  }
}
```

## Notas de Implementación

1. **Paginación en recentVisits/recentSessions:** Limitar a 5-10 registros más recientes
2. **Status de Vacunas:** Calcular dinámicamente basado en `nextDueDate`:
   - `up_to_date`: nextDueDate > 30 días en el futuro
   - `due_soon`: nextDueDate entre 0-30 días
   - `overdue`: nextDueDate en el pasado
3. **Peso:** Si no hay `weightHistory`, devolver array vacío `[]`
4. **Costos:** Si es `null` en la DB, usar `0` en los cálculos
5. **Fechas:** Todas en formato ISO 8601 UTC
6. **Performance:** Usar índices en las columnas `petId`, `visitDate`, `sessionDate`, `date`

## Testing

**Casos a probar:**
- ✅ Mascota con datos completos (registros médicos, grooming, citas)
- ✅ Mascota nueva sin registros (arrays vacíos, totales en 0)
- ✅ Usuario no propietario (debe devolver 403)
- ✅ Mascota inexistente (debe devolver 404)
- ✅ Mascota inactiva (debe devolver 404)
- ✅ Admin puede ver cualquier mascota
