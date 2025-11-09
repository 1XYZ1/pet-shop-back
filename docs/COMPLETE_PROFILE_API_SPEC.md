# Especificación API - Perfil Completo de Mascota

## Endpoint

```
GET /pets/:id/complete-profile
```

## Descripción

Este endpoint debe devolver el perfil completo de una mascota incluyendo:
- Datos básicos de la mascota
- Historial médico reciente
- Vacunaciones activas y próximas
- Historial de peso
- Historial de grooming
- Citas programadas (pasadas y futuras)
- Resumen estadístico

## Estructura de Respuesta Esperada

### Objeto Principal

```typescript
{
  pet: Pet,                    // ✅ REQUERIDO - Objeto completo de la mascota
  medicalHistory: {...},       // ✅ REQUERIDO - Historial médico (puede estar vacío)
  vaccinations: {...},         // ✅ REQUERIDO - Vacunaciones (puede estar vacío)
  weightHistory: [...],        // ✅ REQUERIDO - Historial de peso (puede estar vacío [])
  groomingHistory: {...},      // ✅ REQUERIDO - Historial de grooming (puede estar vacío)
  appointments: {...},         // ✅ REQUERIDO - Citas (puede estar vacío)
  summary: {...}               // ⚠️ OPCIONAL - Resumen estadístico
}
```

---

## 1. Objeto `pet` (Mascota)

**REQUERIDO** - Datos completos de la mascota

```json
{
  "pet": {
    "id": "e3940a25-f2fd-422c-b34e-8df994e1e785",
    "name": "Bella",
    "species": "dog",                    // ✅ ENUM: dog|cat|bird|rabbit|hamster|fish|reptile|other
    "breed": "Beagle",                   // ⚠️ OPCIONAL (puede ser null)
    "birthDate": "2020-05-15T00:00:00.000Z",  // ⚠️ OPCIONAL (puede ser null) - ISO 8601
    "gender": "female",                  // ✅ ENUM: male|female|unknown
    "color": "Tricolor",                 // ⚠️ OPCIONAL (puede ser null)
    "weight": "10.50",                   // ⚠️ OPCIONAL - String o Number
    "microchipNumber": null,             // ⚠️ OPCIONAL (puede ser null)
    "profilePhoto": null,                // ⚠️ OPCIONAL (puede ser null)
    "temperament": "nervous",            // ✅ ENUM: friendly|aggressive|shy|playful|calm|energetic|nervous|unknown
    "behaviorNotes": [
      "Ansiedad por separación",
      "Ladradora"
    ],
    "generalNotes": "Necesita entrenamiento para ansiedad.",
    "isActive": true,
    "createdAt": "2025-11-03T07:56:22.648Z",
    "updatedAt": "2025-11-03T07:56:22.648Z",
    "owner": {                           // ⚠️ OPCIONAL - Información del dueño
      "id": "050b5821-f3a9-468f-84b1-c4a0ab538ca4",
      "fullName": "Ana López",
      "email": "cliente1@petshop.com"
    }
  }
}
```

### Notas Importantes para `pet`:
- ✅ **birthDate**: Puede ser `null` (mascota sin fecha de nacimiento). Frontend mostrará "Edad desconocida"
- ✅ **weight**: Acepta `string` o `number`. Ej: `"10.5"` o `10.5`
- ✅ **temperament**: Debe ser uno de los 8 valores válidos. Usa `"unknown"` si no está definido
- ✅ **behaviorNotes**: Array de strings, puede estar vacío `[]`

---

## 2. Objeto `medicalHistory`

**REQUERIDO** - Historial de visitas médicas recientes

```json
{
  "medicalHistory": {
    "recentVisits": [
      {
        "id": "med-123",
        "date": "2025-10-15T10:00:00.000Z",
        "reason": "Consulta general",
        "diagnosis": "Saludable",
        "treatment": "Vitaminas",
        "notes": "Todo normal",
        "cost": 50.00,
        "vetName": "Dr. García",
        "nextVisitDate": null,
        "createdAt": "2025-10-15T10:30:00.000Z",
        "updatedAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "totalVisits": 5
  }
}
```

**Si no hay historial médico, devolver:**
```json
{
  "medicalHistory": {
    "recentVisits": [],
    "totalVisits": 0
  }
}
```

---

## 3. Objeto `vaccinations`

**REQUERIDO** - Vacunaciones activas y próximas a aplicar

```json
{
  "vaccinations": {
    "activeVaccines": [
      {
        "id": "vac-123",
        "name": "Rabia",
        "dateApplied": "2025-01-15T00:00:00.000Z",
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
        "name": "Parvovirus",
        "dateApplied": "2024-11-15T00:00:00.000Z",
        "nextDueDate": "2025-11-15T00:00:00.000Z",
        "veterinarian": "Dr. García",
        "notes": "Refuerzo anual",
        "createdAt": "2024-11-15T10:00:00.000Z",
        "updatedAt": "2024-11-15T10:00:00.000Z"
      }
    ],
    "totalVaccines": 8
  }
}
```

**Si no hay vacunaciones, devolver:**
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

## 4. Array `weightHistory`

**REQUERIDO** - Historial de pesajes de la mascota

```json
{
  "weightHistory": [
    {
      "date": "2025-11-01T00:00:00.000Z",
      "weight": 10.5,              // Number o String
      "source": "medical"          // ✅ ENUM: medical|grooming|manual
    },
    {
      "date": "2025-10-01T00:00:00.000Z",
      "weight": "10.2",
      "source": "grooming"
    },
    {
      "date": "2025-09-01T00:00:00.000Z",
      "weight": 9.8,
      "source": "manual"
    }
  ]
}
```

**Si no hay historial de peso, devolver:**
```json
{
  "weightHistory": []
}
```

---

## 5. Objeto `groomingHistory`

**REQUERIDO** - Historial de sesiones de grooming

```json
{
  "groomingHistory": {
    "recentSessions": [
      {
        "id": "groom-123",
        "date": "2025-10-20T14:00:00.000Z",
        "serviceType": "Baño y corte",
        "notes": "Comportamiento excelente",
        "cost": 65.00,
        "groomerName": "María López",
        "nextAppointment": null,
        "createdAt": "2025-10-20T15:30:00.000Z",
        "updatedAt": "2025-10-20T15:30:00.000Z"
      }
    ],
    "totalSessions": 12,
    "lastSessionDate": "2025-10-20T14:00:00.000Z"  // ⚠️ OPCIONAL - puede ser null
  }
}
```

**Si no hay historial de grooming, devolver:**
```json
{
  "groomingHistory": {
    "recentSessions": [],
    "totalSessions": 0,
    "lastSessionDate": null
  }
}
```

---

## 6. Objeto `appointments`

**REQUERIDO** - Citas pasadas y futuras

```json
{
  "appointments": {
    "upcoming": [
      {
        "id": "apt-123",
        "date": "2025-11-20T10:00:00.000Z",
        "status": "confirmed",       // ✅ ENUM: pending|confirmed|completed|cancelled
        "notes": "Revisión general",
        "service": {
          "id": "svc-123",
          "name": "Consulta Veterinaria",
          "type": "medical",         // ✅ ENUM: medical|grooming|veterinary
          "description": "Consulta médica general",
          "price": 50,
          "durationMinutes": 30
        },
        "customer": {
          "id": "user-123",
          "fullName": "Ana López",
          "email": "ana@example.com"
        },
        "createdAt": "2025-11-01T09:00:00.000Z",
        "updatedAt": "2025-11-01T09:00:00.000Z"
      }
    ],
    "past": [
      {
        "id": "apt-456",
        "date": "2025-10-15T10:00:00.000Z",
        "status": "completed",
        "notes": "Vacunación anual",
        "service": {
          "id": "svc-456",
          "name": "Vacunación",
          "type": "veterinary",
          "description": "Aplicación de vacunas",
          "price": 35,
          "durationMinutes": 20
        },
        "customer": {
          "id": "user-123",
          "fullName": "Ana López",
          "email": "ana@example.com"
        },
        "createdAt": "2025-10-01T09:00:00.000Z",
        "updatedAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "totalAppointments": 15
  }
}
```

**Si no hay citas, devolver:**
```json
{
  "appointments": {
    "upcoming": [],
    "past": [],
    "totalAppointments": 0
  }
}
```

---

## 7. Objeto `summary` (OPCIONAL)

Resumen estadístico del perfil de la mascota

```json
{
  "summary": {
    "age": 3,                                    // Edad en años (calculada desde birthDate)
    "lastVisitDate": "2025-10-20T14:00:00.000Z", // ⚠️ OPCIONAL - puede ser null
    "nextVaccinationDue": "2025-11-15T00:00:00.000Z", // ⚠️ OPCIONAL - puede ser null
    "totalSpentMedical": 450.50,                 // Total gastado en servicios médicos
    "totalSpentGrooming": 780.00                 // Total gastado en grooming
  }
}
```

**Si no hay summary, el frontend usa valores por defecto**

---

## Ejemplo Completo de Respuesta

```json
{
  "pet": {
    "id": "e3940a25-f2fd-422c-b34e-8df994e1e785",
    "name": "Bella",
    "species": "dog",
    "breed": "Beagle",
    "birthDate": "2020-05-15T00:00:00.000Z",
    "gender": "female",
    "color": "Tricolor",
    "weight": "10.50",
    "microchipNumber": null,
    "profilePhoto": null,
    "temperament": "nervous",
    "behaviorNotes": ["Ansiedad por separación", "Ladradora"],
    "generalNotes": "Necesita entrenamiento para ansiedad.",
    "isActive": true,
    "createdAt": "2025-11-03T07:56:22.648Z",
    "updatedAt": "2025-11-03T07:56:22.648Z",
    "owner": {
      "id": "050b5821-f3a9-468f-84b1-c4a0ab538ca4",
      "fullName": "Ana López",
      "email": "cliente1@petshop.com"
    }
  },
  "medicalHistory": {
    "recentVisits": [],
    "totalVisits": 0
  },
  "vaccinations": {
    "activeVaccines": [],
    "upcomingVaccines": [],
    "totalVaccines": 0
  },
  "weightHistory": [
    {
      "date": "2025-11-01T00:00:00.000Z",
      "weight": 10.5,
      "source": "grooming"
    }
  ],
  "groomingHistory": {
    "recentSessions": [],
    "totalSessions": 0,
    "lastSessionDate": null
  },
  "appointments": {
    "upcoming": [],
    "past": [],
    "totalAppointments": 0
  },
  "summary": {
    "age": 5,
    "lastVisitDate": null,
    "nextVaccinationDue": null,
    "totalSpentMedical": 0,
    "totalSpentGrooming": 0
  }
}
```

---

## Casos Especiales

### Mascota Nueva (Sin Historial)

Para una mascota recién registrada sin ningún historial:

```json
{
  "pet": { /* datos completos de la mascota */ },
  "medicalHistory": {
    "recentVisits": [],
    "totalVisits": 0
  },
  "vaccinations": {
    "activeVaccines": [],
    "upcomingVaccines": [],
    "totalVaccines": 0
  },
  "weightHistory": [],
  "groomingHistory": {
    "recentSessions": [],
    "totalSessions": 0,
    "lastSessionDate": null
  },
  "appointments": {
    "upcoming": [],
    "past": [],
    "totalAppointments": 0
  },
  "summary": {
    "age": 0,
    "lastVisitDate": null,
    "nextVaccinationDue": null,
    "totalSpentMedical": 0,
    "totalSpentGrooming": 0
  }
}
```

### Mascota sin Fecha de Nacimiento

Si `birthDate` es `null`:
- Frontend mostrará "Edad desconocida"
- `summary.age` debe ser `0` o calculado de otra forma

---

## Validaciones del Frontend

El frontend usa **validación segura con Zod** que:
- ✅ **NO rompe la aplicación** si hay errores de validación
- ✅ Loguea warnings en consola del navegador
- ✅ Continúa funcionando con los datos recibidos

Si ves warnings en la consola del navegador tipo:
```
⚠️ [Zod Validation] Error in PetApiRepository.getCompleteProfile:
```

Significa que hay una incompatibilidad entre el schema y los datos del backend. Revisa los detalles en consola.

---

## Enums Importantes

### Species (Especies)
```typescript
'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other'
```

### Gender (Género)
```typescript
'male' | 'female' | 'unknown'
```

### Temperament (Temperamento)
```typescript
'friendly' | 'aggressive' | 'shy' | 'playful' | 'calm' | 'energetic' | 'nervous' | 'unknown'
```

### Appointment Status (Estado de Cita)
```typescript
'pending' | 'confirmed' | 'completed' | 'cancelled'
```

### Service Type (Tipo de Servicio)
```typescript
'medical' | 'grooming' | 'veterinary'
```

### Weight Source (Origen del Peso)
```typescript
'medical' | 'grooming' | 'manual'
```

---

## Códigos de Error HTTP Esperados

- **200 OK** - Perfil encontrado y devuelto correctamente
- **404 Not Found** - Mascota no existe
- **401 Unauthorized** - Usuario no autenticado
- **403 Forbidden** - Usuario no tiene permisos para ver esta mascota
- **500 Internal Server Error** - Error del servidor

---

## Notas Finales

1. **Fechas**: Siempre usar formato ISO 8601 (ej: `"2025-11-03T07:56:22.648Z"`)
2. **Arrays vacíos**: Enviar `[]` en lugar de `null` para arrays vacíos
3. **Campos opcionales**: Pueden ser `null` pero deben existir en la respuesta
4. **Validación flexible**: El frontend usa `safeValidate()` que tolera pequeñas diferencias

---

## Preguntas Frecuentes

**Q: ¿Qué pasa si no tengo algunos datos?**
A: Envía arrays vacíos `[]` y valores `0` para contadores. El frontend está preparado para mostrar "Sin datos" o mensajes apropiados.

**Q: ¿El campo `summary` es obligatorio?**
A: No, es opcional. Si no lo envías, el frontend usará valores por defecto.

**Q: ¿Qué formato debo usar para el peso?**
A: Puedes enviar `"10.5"` (string) o `10.5` (number). El frontend acepta ambos.

**Q: ¿Qué hago si la mascota no tiene fecha de nacimiento?**
A: Envía `"birthDate": null`. El frontend mostrará "Edad desconocida".
