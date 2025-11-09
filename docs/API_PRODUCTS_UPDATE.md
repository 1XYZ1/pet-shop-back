# API de Productos - Actualización

## 🔄 Cambios Importantes

El módulo de productos ahora separa correctamente:
- **`type`**: Tipo de producto (alimento, accesorio, juguete, etc.) - **REQUERIDO**
- **`species`**: Especie de mascota (cats/dogs) - **OPCIONAL**

## 📋 Enums Disponibles

### ProductType (Requerido)
```typescript
'alimento-seco'    // Croquetas, balanceado
'alimento-humedo'  // Latas, paté, sobres
'snacks'           // Premios, galletas
'accesorios'       // Collares, camas, comederos, transportadoras
'juguetes'         // Pelotas, cuerdas, ratones
'higiene'          // Shampoo, arena para gatos
```

### ProductSpecies (Opcional)
```typescript
'cats'   // Productos para gatos
'dogs'   // Productos para perros
null     // Productos universales (sin especie específica)
```

## 🔌 Endpoints

### GET /api/products
Obtiene lista de productos con filtros opcionales.

**Query Parameters:**
```typescript
limit?: number        // Default: 10, Max: 100
offset?: number       // Default: 0
q?: string           // Búsqueda en título/descripción
type?: ProductType   // Filtro por tipo de producto
species?: ProductSpecies  // Filtro por especie
sizes?: string       // Ej: "S,M,L"
minPrice?: number    // Precio mínimo
maxPrice?: number    // Precio máximo
```

**Ejemplos:**
```bash
# Todos los alimentos secos para perros
GET /api/products?type=alimento-seco&species=dogs

# Todos los accesorios
GET /api/products?type=accesorios

# Productos para gatos entre $10 y $50
GET /api/products?species=cats&minPrice=10&maxPrice=50

# Buscar "collar" en productos para perros
GET /api/products?q=collar&species=dogs
```

**Respuesta:**
```json
{
  "products": [
    {
      "id": "uuid",
      "title": "Alimento Premium Perro Adulto",
      "price": 45.99,
      "description": "...",
      "type": "alimento-seco",      // ← NUEVO CAMPO
      "species": "dogs",             // ← RENOMBRADO (antes: category)
      "sizes": ["3kg", "7kg", "15kg"],
      "tags": ["perro", "adulto", "premium"],
      "images": ["url1.jpg", "url2.jpg"],
      "stock": 45
    }
  ],
  "total": 30,
  "limit": 10,
  "offset": 0,
  "pages": 3
}
```

### GET /api/products/:id
Obtiene un producto por ID, título o slug.

**Respuesta:** Mismo formato que arriba (producto individual)

### POST /api/products
Crea un nuevo producto. **Requiere autenticación**.

**Body:**
```json
{
  "title": "Alimento Premium",
  "type": "alimento-seco",        // REQUERIDO ✅
  "species": "dogs",               // OPCIONAL
  "price": 45.99,
  "description": "Descripción del producto",
  "sizes": ["3kg", "7kg", "15kg"],
  "tags": ["premium", "adulto"],
  "images": ["image1.jpg"],        // OPCIONAL
  "stock": 50                      // OPCIONAL (default: 0)
}
```

### PATCH /api/products/:id
Actualiza un producto. **Requiere rol admin**.

**Body:** Todos los campos opcionales (partial update)

### DELETE /api/products/:id
Elimina un producto. **Requiere rol admin**.

## ⚠️ Breaking Changes para Frontend

### ❌ Campo Eliminado
- `category` ya NO existe

### ✅ Nuevos Campos
- `type` (string, requerido en POST)
- `species` (string | null, opcional en POST)

### 🔄 Cambios en Query Params
- **Antes:** `?category=dogs`
- **Ahora:** `?species=dogs`

## 📝 Ejemplos de Uso Frontend

### Crear Producto
```typescript
const newProduct = {
  title: "Collar Ajustable Premium",
  type: "accesorios",        // ← Nuevo campo requerido
  species: "dogs",            // ← Opcional
  price: 15.99,
  sizes: ["S", "M", "L"],
  stock: 50
};

await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProduct)
});
```

### Filtrar Productos
```typescript
// Obtener todos los alimentos para perros
const response = await fetch('/api/products?type=alimento-seco&species=dogs');
const data = await response.json();
```

### Actualizar Componentes
```typescript
// Interfaz TypeScript actualizada
interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  type: 'alimento-seco' | 'alimento-humedo' | 'snacks' | 'accesorios' | 'juguetes' | 'higiene';
  species?: 'cats' | 'dogs' | null;  // ← Renombrado de 'category'
  sizes: string[];
  tags: string[];
  images: string[];
  stock: number;
}
```

## 🎯 Casos de Uso Comunes

1. **Catálogo de productos para perros:**
   ```
   GET /api/products?species=dogs&limit=20
   ```

2. **Filtro por tipo en el sidebar:**
   ```
   GET /api/products?type=juguetes
   ```

3. **Buscar alimentos económicos:**
   ```
   GET /api/products?type=alimento-seco&maxPrice=30
   ```

4. **Productos universales (sin especie):**
   ```
   GET /api/products
   // Filtrar en frontend: products.filter(p => !p.species)
   ```

## 📞 Contacto

Si tienes dudas o encuentras algún problema, házmelo saber.
