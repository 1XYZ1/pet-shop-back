/**
 * Enum para los tipos de productos en la tienda de mascotas
 * Define la categoría general del producto (alimento, accesorio, juguete, etc.)
 */
export enum ProductType {
  /** Alimento seco (croquetas, balanceado) */
  ALIMENTO_SECO = 'alimento-seco',
  /** Alimento húmedo (latas, paté, sobres) */
  ALIMENTO_HUMEDO = 'alimento-humedo',
  /** Snacks y premios para mascotas */
  SNACKS = 'snacks',
  /** Accesorios (collares, camas, comederos, transportadoras, etc.) */
  ACCESORIOS = 'accesorios',
  /** Juguetes para entretenimiento y ejercicio */
  JUGUETES = 'juguetes',
  /** Productos de higiene y cuidado (shampoo, arena para gatos, etc.) */
  HIGIENE = 'higiene',
}
