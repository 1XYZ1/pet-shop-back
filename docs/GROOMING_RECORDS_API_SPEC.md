# Especificación API - Grooming Records

## Campo Importante: `servicesPerformed`

El frontend espera que todos los registros de grooming incluyan el campo `servicesPerformed` como un **array de strings**.

### Estructura de GroomingRecord

```json
{
  "id": "groom-123",
  "sessionDate": "2025-11-03T14:00:00.000Z",
  "servicesPerformed": [                      // ✅ REQUERIDO - Array de strings
    "Baño",
    "Corte de pelo",
    "Limpieza de oídos",
    "Corte de uñas"
  ],
  "hairStyle": "Corte estilo cachorro",        // ⚠️ OPCIONAL
  "productsUsed": [                            // ⚠️ OPCIONAL
    "Shampoo hipoalergénico",
    "Acondicionador"
  ],
  "skinCondition": "Saludable",                // ⚠️ OPCIONAL
  "coatCondition": "Brillante",                // ⚠️ OPCIONAL
  "behaviorDuringSession": "Tranquilo",        // ⚠️ OPCIONAL
  "observations": "Mascota muy cooperativa",   // ⚠️ OPCIONAL
  "recommendations": "Repetir en 6 semanas",   // ⚠️ OPCIONAL
  "durationMinutes": 90,                       // ✅ REQUERIDO
  "serviceCost": 65.00,                        // ⚠️ OPCIONAL
  "createdAt": "2025-11-03T15:30:00.000Z",
  "updatedAt": "2025-11-03T15:30:00.000Z",
  "pet": {                                     // ⚠️ OPCIONAL - Si se incluye
    "id": "pet-123",
    "name": "Bella",
    "breed": "Beagle",
    "species": "dog"
  },
  "groomer": {                                 // ⚠️ OPCIONAL - Si se incluye
    "id": "user-456",
    "fullName": "María López"
  }
}
```

---

## Problema Identificado

El frontend estaba fallando con este error:
```
TypeError: Cannot read properties of undefined (reading 'join')
```

**Causa:** El campo `servicesPerformed` no estaba presente en los registros de grooming del backend, o era `undefined`.

**Solución aplicada en Frontend:**
- Agregada validación: `Array.isArray(session.servicesPerformed)`
- Si no es un array válido, usa texto por defecto: "Sesión de grooming"

**Solución recomendada en Backend:**
- **SIEMPRE** incluir `servicesPerformed` como un array de strings
- Si no hay servicios registrados, enviar un array vacío `[]`

---

## Ejemplos

### ✅ Correcto - Con servicios
```json
{
  "id": "groom-123",
  "sessionDate": "2025-11-03T14:00:00.000Z",
  "servicesPerformed": ["Baño", "Corte de pelo"],
  "durationMinutes": 90,
  "serviceCost": 65.00,
  "createdAt": "2025-11-03T15:30:00.000Z",
  "updatedAt": "2025-11-03T15:30:00.000Z"
}
```

### ✅ Correcto - Sin servicios (array vacío)
```json
{
  "id": "groom-456",
  "sessionDate": "2025-11-03T14:00:00.000Z",
  "servicesPerformed": [],                     // ✅ Array vacío es válido
  "durationMinutes": 60,
  "createdAt": "2025-11-03T15:30:00.000Z",
  "updatedAt": "2025-11-03T15:30:00.000Z"
}
```

### ❌ Incorrecto - Campo ausente o null
```json
{
  "id": "groom-789",
  "sessionDate": "2025-11-03T14:00:00.000Z",
  // "servicesPerformed" está ausente        // ❌ Causará error
  "durationMinutes": 60
}
```

```json
{
  "id": "groom-789",
  "sessionDate": "2025-11-03T14:00:00.000Z",
  "servicesPerformed": null,                  // ❌ No usar null, usar []
  "durationMinutes": 60
}
```

---

## Endpoints

### GET /grooming-records/pet/:petId

Devuelve array de registros de grooming para una mascota:

```json
[
  {
    "id": "groom-123",
    "sessionDate": "2025-11-03T14:00:00.000Z",
    "servicesPerformed": ["Baño", "Corte de pelo", "Limpieza de oídos"],
    "durationMinutes": 90,
    "serviceCost": 65.00,
    "createdAt": "2025-11-03T15:30:00.000Z",
    "updatedAt": "2025-11-03T15:30:00.000Z"
  },
  {
    "id": "groom-456",
    "sessionDate": "2025-10-15T14:00:00.000Z",
    "servicesPerformed": ["Baño", "Corte de uñas"],
    "durationMinutes": 60,
    "serviceCost": 45.00,
    "createdAt": "2025-10-15T15:00:00.000Z",
    "updatedAt": "2025-10-15T15:00:00.000Z"
  }
]
```

### GET /grooming-records/:id

Devuelve un registro individual:

```json
{
  "id": "groom-123",
  "sessionDate": "2025-11-03T14:00:00.000Z",
  "servicesPerformed": ["Baño", "Corte de pelo", "Limpieza de oídos"],
  "hairStyle": "Corte estilo cachorro",
  "productsUsed": ["Shampoo hipoalergénico"],
  "skinCondition": "Saludable",
  "coatCondition": "Brillante",
  "behaviorDuringSession": "Tranquilo",
  "observations": "Mascota muy cooperativa",
  "recommendations": "Repetir en 6 semanas",
  "durationMinutes": 90,
  "serviceCost": 65.00,
  "createdAt": "2025-11-03T15:30:00.000Z",
  "updatedAt": "2025-11-03T15:30:00.000Z",
  "pet": {
    "id": "pet-123",
    "name": "Bella",
    "breed": "Beagle",
    "species": "dog"
  },
  "groomer": {
    "id": "user-456",
    "fullName": "María López"
  }
}
```

### POST /grooming-records

**Body esperado:**

```json
{
  "petId": "pet-123",
  "sessionDate": "2025-11-03T14:00:00.000Z",
  "servicesPerformed": ["Baño", "Corte de pelo"],     // ✅ REQUERIDO
  "hairStyle": "Corte estilo cachorro",
  "productsUsed": ["Shampoo hipoalergénico"],
  "skinCondition": "Saludable",
  "coatCondition": "Brillante",
  "behaviorDuringSession": "Tranquilo",
  "observations": "Mascota muy cooperativa",
  "recommendations": "Repetir en 6 semanas",
  "durationMinutes": 90,                               // ✅ REQUERIDO
  "serviceCost": 65.00
}
```

**Respuesta:** Registro creado completo

### PATCH /grooming-records/:id

**Body esperado (todos opcionales excepto los que se actualicen):**

```json
{
  "servicesPerformed": ["Baño", "Corte de pelo", "Limpieza de oídos"],
  "durationMinutes": 120,
  "serviceCost": 80.00
}
```

**Respuesta:** Registro actualizado completo

---

## Uso en Complete Profile

Cuando se llama a `GET /pets/:id/complete-profile`, el campo `groomingHistory` debe incluir:

```json
{
  "groomingHistory": {
    "recentSessions": [
      {
        "id": "groom-123",
        "sessionDate": "2025-11-03T14:00:00.000Z",
        "servicesPerformed": ["Baño", "Corte de pelo"],    // ✅ IMPORTANTE
        "durationMinutes": 90,
        "serviceCost": 65.00,
        "createdAt": "2025-11-03T15:30:00.000Z",
        "updatedAt": "2025-11-03T15:30:00.000Z"
      }
    ],
    "totalSessions": 5,
    "lastSessionDate": "2025-11-03T14:00:00.000Z"
  }
}
```

**Si no hay sesiones:**
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

## Validaciones del Frontend

El frontend ahora tiene validaciones defensivas:
- ✅ Verifica que `servicesPerformed` existe
- ✅ Verifica que es un array válido con `Array.isArray()`
- ✅ Si no es válido, usa texto por defecto "Sesión de grooming"
- ✅ No rompe la aplicación si falta el campo

**Sin embargo**, para una mejor experiencia de usuario, **el backend DEBE** incluir `servicesPerformed` en todos los registros.

---

## Sugerencias de Servicios Comunes

Para ayudar al backend a poblar `servicesPerformed`, aquí hay ejemplos comunes:

### Servicios Básicos
- "Baño"
- "Secado"
- "Cepillado"
- "Desenredado"
- "Corte de uñas"
- "Limpieza de oídos"
- "Limpieza de glándulas anales"

### Servicios de Estilismo
- "Corte de pelo"
- "Corte según raza"
- "Corte estilo cachorro"
- "Trimming"
- "Stripping"
- "Teñido"

### Servicios Premium
- "Hidratación profunda"
- "Tratamiento acondicionador"
- "Masaje"
- "Perfume"
- "Lazo o moño decorativo"
- "Limpieza dental"

---

## Tipos TypeScript (Referencia)

```typescript
export interface GroomingRecord {
  id: string;
  sessionDate: Date | string;
  servicesPerformed: string[];           // ✅ Array de strings
  hairStyle?: string;
  productsUsed?: string[];               // ⚠️ También es array
  skinCondition?: string;
  coatCondition?: string;
  behaviorDuringSession?: string;
  observations?: string;
  recommendations?: string;
  durationMinutes: number;               // ✅ Requerido
  serviceCost?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  pet?: PetNested;
  groomer?: {
    id: string;
    fullName: string;
  };
}
```

---

## Códigos HTTP

- **200 OK** - Éxito
- **201 Created** - Registro creado (POST)
- **404 Not Found** - Registro no encontrado
- **400 Bad Request** - Datos inválidos (ej: `servicesPerformed` no es un array)
- **401 Unauthorized** - No autenticado
- **403 Forbidden** - Sin permisos

---

## Checklist para el Backend

- [ ] `servicesPerformed` siempre está presente en la respuesta
- [ ] `servicesPerformed` siempre es un array de strings (nunca `null` o `undefined`)
- [ ] Si no hay servicios, se envía array vacío `[]`
- [ ] `durationMinutes` siempre está presente como número
- [ ] Fechas en formato ISO 8601
- [ ] `productsUsed` también es array de strings si se incluye
