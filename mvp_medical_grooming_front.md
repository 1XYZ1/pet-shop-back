# 🐾 Especificaciones Frontend: Sistema de Gestión de Mascotas

## 📋 Resumen Ejecutivo

Este documento contiene todas las especificaciones técnicas necesarias para implementar el frontend del sistema de gestión de perfiles de mascotas integrado con el sistema de appointments.

**Fecha de creación:** 2025-11-02
**Versión Backend:** 1.0.0
**Base URL:** `http://localhost:3000/api`

---

## 🎯 Funcionalidades Principales

### Módulos a Implementar:

1. **Gestión de Mascotas** - CRUD completo de perfiles de mascotas
2. **Historial Médico** - Registro y consulta de visitas veterinarias y vacunas
3. **Historial de Grooming** - Registro y consulta de sesiones de peluquería
4. **Perfil Completo** - Vista consolidada con toda la información de la mascota
5. **Appointments con Mascotas** - Integración del sistema de citas con mascotas específicas

---

## 📦 Modelos TypeScript

### Enums

```typescript
// src/types/enums.ts

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  OTHER = 'other',
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

export enum PetTemperament {
  CALM = 'calm',
  NERVOUS = 'nervous',
  AGGRESSIVE = 'aggressive',
  FRIENDLY = 'friendly',
  UNKNOWN = 'unknown',
}

export enum VisitType {
  CONSULTATION = 'consultation',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  EMERGENCY = 'emergency',
  CHECKUP = 'checkup',
}

export enum AppointmentPetStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

### Interfaces de Entidades

```typescript
// src/types/pets.ts

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate: Date | string;
  gender: PetGender;
  color?: string;
  weight?: number;
  microchipNumber?: string;
  profilePhoto?: string;
  temperament: PetTemperament;
  behaviorNotes: string[];
  generalNotes?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  owner?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface MedicalRecord {
  id: string;
  visitDate: Date | string;
  visitType: VisitType;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  weightAtVisit?: number;
  temperature?: number;
  serviceCost?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  pet?: Pet;
  veterinarian?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface Vaccination {
  id: string;
  vaccineName: string;
  administeredDate: Date | string;
  nextDueDate?: Date | string;
  batchNumber?: string;
  notes?: string;
  createdAt: Date | string;
  pet?: Pet;
  veterinarian?: {
    id: string;
    fullName: string;
  };
}

export interface GroomingRecord {
  id: string;
  sessionDate: Date | string;
  servicesPerformed: string[];
  hairStyle?: string;
  productsUsed?: string[];
  skinCondition?: string;
  coatCondition?: string;
  behaviorDuringSession?: string;
  observations?: string;
  recommendations?: string;
  durationMinutes: number;
  serviceCost?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  pet?: Pet;
  groomer?: {
    id: string;
    fullName: string;
  };
}

export interface AppointmentPet {
  id: string;
  notes?: string;
  price?: number;
  status: AppointmentPetStatus;
  appointment?: Appointment;
  pet?: Pet;
  services?: Service[];
}
```

### Interface de Perfil Completo

```typescript
// src/types/complete-profile.ts

export interface WeightHistory {
  date: Date | string;
  weight: number;
  source: 'medical' | 'grooming' | 'manual';
}

export interface CompleteProfile {
  pet: Pet;

  medicalHistory: {
    recentVisits: MedicalRecord[];
    totalVisits: number;
  };

  vaccinations: {
    activeVaccines: Vaccination[];
    upcomingVaccines: Vaccination[];
    totalVaccines: number;
  };

  weightHistory: WeightHistory[];

  groomingHistory: {
    recentSessions: GroomingRecord[];
    totalSessions: number;
    lastSessionDate?: Date | string;
  };

  appointments: {
    upcoming: AppointmentPet[];
    past: AppointmentPet[];
    totalAppointments: number;
  };

  summary: {
    age: number;
    lastVisitDate?: Date | string;
    nextVaccinationDue?: Date | string;
    totalSpentMedical: number;
    totalSpentGrooming: number;
  };
}
```

### DTOs (Request Bodies)

```typescript
// src/types/dtos.ts

export interface CreatePetDto {
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate: string; // Format: "YYYY-MM-DD"
  gender: PetGender;
  color?: string;
  weight?: number;
  microchipNumber?: string;
  temperament?: PetTemperament;
  behaviorNotes?: string[];
  generalNotes?: string;
}

export interface UpdatePetDto {
  name?: string;
  breed?: string;
  color?: string;
  weight?: number;
  microchipNumber?: string;
  temperament?: PetTemperament;
  behaviorNotes?: string[];
  generalNotes?: string;
}

export interface CreateMedicalRecordDto {
  petId: string;
  visitDate: string; // Format: "YYYY-MM-DDTHH:mm:ss"
  visitType: VisitType;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  weightAtVisit?: number;
  temperature?: number;
  serviceCost?: number;
}

export interface CreateVaccinationDto {
  petId: string;
  vaccineName: string;
  administeredDate: string; // Format: "YYYY-MM-DD"
  nextDueDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface CreateGroomingRecordDto {
  petId: string;
  sessionDate: string; // Format: "YYYY-MM-DDTHH:mm:ss"
  servicesPerformed: string[];
  hairStyle?: string;
  productsUsed?: string[];
  skinCondition?: string;
  coatCondition?: string;
  behaviorDuringSession?: string;
  observations?: string;
  recommendations?: string;
  durationMinutes?: number;
  serviceCost?: number;
}

export interface AddPetToAppointmentDto {
  petId: string;
  notes?: string;
  price?: number;
  serviceIds?: string[];
  status?: AppointmentPetStatus;
}
```

---

## 🔌 API Endpoints

### Autenticación (Ya existente)

**Todas las llamadas requieren header de autenticación:**
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### 1. PETS - Gestión de Mascotas

#### 1.1 Crear Mascota

**Endpoint:** `POST /api/pets`

**Request Body:**
```json
{
  "name": "Max",
  "species": "dog",
  "breed": "Golden Retriever",
  "birthDate": "2020-05-15",
  "gender": "male",
  "weight": 30.5,
  "temperament": "friendly",
  "behaviorNotes": ["Le gusta nadar", "Nervioso con otros perros"],
  "generalNotes": "Muy activo, necesita ejercicio diario"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Max",
  "species": "dog",
  "breed": "Golden Retriever",
  "birthDate": "2020-05-15T00:00:00.000Z",
  "gender": "male",
  "weight": 30.5,
  "temperament": "friendly",
  "behaviorNotes": ["Le gusta nadar", "Nervioso con otros perros"],
  "generalNotes": "Muy activo, necesita ejercicio diario",
  "isActive": true,
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z",
  "owner": {
    "id": "user-uuid",
    "fullName": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

**Errores posibles:**
- `400 Bad Request` - Validación fallida (ej: birthDate en el futuro)
- `401 Unauthorized` - No autenticado
- `500 Internal Server Error` - Error del servidor

---

#### 1.2 Listar Mascotas

**Endpoint:** `GET /api/pets?limit=10&offset=0`

**Query Params:**
- `limit` (opcional): Número de resultados (default: 10, max: 100)
- `offset` (opcional): Número de resultados a saltar (default: 0)

**Response:** `200 OK`
```json
[
  {
    "id": "pet-uuid-1",
    "name": "Max",
    "species": "dog",
    "breed": "Golden Retriever",
    "birthDate": "2020-05-15T00:00:00.000Z",
    "gender": "male",
    "weight": 30.5,
    "temperament": "friendly",
    "isActive": true,
    "owner": {
      "id": "user-uuid",
      "fullName": "Juan Pérez",
      "email": "juan@example.com"
    }
  },
  {
    "id": "pet-uuid-2",
    "name": "Luna",
    "species": "cat",
    "breed": "Siamés",
    "birthDate": "2021-08-20T00:00:00.000Z",
    "gender": "female",
    "weight": 4.2,
    "temperament": "calm",
    "isActive": true,
    "owner": {
      "id": "user-uuid",
      "fullName": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
]
```

**Comportamiento:**
- **Usuario normal:** Solo ve sus propias mascotas
- **Admin:** Ve todas las mascotas del sistema

---

#### 1.3 Obtener Mascota por ID

**Endpoint:** `GET /api/pets/:id`

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Max",
  "species": "dog",
  "breed": "Golden Retriever",
  "birthDate": "2020-05-15T00:00:00.000Z",
  "gender": "male",
  "color": "Dorado",
  "weight": 30.5,
  "microchipNumber": "123456789012345",
  "profilePhoto": null,
  "temperament": "friendly",
  "behaviorNotes": ["Le gusta nadar", "Nervioso con otros perros"],
  "generalNotes": "Muy activo, necesita ejercicio diario",
  "isActive": true,
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z",
  "owner": {
    "id": "user-uuid",
    "fullName": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

**Errores posibles:**
- `404 Not Found` - Mascota no existe
- `403 Forbidden` - No tienes permiso para ver esta mascota

---

#### 1.4 Actualizar Mascota

**Endpoint:** `PATCH /api/pets/:id`

**Request Body:** (todos los campos son opcionales)
```json
{
  "weight": 32.0,
  "temperament": "calm",
  "behaviorNotes": ["Le gusta nadar", "Nervioso con otros perros", "Ahora es más tranquilo"]
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Max",
  "weight": 32.0,
  "temperament": "calm",
  "behaviorNotes": ["Le gusta nadar", "Nervioso con otros perros", "Ahora es más tranquilo"],
  "updatedAt": "2025-11-02T15:30:00.000Z",
  ...
}
```

---

#### 1.5 Eliminar Mascota (Soft Delete)

**Endpoint:** `DELETE /api/pets/:id`

**Response:** `200 OK`
```json
{
  "message": "Pet removed successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Nota:** Soft delete - La mascota solo se marca como `isActive: false`, no se elimina físicamente.

---

#### 1.6 Obtener Perfil Completo ⭐

**Endpoint:** `GET /api/pets/:id/complete-profile`

**Response:** `200 OK`
```json
{
  "pet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Max",
    "species": "dog",
    "breed": "Golden Retriever",
    "birthDate": "2020-05-15T00:00:00.000Z",
    "gender": "male",
    "weight": 32.0,
    "temperament": "friendly",
    "behaviorNotes": ["Le gusta nadar", "Nervioso con otros perros"],
    "owner": {
      "id": "user-uuid",
      "fullName": "Juan Pérez",
      "email": "juan@example.com"
    }
  },
  "medicalHistory": {
    "recentVisits": [
      {
        "id": "medical-record-uuid",
        "visitDate": "2025-10-15T14:00:00.000Z",
        "visitType": "checkup",
        "reason": "Chequeo anual",
        "diagnosis": "Salud óptima",
        "weightAtVisit": 32.0,
        "veterinarian": {
          "fullName": "Dr. García"
        }
      }
      // ... últimas 5 visitas
    ],
    "totalVisits": 12
  },
  "vaccinations": {
    "activeVaccines": [
      {
        "id": "vaccination-uuid",
        "vaccineName": "Antirrábica",
        "administeredDate": "2025-05-15T00:00:00.000Z",
        "nextDueDate": "2026-05-15T00:00:00.000Z",
        "veterinarian": {
          "fullName": "Dr. García"
        }
      }
    ],
    "upcomingVaccines": [
      {
        "id": "vaccination-uuid-2",
        "vaccineName": "Séxtuple",
        "nextDueDate": "2025-12-01T00:00:00.000Z"
      }
    ],
    "totalVaccines": 5
  },
  "weightHistory": [
    {
      "date": "2025-10-15T14:00:00.000Z",
      "weight": 32.0,
      "source": "medical"
    },
    {
      "date": "2025-07-10T10:00:00.000Z",
      "weight": 31.5,
      "source": "medical"
    }
    // ... historial completo
  ],
  "groomingHistory": {
    "recentSessions": [
      {
        "id": "grooming-uuid",
        "sessionDate": "2025-10-20T11:00:00.000Z",
        "servicesPerformed": ["Baño", "Corte", "Uñas"],
        "hairStyle": "Corte verano",
        "observations": "Comportamiento excelente",
        "groomer": {
          "fullName": "María López"
        }
      }
      // ... últimas 5 sesiones
    ],
    "totalSessions": 8,
    "lastSessionDate": "2025-10-20T11:00:00.000Z"
  },
  "appointments": {
    "upcoming": [
      {
        "id": "appointment-pet-uuid",
        "appointment": {
          "id": "appointment-uuid",
          "date": "2025-11-10T15:00:00.000Z",
          "status": "confirmed"
        },
        "notes": "Corte especial para el verano",
        "services": [
          {
            "id": "service-uuid",
            "name": "Baño completo"
          }
        ]
      }
    ],
    "past": [
      // ... appointments pasados
    ],
    "totalAppointments": 15
  },
  "summary": {
    "age": 5,
    "lastVisitDate": "2025-10-15T14:00:00.000Z",
    "nextVaccinationDue": "2025-12-01T00:00:00.000Z",
    "totalSpentMedical": 450.00,
    "totalSpentGrooming": 280.00
  }
}
```

**Uso recomendado:** Este endpoint es ideal para la página de perfil de la mascota, donde se muestra toda la información consolidada.

---

### 2. MEDICAL RECORDS - Historial Médico

#### 2.1 Crear Registro Médico

**Endpoint:** `POST /api/medical-records`

**Request Body:**
```json
{
  "petId": "550e8400-e29b-41d4-a716-446655440000",
  "visitDate": "2025-11-02T14:00:00",
  "visitType": "consultation",
  "reason": "Tos persistente",
  "diagnosis": "Infección respiratoria leve",
  "treatment": "Antibióticos por 7 días",
  "notes": "Revisar en 1 semana",
  "weightAtVisit": 32.5,
  "temperature": 38.5,
  "serviceCost": 50.00
}
```

**Response:** `201 Created`
```json
{
  "id": "medical-record-uuid",
  "visitDate": "2025-11-02T14:00:00.000Z",
  "visitType": "consultation",
  "reason": "Tos persistente",
  "diagnosis": "Infección respiratoria leve",
  "treatment": "Antibióticos por 7 días",
  "notes": "Revisar en 1 semana",
  "weightAtVisit": 32.5,
  "temperature": 38.5,
  "serviceCost": 50.00,
  "createdAt": "2025-11-02T14:05:00.000Z",
  "updatedAt": "2025-11-02T14:05:00.000Z",
  "pet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Max"
  },
  "veterinarian": {
    "id": "vet-user-uuid",
    "fullName": "Dr. García",
    "email": "dr.garcia@clinic.com"
  }
}
```

---

#### 2.2 Obtener Historial Médico de una Mascota

**Endpoint:** `GET /api/medical-records/pet/:petId`

**Response:** `200 OK`
```json
[
  {
    "id": "medical-record-uuid-1",
    "visitDate": "2025-11-02T14:00:00.000Z",
    "visitType": "consultation",
    "reason": "Tos persistente",
    "diagnosis": "Infección respiratoria leve",
    "weightAtVisit": 32.5,
    "temperature": 38.5,
    "serviceCost": 50.00,
    "veterinarian": {
      "fullName": "Dr. García"
    }
  },
  {
    "id": "medical-record-uuid-2",
    "visitDate": "2025-10-15T14:00:00.000Z",
    "visitType": "checkup",
    "reason": "Chequeo anual",
    "diagnosis": "Salud óptima",
    "weightAtVisit": 32.0,
    "serviceCost": 35.00,
    "veterinarian": {
      "fullName": "Dr. García"
    }
  }
  // ... más registros ordenados por fecha descendente
]
```

---

#### 2.3 Obtener Registro Médico Específico

**Endpoint:** `GET /api/medical-records/:id`

**Response:** `200 OK`
```json
{
  "id": "medical-record-uuid",
  "visitDate": "2025-11-02T14:00:00.000Z",
  "visitType": "consultation",
  "reason": "Tos persistente",
  "diagnosis": "Infección respiratoria leve",
  "treatment": "Antibióticos por 7 días",
  "notes": "Revisar en 1 semana",
  "weightAtVisit": 32.5,
  "temperature": 38.5,
  "serviceCost": 50.00,
  "createdAt": "2025-11-02T14:05:00.000Z",
  "updatedAt": "2025-11-02T14:05:00.000Z",
  "pet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Max",
    "species": "dog"
  },
  "veterinarian": {
    "id": "vet-user-uuid",
    "fullName": "Dr. García",
    "email": "dr.garcia@clinic.com"
  }
}
```

---

#### 2.4 Actualizar Registro Médico

**Endpoint:** `PATCH /api/medical-records/:id`

**Request Body:** (campos opcionales)
```json
{
  "diagnosis": "Infección respiratoria moderada",
  "treatment": "Antibióticos por 10 días + Jarabe para la tos",
  "notes": "Revisar en 5 días. Posible radiografía si no mejora"
}
```

**Response:** `200 OK` (registro actualizado completo)

---

#### 2.5 Registrar Vacuna

**Endpoint:** `POST /api/medical-records/vaccinations`

**Request Body:**
```json
{
  "petId": "550e8400-e29b-41d4-a716-446655440000",
  "vaccineName": "Antirrábica",
  "administeredDate": "2025-11-02",
  "nextDueDate": "2026-11-02",
  "batchNumber": "LOT-2025-ABC123",
  "notes": "Sin reacciones adversas"
}
```

**Response:** `201 Created`
```json
{
  "id": "vaccination-uuid",
  "vaccineName": "Antirrábica",
  "administeredDate": "2025-11-02T00:00:00.000Z",
  "nextDueDate": "2026-11-02T00:00:00.000Z",
  "batchNumber": "LOT-2025-ABC123",
  "notes": "Sin reacciones adversas",
  "createdAt": "2025-11-02T14:10:00.000Z",
  "pet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Max"
  },
  "veterinarian": {
    "id": "vet-user-uuid",
    "fullName": "Dr. García"
  }
}
```

---

#### 2.6 Obtener Vacunas de una Mascota

**Endpoint:** `GET /api/medical-records/vaccinations/pet/:petId`

**Response:** `200 OK`
```json
[
  {
    "id": "vaccination-uuid-1",
    "vaccineName": "Antirrábica",
    "administeredDate": "2025-11-02T00:00:00.000Z",
    "nextDueDate": "2026-11-02T00:00:00.000Z",
    "batchNumber": "LOT-2025-ABC123",
    "veterinarian": {
      "fullName": "Dr. García"
    }
  },
  {
    "id": "vaccination-uuid-2",
    "vaccineName": "Séxtuple",
    "administeredDate": "2025-05-15T00:00:00.000Z",
    "nextDueDate": "2025-11-15T00:00:00.000Z",
    "veterinarian": {
      "fullName": "Dr. García"
    }
  }
  // ... más vacunas
]
```

---

#### 2.7 Obtener Vacunas Próximas a Vencer (Admin)

**Endpoint:** `GET /api/medical-records/vaccinations/due`

**Nota:** Solo accesible para usuarios con rol `admin`

**Response:** `200 OK`
```json
[
  {
    "id": "vaccination-uuid",
    "vaccineName": "Séxtuple",
    "nextDueDate": "2025-11-15T00:00:00.000Z",
    "pet": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Max",
      "owner": {
        "fullName": "Juan Pérez",
        "email": "juan@example.com"
      }
    }
  }
  // ... vacunas que vencen en los próximos 30 días
]
```

**Uso recomendado:** Dashboard de admin para enviar recordatorios a los clientes.

---

### 3. GROOMING RECORDS - Historial de Peluquería

#### 3.1 Crear Sesión de Grooming

**Endpoint:** `POST /api/grooming-records`

**Request Body:**
```json
{
  "petId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionDate": "2025-11-02T11:00:00",
  "servicesPerformed": ["Baño", "Corte", "Uñas", "Limpieza de oídos"],
  "hairStyle": "Corte verano",
  "productsUsed": ["Shampoo hipoalergénico", "Acondicionador"],
  "skinCondition": "Piel sana",
  "coatCondition": "Pelaje brillante",
  "behaviorDuringSession": "Muy cooperativo",
  "observations": "Excelente comportamiento durante todo el proceso",
  "recommendations": "Cepillar 2 veces por semana",
  "durationMinutes": 90,
  "serviceCost": 45.00
}
```

**Response:** `201 Created`
```json
{
  "id": "grooming-uuid",
  "sessionDate": "2025-11-02T11:00:00.000Z",
  "servicesPerformed": ["Baño", "Corte", "Uñas", "Limpieza de oídos"],
  "hairStyle": "Corte verano",
  "productsUsed": ["Shampoo hipoalergénico", "Acondicionador"],
  "skinCondition": "Piel sana",
  "coatCondition": "Pelaje brillante",
  "behaviorDuringSession": "Muy cooperativo",
  "observations": "Excelente comportamiento durante todo el proceso",
  "recommendations": "Cepillar 2 veces por semana",
  "durationMinutes": 90,
  "serviceCost": 45.00,
  "createdAt": "2025-11-02T12:30:00.000Z",
  "updatedAt": "2025-11-02T12:30:00.000Z",
  "pet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Max"
  },
  "groomer": {
    "id": "groomer-user-uuid",
    "fullName": "María López",
    "email": "maria@petshop.com"
  }
}
```

---

#### 3.2 Obtener Historial de Grooming de una Mascota

**Endpoint:** `GET /api/grooming-records/pet/:petId`

**Response:** `200 OK`
```json
[
  {
    "id": "grooming-uuid-1",
    "sessionDate": "2025-11-02T11:00:00.000Z",
    "servicesPerformed": ["Baño", "Corte", "Uñas"],
    "hairStyle": "Corte verano",
    "observations": "Excelente comportamiento",
    "durationMinutes": 90,
    "serviceCost": 45.00,
    "groomer": {
      "fullName": "María López"
    }
  },
  {
    "id": "grooming-uuid-2",
    "sessionDate": "2025-09-15T10:00:00.000Z",
    "servicesPerformed": ["Baño", "Uñas"],
    "observations": "Un poco nervioso",
    "durationMinutes": 60,
    "serviceCost": 30.00,
    "groomer": {
      "fullName": "María López"
    }
  }
  // ... más sesiones ordenadas por fecha descendente
]
```

---

#### 3.3 Obtener Sesión Específica

**Endpoint:** `GET /api/grooming-records/:id`

**Response:** `200 OK` (sesión completa con todas las relaciones)

---

#### 3.4 Actualizar Sesión

**Endpoint:** `PATCH /api/grooming-records/:id`

**Request Body:** (campos opcionales)
```json
{
  "observations": "Comportamiento excelente. Se quedó dormido durante el secado.",
  "recommendations": "Cepillar 3 veces por semana para evitar nudos"
}
```

**Response:** `200 OK` (sesión actualizada completa)

---

#### 3.5 Obtener Sesiones de Hoy (Admin/Groomer)

**Endpoint:** `GET /api/grooming-records/today`

**Nota:** Solo accesible para usuarios con rol `admin`

**Response:** `200 OK`
```json
[
  {
    "id": "grooming-uuid",
    "sessionDate": "2025-11-02T11:00:00.000Z",
    "servicesPerformed": ["Baño", "Corte"],
    "durationMinutes": 90,
    "pet": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Max",
      "owner": {
        "fullName": "Juan Pérez"
      }
    },
    "groomer": {
      "fullName": "María López"
    }
  }
  // ... todas las sesiones de hoy
]
```

**Uso recomendado:** Dashboard de groomer para ver su agenda del día.

---

#### 3.6 Obtener Estadísticas de Grooming (Admin/Groomer)

**Endpoint:** `GET /api/grooming-records/stats`

**Nota:** Solo accesible para usuarios con rol `admin`

**Response:** `200 OK`
```json
{
  "totalSessions": 156,
  "totalRevenue": 6750.00,
  "averageDuration": 75,
  "sessionsThisMonth": 18,
  "revenueThisMonth": 810.00
}
```

**Uso recomendado:** Dashboard de administración para métricas de negocio.

---

### 4. APPOINTMENTS - Integración con Mascotas

#### 4.1 Crear Appointment con Mascotas

**Endpoint:** `POST /api/appointments`

**Request Body Actualizado:**
```json
{
  "date": "2025-11-10T15:00:00",
  "status": "confirmed",
  "notes": "Cliente quiere corte especial",
  "pets": [
    {
      "petId": "550e8400-e29b-41d4-a716-446655440000",
      "notes": "Corte verano para Max",
      "serviceIds": ["service-uuid-1", "service-uuid-2"],
      "price": 45.00
    },
    {
      "petId": "pet-uuid-2",
      "notes": "Solo baño para Luna",
      "serviceIds": ["service-uuid-3"],
      "price": 25.00
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "appointment-uuid",
  "date": "2025-11-10T15:00:00.000Z",
  "status": "confirmed",
  "notes": "Cliente quiere corte especial",
  "appointmentPets": [
    {
      "id": "appointment-pet-uuid-1",
      "notes": "Corte verano para Max",
      "price": 45.00,
      "status": "pending",
      "pet": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Max",
        "species": "dog"
      },
      "services": [
        {
          "id": "service-uuid-1",
          "name": "Baño completo"
        },
        {
          "id": "service-uuid-2",
          "name": "Corte de pelo"
        }
      ]
    },
    {
      "id": "appointment-pet-uuid-2",
      "notes": "Solo baño para Luna",
      "price": 25.00,
      "status": "pending",
      "pet": {
        "id": "pet-uuid-2",
        "name": "Luna",
        "species": "cat"
      },
      "services": [
        {
          "id": "service-uuid-3",
          "name": "Baño para gatos"
        }
      ]
    }
  ],
  "totalPrice": 70.00,
  "createdAt": "2025-11-02T16:00:00.000Z"
}
```

**Nota:** El campo `pets` reemplaza o complementa la lógica anterior de appointments. Cada mascota puede tener su propia configuración.

---

#### 4.2 Agregar Mascota a Appointment Existente

**Endpoint:** `POST /api/appointments/:id/pets`

**Request Body:**
```json
{
  "petId": "pet-uuid-3",
  "notes": "Corte rápido",
  "serviceIds": ["service-uuid-1"],
  "price": 30.00
}
```

**Response:** `201 Created`
```json
{
  "id": "appointment-pet-uuid-3",
  "notes": "Corte rápido",
  "price": 30.00,
  "status": "pending",
  "pet": {
    "id": "pet-uuid-3",
    "name": "Rocky"
  },
  "appointment": {
    "id": "appointment-uuid",
    "date": "2025-11-10T15:00:00.000Z"
  },
  "services": [
    {
      "id": "service-uuid-1",
      "name": "Baño completo"
    }
  ]
}
```

---

## 🎨 Flujos de Usuario

### Flujo 1: Registrar Nueva Mascota

```
┌─────────────────┐
│  Cliente Login  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Ir a "Mis       │
│ Mascotas"       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Click "Agregar  │
│ Mascota"        │
└────────┬────────┘
         │
         v
┌─────────────────────────────────┐
│ Formulario de Registro          │
│                                  │
│ - Nombre *                       │
│ - Especie * (select)             │
│ - Raza                           │
│ - Fecha de Nacimiento *          │
│ - Género * (select)              │
│ - Peso (kg)                      │
│ - Color                          │
│ - Microchip                      │
│ - Temperamento (select)          │
│ - Notas de comportamiento (tags) │
│ - Notas generales (textarea)     │
│                                  │
│ [Cancelar] [Guardar Mascota]    │
└────────┬────────────────────────┘
         │
         v (POST /api/pets)
┌─────────────────┐
│ Mascota creada  │
│ exitosamente    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Ver perfil de   │
│ la mascota      │
└─────────────────┘
```

**Validaciones del formulario:**
- Nombre: requerido, máx 100 caracteres
- Especie: requerido, select de opciones
- Fecha de nacimiento: requerido, no puede ser futura, formato YYYY-MM-DD
- Género: requerido, select de opciones
- Peso: opcional, número positivo, decimales permitidos
- Temperamento: opcional, select de opciones
- Notas de comportamiento: opcional, array de strings (chips/tags)

**Ejemplo de código React:**
```tsx
const handleSubmit = async (formData: CreatePetDto) => {
  try {
    const response = await fetch('/api/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        birthDate: format(formData.birthDate, 'yyyy-MM-dd'),
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear mascota');
    }

    const pet = await response.json();
    router.push(`/pets/${pet.id}`);
  } catch (error) {
    toast.error('No se pudo crear la mascota');
  }
};
```

---

### Flujo 2: Agendar Cita con Mascota(s)

```
┌─────────────────┐
│  Cliente Login  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Ir a "Agendar   │
│ Cita"           │
└────────┬────────┘
         │
         v
┌────────────────────────────┐
│ Seleccionar Fecha y Hora   │
│                            │
│ [Calendario]               │
│ [Horarios disponibles]     │
└────────┬───────────────────┘
         │
         v
┌──────────────────────────────────┐
│ Seleccionar Mascota(s)           │
│                                  │
│ ☑ Max (Golden Retriever)         │
│   Servicios:                     │
│   ☑ Baño completo ($25)          │
│   ☑ Corte de pelo ($20)          │
│   Notas: Corte verano            │
│                                  │
│ ☑ Luna (Siamés)                  │
│   Servicios:                     │
│   ☑ Baño para gatos ($20)        │
│   Notas: Usa shampoo especial    │
│                                  │
│ [+ Agregar otra mascota]         │
│                                  │
│ Total: $65.00                    │
│                                  │
│ [Cancelar] [Confirmar Cita]     │
└────────┬─────────────────────────┘
         │
         v (POST /api/appointments)
┌─────────────────┐
│ Cita confirmada │
│                 │
│ Detalles:       │
│ - 2 mascotas    │
│ - 10 Nov 15:00  │
│ - Total: $65    │
└─────────────────┘
```

**Validaciones:**
- Al menos 1 mascota debe estar seleccionada
- Cada mascota debe tener al menos 1 servicio
- Fecha no puede ser en el pasado
- Horario debe estar disponible

**Ejemplo de código:**
```tsx
const handleConfirmAppointment = async () => {
  const appointmentData = {
    date: selectedDateTime.toISOString(),
    status: 'confirmed',
    notes: generalNotes,
    pets: selectedPets.map(pet => ({
      petId: pet.id,
      notes: pet.notes,
      serviceIds: pet.selectedServices.map(s => s.id),
      price: pet.selectedServices.reduce((sum, s) => sum + s.price, 0),
    })),
  };

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) throw new Error('Error');

    const appointment = await response.json();
    toast.success('Cita agendada exitosamente');
    router.push(`/appointments/${appointment.id}`);
  } catch (error) {
    toast.error('No se pudo agendar la cita');
  }
};
```

---

### Flujo 3: Ver Perfil Completo de Mascota

```
┌─────────────────┐
│  Mis Mascotas   │
│                 │
│ • Max           │
│ • Luna          │
└────────┬────────┘
         │ Click en Max
         v
┌──────────────────────────────────┐
│ Perfil de Max                    │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Información General          │ │
│ │ - 5 años                     │ │
│ │ - Golden Retriever           │ │
│ │ - 32 kg                      │ │
│ │ - Temperamento: Friendly     │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Historial Médico (12 visitas)│ │
│ │                              │ │
│ │ 15 Oct 2025 - Chequeo anual  │ │
│ │ 10 Jul 2025 - Vacuna         │ │
│ │ ...                          │ │
│ │ [Ver todo]                   │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Vacunas (5 aplicadas)        │ │
│ │                              │ │
│ │ ✓ Antirrábica (vence May 26) │ │
│ │ ⚠ Séxtuple (vence Nov 15)    │ │
│ │ [Ver todas]                  │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Gráfico de Peso              │ │
│ │ [Line chart]                 │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Grooming (8 sesiones)        │ │
│ │                              │ │
│ │ 20 Oct 2025 - Baño + Corte   │ │
│ │ 15 Sep 2025 - Baño           │ │
│ │ [Ver todo]                   │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Próximas Citas               │ │
│ │                              │ │
│ │ 10 Nov 2025, 15:00           │ │
│ │ Baño completo + Corte        │ │
│ │ [Ver todas]                  │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Editar Mascota] [Agendar Cita]  │
└──────────────────────────────────┘
```

**Llamada API:**
```tsx
const fetchCompleteProfile = async (petId: string) => {
  const response = await fetch(`/api/pets/${petId}/complete-profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Error al cargar perfil');

  const profile: CompleteProfile = await response.json();
  return profile;
};

// Uso en componente
useEffect(() => {
  fetchCompleteProfile(petId).then(setProfile);
}, [petId]);
```

---

### Flujo 4: Registrar Visita Veterinaria (Admin/Vet)

```
┌─────────────────┐
│  Admin Panel    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Buscar Mascota  │
│ [Search: Max]   │
└────────┬────────┘
         │
         v
┌─────────────────────────────────┐
│ Registrar Consulta Médica       │
│                                  │
│ Mascota: Max (Golden Retriever)  │
│                                  │
│ - Fecha y hora *                 │
│ - Tipo de visita * (select)      │
│ - Motivo *                       │
│ - Diagnóstico                    │
│ - Tratamiento                    │
│ - Notas del veterinario          │
│ - Peso (kg)                      │
│ - Temperatura (°C)               │
│ - Costo del servicio             │
│                                  │
│ [Cancelar] [Registrar]          │
└────────┬────────────────────────┘
         │
         v (POST /api/medical-records)
┌─────────────────┐
│ Registro creado │
│                 │
│ Notificación    │
│ enviada al      │
│ dueño           │
└─────────────────┘
```

---

## 📊 Componentes Recomendados

### 1. PetCard Component
```tsx
interface PetCardProps {
  pet: Pet;
  onClick?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick }) => (
  <div className="pet-card" onClick={onClick}>
    <img src={pet.profilePhoto || '/default-pet.png'} alt={pet.name} />
    <h3>{pet.name}</h3>
    <p>{pet.breed || pet.species}</p>
    <p>{calculateAge(pet.birthDate)} años</p>
    <span className={`temperament ${pet.temperament}`}>
      {pet.temperament}
    </span>
  </div>
);
```

### 2. WeightChart Component
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface WeightChartProps {
  weightHistory: WeightHistory[];
}

const WeightChart: React.FC<WeightChartProps> = ({ weightHistory }) => {
  const data = weightHistory.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    weight: item.weight,
  }));

  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="weight" stroke="#8884d8" />
    </LineChart>
  );
};
```

### 3. VaccinationAlert Component
```tsx
const VaccinationAlert: React.FC<{ vaccination: Vaccination }> = ({ vaccination }) => {
  const daysUntilDue = differenceInDays(
    new Date(vaccination.nextDueDate!),
    new Date()
  );

  const severity = daysUntilDue < 7 ? 'error' : daysUntilDue < 30 ? 'warning' : 'info';

  return (
    <Alert severity={severity}>
      {vaccination.vaccineName} - Vence en {daysUntilDue} días
      ({format(new Date(vaccination.nextDueDate!), 'dd MMM yyyy')})
    </Alert>
  );
};
```

### 4. PetSelector Component (para appointments)
```tsx
interface PetSelectorProps {
  pets: Pet[];
  selectedPets: string[];
  onTogglePet: (petId: string) => void;
}

const PetSelector: React.FC<PetSelectorProps> = ({ pets, selectedPets, onTogglePet }) => (
  <div className="pet-selector">
    {pets.map(pet => (
      <div key={pet.id} className="pet-option">
        <Checkbox
          checked={selectedPets.includes(pet.id)}
          onChange={() => onTogglePet(pet.id)}
        />
        <PetCard pet={pet} />
      </div>
    ))}
  </div>
);
```

---

## ✅ Validaciones de Formularios

### Formulario: Crear/Editar Mascota

```typescript
import * as yup from 'yup';

const petValidationSchema = yup.object({
  name: yup.string()
    .required('El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  species: yup.string()
    .required('La especie es obligatoria')
    .oneOf(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other']),

  breed: yup.string()
    .max(100, 'La raza no puede exceder 100 caracteres')
    .optional(),

  birthDate: yup.date()
    .required('La fecha de nacimiento es obligatoria')
    .max(new Date(), 'La fecha de nacimiento no puede ser futura')
    .min(new Date('1900-01-01'), 'Fecha inválida'),

  gender: yup.string()
    .required('El género es obligatorio')
    .oneOf(['male', 'female', 'unknown']),

  weight: yup.number()
    .positive('El peso debe ser positivo')
    .max(500, 'El peso no puede exceder 500 kg')
    .optional(),

  microchipNumber: yup.string()
    .matches(/^[0-9]{15}$/, 'El microchip debe tener 15 dígitos')
    .optional(),

  temperament: yup.string()
    .oneOf(['calm', 'nervous', 'aggressive', 'friendly', 'unknown'])
    .optional(),

  behaviorNotes: yup.array()
    .of(yup.string().max(200))
    .optional(),

  generalNotes: yup.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
});
```

### Formulario: Registrar Consulta Médica

```typescript
const medicalRecordValidationSchema = yup.object({
  petId: yup.string()
    .required('Debe seleccionar una mascota')
    .uuid('ID de mascota inválido'),

  visitDate: yup.date()
    .required('La fecha de visita es obligatoria')
    .max(new Date(), 'La fecha de visita no puede ser futura'),

  visitType: yup.string()
    .required('El tipo de visita es obligatorio')
    .oneOf(['consultation', 'vaccination', 'surgery', 'emergency', 'checkup']),

  reason: yup.string()
    .required('El motivo de la consulta es obligatorio')
    .max(500, 'El motivo no puede exceder 500 caracteres'),

  diagnosis: yup.string()
    .max(1000, 'El diagnóstico no puede exceder 1000 caracteres')
    .optional(),

  treatment: yup.string()
    .max(1000, 'El tratamiento no puede exceder 1000 caracteres')
    .optional(),

  weightAtVisit: yup.number()
    .positive('El peso debe ser positivo')
    .max(500, 'El peso no puede exceder 500 kg')
    .optional(),

  temperature: yup.number()
    .min(35, 'Temperatura muy baja (min: 35°C)')
    .max(42, 'Temperatura muy alta (max: 42°C)')
    .optional(),

  serviceCost: yup.number()
    .min(0, 'El costo no puede ser negativo')
    .max(10000, 'El costo no puede exceder $10,000')
    .optional(),
});
```

### Formulario: Agendar Cita con Mascotas

```typescript
const appointmentWithPetsValidationSchema = yup.object({
  date: yup.date()
    .required('La fecha es obligatoria')
    .min(new Date(), 'La fecha no puede ser en el pasado'),

  pets: yup.array()
    .of(
      yup.object({
        petId: yup.string().uuid().required(),
        notes: yup.string().max(500).optional(),
        serviceIds: yup.array()
          .of(yup.string().uuid())
          .min(1, 'Debe seleccionar al menos un servicio')
          .required(),
        price: yup.number()
          .min(0, 'El precio no puede ser negativo')
          .optional(),
      })
    )
    .min(1, 'Debe agregar al menos una mascota')
    .required(),
});
```

---

## 🎨 Estados de UI Recomendados

### Loading States

```tsx
// Skeleton para lista de mascotas
const PetListSkeleton = () => (
  <div className="pet-list">
    {[1, 2, 3].map(i => (
      <Skeleton key={i} variant="rectangular" width={300} height={200} />
    ))}
  </div>
);

// Skeleton para perfil completo
const ProfileSkeleton = () => (
  <div className="profile-skeleton">
    <Skeleton variant="circular" width={100} height={100} />
    <Skeleton variant="text" width={200} />
    <Skeleton variant="rectangular" width="100%" height={400} />
  </div>
);
```

### Empty States

```tsx
const NoPetsEmptyState = () => (
  <EmptyState
    icon={<PetsIcon fontSize="large" />}
    title="No tienes mascotas registradas"
    description="Comienza agregando tu primera mascota para acceder a todos los servicios"
    action={
      <Button onClick={onAddPet}>
        <AddIcon /> Agregar Mi Primera Mascota
      </Button>
    }
  />
);

const NoMedicalRecordsEmptyState = () => (
  <EmptyState
    icon={<MedicalServicesIcon fontSize="large" />}
    title="Sin historial médico"
    description="Cuando tu mascota tenga consultas veterinarias, aparecerán aquí"
  />
);
```

### Error States

```tsx
const PetLoadError = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState
    title="Error al cargar la mascota"
    description="No pudimos cargar la información. Por favor intenta de nuevo."
    action={
      <Button onClick={onRetry}>
        <RefreshIcon /> Reintentar
      </Button>
    }
  />
);
```

---

## 🔔 Notificaciones y Alertas

### Eventos que Deben Generar Notificaciones

1. **Mascota creada exitosamente**
   - Tipo: Success
   - Mensaje: "¡Mascota registrada! Ahora puedes agendar citas para [Nombre]"

2. **Vacuna próxima a vencer**
   - Tipo: Warning
   - Mensaje: "La vacuna [Nombre] de [Mascota] vence en [X] días"
   - Acción: "Ver detalles" → Ir a perfil de mascota

3. **Cita confirmada**
   - Tipo: Info
   - Mensaje: "Cita confirmada para [Fecha] con [Mascotas]"
   - Acción: "Ver detalles" → Ir a appointment

4. **Registro médico creado**
   - Tipo: Info
   - Mensaje: "Se agregó una nueva consulta médica para [Mascota]"
   - Acción: "Ver historial"

5. **Error al crear/actualizar**
   - Tipo: Error
   - Mensaje: "No se pudo guardar la información. Intenta de nuevo."

---

## 📱 Responsive Design

### Breakpoints Recomendados

```scss
// Mobile first
$breakpoint-sm: 640px;  // Tablets
$breakpoint-md: 768px;  // Tablets landscape
$breakpoint-lg: 1024px; // Desktop
$breakpoint-xl: 1280px; // Large desktop

// Ejemplo de uso
.pet-grid {
  display: grid;
  grid-template-columns: 1fr; // Mobile: 1 columna

  @media (min-width: $breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr); // Tablet: 2 columnas
  }

  @media (min-width: $breakpoint-lg) {
    grid-template-columns: repeat(3, 1fr); // Desktop: 3 columnas
  }

  @media (min-width: $breakpoint-xl) {
    grid-template-columns: repeat(4, 1fr); // Large: 4 columnas
  }
}
```

### Layouts Adaptables

**Mobile (< 640px):**
- Vista de lista vertical para mascotas
- Tabs para secciones del perfil (Médico, Grooming, Citas)
- Formularios en una sola columna

**Tablet (640px - 1024px):**
- Grid de 2 columnas para lista de mascotas
- Perfil con sidebar colapsable
- Formularios en dos columnas para campos relacionados

**Desktop (> 1024px):**
- Grid de 3-4 columnas para mascotas
- Perfil con sidebar fijo + contenido principal
- Formularios en layout optimizado con grupos visuales

---

## 🔒 Seguridad en Frontend

### 1. Manejo de Tokens

```typescript
// auth.service.ts
class AuthService {
  private tokenKey = 'pet_shop_token';

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token no está expirado
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  }
}
```

### 2. Interceptor HTTP

```typescript
// api.service.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

// Request interceptor: Agregar token
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      AuthService.clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Protección de Rutas

```tsx
// ProtectedRoute.tsx
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

// AdminRoute.tsx
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user?.roles.includes('admin')) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};
```

### 4. Sanitización de Inputs

```typescript
import DOMPurify from 'dompurify';

// Para campos de texto que permiten HTML (notas, observaciones)
const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// Uso en componente
const handleSubmit = (data: any) => {
  const sanitizedData = {
    ...data,
    notes: sanitizeHTML(data.notes),
    observations: sanitizeHTML(data.observations),
  };

  // Enviar datos sanitizados
};
```

---

## 🧪 Testing

### Ejemplo de Test: PetCard Component

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import PetCard from './PetCard';

describe('PetCard', () => {
  const mockPet: Pet = {
    id: '123',
    name: 'Max',
    species: PetSpecies.DOG,
    breed: 'Golden Retriever',
    birthDate: new Date('2020-05-15'),
    gender: PetGender.MALE,
    weight: 30,
    temperament: PetTemperament.FRIENDLY,
    behaviorNotes: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders pet name and breed', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
  });

  it('calculates age correctly', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText(/5 años/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<PetCard pet={mockPet} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Ejemplo de Test: API Service

```typescript
import { fetchPets, createPet } from './pets.service';
import api from './api.service';

jest.mock('./api.service');

describe('Pets Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches pets successfully', async () => {
    const mockPets = [{ id: '1', name: 'Max' }];
    (api.get as jest.Mock).mockResolvedValue({ data: mockPets });

    const pets = await fetchPets();

    expect(api.get).toHaveBeenCalledWith('/pets');
    expect(pets).toEqual(mockPets);
  });

  it('creates pet successfully', async () => {
    const newPet: CreatePetDto = {
      name: 'Luna',
      species: PetSpecies.CAT,
      birthDate: '2021-08-20',
      gender: PetGender.FEMALE,
    };

    const mockResponse = { id: '2', ...newPet };
    (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    const pet = await createPet(newPet);

    expect(api.post).toHaveBeenCalledWith('/pets', newPet);
    expect(pet).toEqual(mockResponse);
  });
});
```

---

## 📚 Librerías Recomendadas

### Core
- **React** (18+) o **Next.js** (14+)
- **TypeScript** (5+)
- **Axios** o **Fetch API** para HTTP requests

### State Management
- **React Query** / **TanStack Query** - Ideal para cache de datos del servidor
- **Zustand** o **Redux Toolkit** - Para estado global de la app

### Forms
- **React Hook Form** - Manejo eficiente de formularios
- **Yup** o **Zod** - Validación de esquemas

### UI/UX
- **Material-UI** / **Chakra UI** / **Tailwind CSS** - Componentes y estilos
- **Recharts** o **Chart.js** - Gráficos (peso, estadísticas)
- **date-fns** o **Day.js** - Manejo de fechas
- **React DatePicker** - Selector de fechas

### Utilidades
- **DOMPurify** - Sanitización de HTML
- **React Hot Toast** o **Notistack** - Notificaciones
- **React Icons** - Iconos

---

## 🚀 Próximos Pasos

1. **Configurar proyecto frontend** con las tecnologías elegidas
2. **Implementar autenticación** (login, registro, manejo de tokens)
3. **Crear módulo de Mascotas** (CRUD completo)
4. **Integrar con Appointments** (vincular mascotas a citas)
5. **Implementar perfil completo** (vista consolidada)
6. **Agregar módulos médicos y grooming** (si aplica para clientes)
7. **Panel de administración** (para veterinarios y groomers)
8. **Testing y optimización**
9. **Deploy a producción**

---

## 📞 Soporte

Para dudas sobre los endpoints o modelos de datos, consultar:
- **Swagger Documentation**: `http://localhost:3000/api`
- **Archivo de especificaciones completas**: `mvp_medical_grooming.md`
- **Estado de implementación**: `IMPLEMENTATION_STATUS.md`

---

**Fecha de última actualización:** 2025-11-02
**Versión:** 1.0.0
**Autor:** Backend Team (NestJS Implementation)

