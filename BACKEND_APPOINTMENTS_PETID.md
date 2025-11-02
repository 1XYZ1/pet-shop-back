# Backend: Integrar Appointments con PetId

## Resumen
El frontend de appointments ya está preparado para usar `petId` en lugar de `petName/petBreed`. El backend necesita actualizar el DTO y la entidad para aceptar esta relación.

---

## Cambios Requeridos en el Backend

### 1. DTO de Creación (`create-appointment.dto.ts`)

**ANTES:**
```typescript
export class CreateAppointmentDto {
  @IsString()
  @MinLength(2)
  petName: string;

  @IsOptional()
  @IsString()
  petBreed?: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

**DESPUÉS:**
```typescript
export class CreateAppointmentDto {
  @IsUUID()
  petId: string;  // ✅ Cambio principal

  @IsUUID()
  serviceId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

### 2. Entidad de Appointment (`appointment.entity.ts`)

**ANTES:**
```typescript
@Entity('appointments')
export class Appointment {
  @Column()
  petName: string;

  @Column({ nullable: true })
  petBreed?: string;

  @ManyToOne(() => Service)
  service: Service;

  @ManyToOne(() => User)
  customer: User;
}
```

**DESPUÉS:**
```typescript
@Entity('appointments')
export class Appointment {
  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'petId' })
  pet: Pet;  // ✅ Relación con la tabla pets

  @ManyToOne(() => Service)
  service: Service;

  @ManyToOne(() => User)
  customer: User;
}
```

---

### 3. Responses - Popular el Objeto Pet

En el servicio o controlador, asegúrate de popular la relación:

```typescript
// appointments.service.ts
async findAll(userId: string) {
  return this.appointmentRepository.find({
    where: { customer: { id: userId } },
    relations: ['service', 'pet'],  // ✅ Popular pet
  });
}

async findOne(id: string) {
  return this.appointmentRepository.findOne({
    where: { id },
    relations: ['service', 'pet', 'customer'],  // ✅ Popular pet
  });
}
```

---

### 4. Migración de Base de Datos

Crear una nueva migración para:
1. Agregar columna `petId` (UUID, nullable inicialmente)
2. Agregar Foreign Key a la tabla `pets`
3. **Opcional:** Migrar datos existentes (matchear `petName` con `pet.name`)
4. Eliminar columnas `petName` y `petBreed`

```bash
npm run migration:generate -- src/migrations/UpdateAppointmentsToPetId
npm run migration:run
```

---

## Validaciones Adicionales (Recomendado)

```typescript
// appointments.service.ts
async create(userId: string, dto: CreateAppointmentDto) {
  // Validar que la mascota pertenezca al usuario
  const pet = await this.petsRepository.findOne({
    where: { id: dto.petId, owner: { id: userId } }
  });

  if (!pet) {
    throw new NotFoundException('Mascota no encontrada o no pertenece al usuario');
  }

  // Crear la cita
  const appointment = this.appointmentRepository.create({
    ...dto,
    pet,
    customer: { id: userId },
  });

  return this.appointmentRepository.save(appointment);
}
```

---

## Respuesta Esperada por el Frontend

El frontend espera que las citas devuelvan el objeto `pet` poblado:

```json
{
  "id": "uuid",
  "date": "2025-11-05T10:00:00Z",
  "status": "pending",
  "notes": "Alergias al shampoo",
  "pet": {
    "id": "pet-uuid",
    "name": "Max",
    "breed": "Golden Retriever",
    "species": "dog",
    "profilePhoto": "url..."
  },
  "service": {
    "id": "service-uuid",
    "name": "Baño completo",
    "price": 500
  },
  "customer": {
    "id": "user-uuid",
    "fullName": "Juan Pérez"
  }
}
```

---

## Consistencia con Otros Módulos

Los módulos **Medical** y **Grooming** ya usan `petId`:
- `/medical-records` → `petId: UUID`
- `/grooming-records` → `petId: UUID`
- `/appointments` → Debe usar `petId: UUID` ✅

---

## Checklist de Implementación

- [ ] Actualizar `CreateAppointmentDto` para usar `petId`
- [ ] Actualizar entidad `Appointment` con relación `@ManyToOne(() => Pet)`
- [ ] Crear y ejecutar migración de base de datos
- [ ] Actualizar queries para incluir `relations: ['pet']`
- [ ] Validar que la mascota pertenezca al usuario autenticado
- [ ] Probar endpoints con Postman/Insomnia
- [ ] Verificar respuestas incluyen objeto `pet` completo

---

## Testing

```bash
# POST /appointments
{
  "petId": "09248618-8139-49c5-a97a-06a91f3fc5fe",
  "serviceId": "service-uuid",
  "date": "2025-11-05T10:00:00Z",
  "notes": "Primera cita"
}

# Respuesta esperada: 201 Created
# Con objeto pet poblado
```
