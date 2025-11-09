# API de Fotos de Perfil de Mascotas

## Endpoints Disponibles

### 1. Actualizar Foto de Perfil
```http
PATCH /api/pets/:id/photo
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
- `file`: Archivo de imagen (jpg, jpeg, png, gif)

**Validaciones:**
- Formatos permitidos: jpg, jpeg, png, gif
- Solo el dueño de la mascota puede actualizar

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid",
  "name": "Max",
  "profilePhoto": "http://localhost:3000/api/files/pet/abc123.jpg",
  ...
}
```

### 2. Eliminar Foto de Perfil
```http
DELETE /api/pets/:id/photo
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid",
  "name": "Max",
  "profilePhoto": null,
  ...
}
```

### 3. Obtener Foto (Público)
```http
GET /api/files/pet/:imageName
```

**Uso:** Renderizar directamente en `<img>` tag usando la URL del campo `profilePhoto`

## Implementación Frontend

### Actualizar Foto
```javascript
const formData = new FormData();
formData.append('file', imageFile); // File object del input

const response = await fetch(`/api/pets/${petId}/photo`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const updatedPet = await response.json();
```

### Eliminar Foto
```javascript
const response = await fetch(`/api/pets/${petId}/photo`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const updatedPet = await response.json();
```

### Mostrar Foto
```jsx
<img
  src={pet.profilePhoto || '/default-pet-avatar.png'}
  alt={pet.name}
/>
```

## Notas Importantes

- La foto anterior se elimina automáticamente al subir una nueva
- Si no hay foto, el campo `profilePhoto` será `null`
- Máximo 1 foto por mascota
- El archivo debe enviarse como `multipart/form-data` con nombre de campo `file`
