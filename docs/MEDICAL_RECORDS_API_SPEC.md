# Especificación API - Medical Records & Vaccinations

## 1. Medical Records (Registros Médicos)

### Estructura de MedicalRecord

```json
{
  "id": "med-123",
  "visitDate": "2025-11-03T10:00:00.000Z",     // ✅ REQUERIDO - Fecha de la visita
  "reason": "Consulta general",                 // ⚠️ OPCIONAL - Motivo de la visita
  "diagnosis": "Saludable",                     // ⚠️ OPCIONAL
  "treatment": "Vitaminas prescritas",          // ⚠️ OPCIONAL
  "prescriptions": [                            // ⚠️ OPCIONAL - Array de medicamentos
    "Vitamina C - 1 tableta diaria",
    "Desparasitante - cada 3 meses"
  ],
  "vetNotes": "Mascota en excelente estado",    // ⚠️ OPCIONAL
  "followUpDate": "2026-11-03T10:00:00.000Z",   // ⚠️ OPCIONAL - Próxima cita
  "cost": 50.00,                                // ⚠️ OPCIONAL
  "createdAt": "2025-11-03T11:00:00.000Z",
  "updatedAt": "2025-11-03T11:00:00.000Z",
  "pet": {                                      // ⚠️ OPCIONAL
    "id": "pet-123",
    "name": "Bella",
    "breed": "Beagle",
    "species": "dog"
  },
  "veterinarian": {                             // ⚠️ OPCIONAL
    "id": "vet-456",
    "fullName": "Dr. García"
  }
}
```

---

## 2. Vaccinations (Vacunaciones)

### Estructura de Vaccination

```json
{
  "id": "vac-123",
  "vaccineName": "Rabia",                       // ✅ REQUERIDO - Nombre de la vacuna
  "administeredDate": "2025-01-15T00:00:00.000Z", // ✅ REQUERIDO - Fecha de aplicación
  "nextDueDate": "2026-01-15T00:00:00.000Z",    // ⚠️ OPCIONAL - Próxima dosis
  "batchNumber": "RAB-2025-001",                // ⚠️ OPCIONAL - Lote
  "veterinarian": "Dr. García",                 // ⚠️ OPCIONAL - Veterinario que aplicó
  "notes": "Primera dosis, sin reacciones",     // ⚠️ OPCIONAL
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "pet": {                                      // ⚠️ OPCIONAL
    "id": "pet-123",
    "name": "Bella",
    "breed": "Beagle",
    "species": "dog"
  }
}
```

---

## Endpoints - Medical Records

### GET /medical-records/pet/:petId

Devuelve array de registros médicos para una mascota:

```json
[
  {
    "id": "med-123",
    "visitDate": "2025-11-03T10:00:00.000Z",
    "reason": "Consulta general",
    "diagnosis": "Saludable",
    "treatment": "Vitaminas",
    "prescriptions": ["Vitamina C - 1 tableta diaria"],
    "vetNotes": "Mascota en excelente estado",
    "followUpDate": null,
    "cost": 50.00,
    "createdAt": "2025-11-03T11:00:00.000Z",
    "updatedAt": "2025-11-03T11:00:00.000Z"
  },
  {
    "id": "med-456",
    "visitDate": "2025-10-15T10:00:00.000Z",
    "reason": "Vacunación anual",
    "diagnosis": "Aplicación de vacunas",
    "treatment": "Rabia + Parvovirus",
    "cost": 35.00,
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z"
  }
]
```

### GET /medical-records/:id

Devuelve un registro médico individual.

### POST /medical-records

**Body esperado:**

```json
{
  "petId": "pet-123",                           // ✅ REQUERIDO
  "visitDate": "2025-11-03T10:00:00.000Z",      // ✅ REQUERIDO
  "reason": "Consulta general",
  "diagnosis": "Saludable",
  "treatment": "Vitaminas",
  "prescriptions": ["Vitamina C - 1 tableta diaria"],
  "vetNotes": "Mascota en excelente estado",
  "followUpDate": "2026-11-03T10:00:00.000Z",
  "cost": 50.00
}
```

### PATCH /medical-records/:id

Actualiza un registro médico existente.

### DELETE /medical-records/:id

Elimina un registro médico.

---

## Endpoints - Vaccinations

### GET /medical-records/vaccinations/pet/:petId

Devuelve array de vacunaciones para una mascota:

```json
[
  {
    "id": "vac-123",
    "vaccineName": "Rabia",
    "administeredDate": "2025-01-15T00:00:00.000Z",
    "nextDueDate": "2026-01-15T00:00:00.000Z",
    "batchNumber": "RAB-2025-001",
    "veterinarian": "Dr. García",
    "notes": "Primera dosis",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  {
    "id": "vac-456",
    "vaccineName": "Parvovirus",
    "administeredDate": "2024-11-15T00:00:00.000Z",
    "nextDueDate": "2025-11-15T00:00:00.000Z",
    "batchNumber": "PAR-2024-089",
    "veterinarian": "Dr. García",
    "notes": "Refuerzo anual",
    "createdAt": "2024-11-15T10:00:00.000Z",
    "updatedAt": "2024-11-15T10:00:00.000Z"
  }
]
```

### GET /medical-records/vaccinations/:id

Devuelve una vacunación individual.

### POST /medical-records/vaccinations

**Body esperado:**

```json
{
  "petId": "pet-123",                           // ✅ REQUERIDO
  "vaccineName": "Rabia",                       // ✅ REQUERIDO
  "administeredDate": "2025-01-15T00:00:00.000Z", // ✅ REQUERIDO
  "nextDueDate": "2026-01-15T00:00:00.000Z",
  "batchNumber": "RAB-2025-001",
  "veterinarian": "Dr. García",
  "notes": "Primera dosis, sin reacciones"
}
```

### PATCH /medical-records/vaccinations/:id

Actualiza una vacunación existente.

### DELETE /medical-records/vaccinations/:id

Elimina una vacunación.

### GET /medical-records/vaccinations/due

Devuelve vacunaciones próximas a vencer (para admin):

```json
[
  {
    "id": "vac-456",
    "vaccineName": "Parvovirus",
    "administeredDate": "2024-11-15T00:00:00.000Z",
    "nextDueDate": "2025-11-15T00:00:00.000Z",
    "pet": {
      "id": "pet-123",
      "name": "Bella",
      "breed": "Beagle",
      "species": "dog"
    }
  }
]
```

---

## Uso en Complete Profile

Cuando se llama a `GET /pets/:id/complete-profile`, debe incluir:

### Medical History

```json
{
  "medicalHistory": {
    "recentVisits": [
      {
        "id": "med-123",
        "visitDate": "2025-11-03T10:00:00.000Z",  // ✅ REQUERIDO
        "reason": "Consulta general",
        "diagnosis": "Saludable",
        "treatment": "Vitaminas",
        "cost": 50.00,
        "createdAt": "2025-11-03T11:00:00.000Z",
        "updatedAt": "2025-11-03T11:00:00.000Z"
      }
    ],
    "totalVisits": 5
  }
}
```

**Si no hay historial médico:**
```json
{
  "medicalHistory": {
    "recentVisits": [],
    "totalVisits": 0
  }
}
```

### Vaccinations

```json
{
  "vaccinations": {
    "activeVaccines": [
      {
        "id": "vac-123",
        "vaccineName": "Rabia",                   // ✅ REQUERIDO
        "administeredDate": "2025-01-15T00:00:00.000Z", // ✅ REQUERIDO
        "nextDueDate": "2026-01-15T00:00:00.000Z",
        "veterinarian": "Dr. García",
        "notes": "Primera dosis",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "upcomingVaccines": [
      {
        "id": "vac-456",
        "vaccineName": "Parvovirus",
        "administeredDate": "2024-11-15T00:00:00.000Z",
        "nextDueDate": "2025-11-15T00:00:00.000Z",
        "notes": "Próxima a vencer",
        "createdAt": "2024-11-15T10:00:00.000Z",
        "updatedAt": "2024-11-15T10:00:00.000Z"
      }
    ],
    "totalVaccines": 8
  }
}
```

**Si no hay vacunaciones:**
```json
{
  "vaccinations": {
    "activeVaccines": [],
    "upcomingVaccines": [],
    "totalVaccines": 0
  }
}
```

---

## Campos Críticos para el Timeline

El componente `PetActivityTimeline` usa estos campos específicos:

### Para Medical Records:
- `id` - ✅ REQUERIDO
- `visitDate` - ✅ REQUERIDO (usada para ordenar eventos)
- `reason` - ⚠️ OPCIONAL (pero recomendado para descripción)

Si `reason` no está presente, se muestra "Visita médica general"

### Para Vaccinations:
- `id` - ✅ REQUERIDO
- `administeredDate` - ✅ REQUERIDO (usada para ordenar eventos)
- `vaccineName` - ✅ REQUERIDO (usado en descripción)

---

## Validaciones del Frontend

El frontend tiene validaciones defensivas:
- ✅ Verifica que campos requeridos existen antes de procesar
- ✅ Usa optional chaining (`?.`) para campos anidados
- ✅ Proporciona valores por defecto si faltan campos opcionales
- ✅ No rompe la aplicación si falta información

---

## Tipos TypeScript (Referencia)

### MedicalRecord
```typescript
export interface MedicalRecord {
  id: string;
  visitDate: Date | string;          // ✅ REQUERIDO
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string[];          // Array de strings
  vetNotes?: string;
  followUpDate?: Date | string;
  cost?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  pet?: PetNested;
  veterinarian?: {
    id: string;
    fullName: string;
  };
}
```

### Vaccination
```typescript
export interface Vaccination {
  id: string;
  vaccineName: string;               // ✅ REQUERIDO
  administeredDate: Date | string;   // ✅ REQUERIDO
  nextDueDate?: Date | string;
  batchNumber?: string;
  veterinarian?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  pet?: PetNested;
}
```

---

## Códigos HTTP

- **200 OK** - Éxito
- **201 Created** - Registro creado (POST)
- **404 Not Found** - Registro no encontrado
- **400 Bad Request** - Datos inválidos
- **401 Unauthorized** - No autenticado
- **403 Forbidden** - Sin permisos

---

## Checklist para el Backend

### Medical Records
- [ ] `visitDate` siempre está presente
- [ ] `reason` está presente (recomendado para mejor UX)
- [ ] Fechas en formato ISO 8601
- [ ] `prescriptions` es array de strings si se incluye

### Vaccinations
- [ ] `vaccineName` siempre está presente
- [ ] `administeredDate` siempre está presente
- [ ] Fechas en formato ISO 8601
- [ ] `activeVaccines` contiene vacunas vigentes
- [ ] `upcomingVaccines` contiene vacunas próximas a vencer

### Complete Profile
- [ ] `medicalHistory` siempre está presente (puede tener arrays vacíos)
- [ ] `vaccinations` siempre está presente (puede tener arrays vacíos)
- [ ] `recentVisits` ordenadas por fecha descendente (más reciente primero)
- [ ] `activeVaccines` y `upcomingVaccines` están poblados correctamente
