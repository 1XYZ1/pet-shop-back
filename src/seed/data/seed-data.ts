import * as bcrypt from 'bcrypt';
import { ProductSpecies, ProductType, ServiceType, AppointmentStatus } from '../../common/enums';

/**
 * Funciones helper para generar fechas dinámicamente
 * Actualizado para generar fechas futuras dinámicamente
 */
const generateFutureDate = (daysFromNow: number, hours: number = 10, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const generatePastDate = (daysAgo: number, hours: number = 10, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Interface para productos en el seed
 */
interface SeedProduct {
  description: string;
  images: string[];
  stock: number;
  price: number;
  sizes: ValidSizes[];
  slug: string;
  tags: string[];
  title: string;
  type: ProductType;
  species?: ProductSpecies;
}

type ValidSizes = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | '500g' | '1kg' | '3kg' | '7kg' | '15kg' | '20kg';

/**
 * Interface para servicios en el seed
 */
interface SeedService {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  type: ServiceType;
  image?: string;
  isActive: boolean;
}

/**
 * Interface para citas en el seed
 */
interface SeedAppointment {
  date: Date;
  status: AppointmentStatus;
  notes?: string;
  petIndex: number; // Índice de la mascota en el array de mascotas
  serviceIndex: number; // Índice del servicio en el array de servicios
  customerIndex: number; // Índice del usuario cliente en el array de usuarios
}

/**
 * Interface para usuarios en el seed
 */
interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

/**
 * Interface principal que agrupa todos los datos del seed
 */
interface SeedData {
  users: SeedUser[];
  products: SeedProduct[];
  services: SeedService[];
  appointments: SeedAppointment[];
}

/**
 * Datos iniciales para poblar la base de datos
 * Incluye usuarios, productos para mascotas, servicios y citas de ejemplo
 */
export const initialData: SeedData = {
  users: [
    {
      email: 'admin@petshop.com',
      fullName: 'Administrador Pet Shop',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['admin'],
    },
    {
      email: 'user@petshop.com',
      fullName: 'Usuario Regular',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user', 'super'],
    },
    {
      email: 'vendedor@petshop.com',
      fullName: 'Carlos Vendedor',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user', 'admin'],
    },
    {
      email: 'gerente@petshop.com',
      fullName: 'María Gerente',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['admin'],
    },
    {
      email: 'cliente1@petshop.com',
      fullName: 'Ana López',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user'],
    },
    {
      email: 'cliente2@petshop.com',
      fullName: 'Juan Pérez',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user'],
    },
    {
      email: 'clientevip@petshop.com',
      fullName: 'Laura VIP',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user', 'super'],
    },
    {
      email: 'veterinario@petshop.com',
      fullName: 'Dr. Roberto Martínez',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user', 'super'],
    },
  ],

  products: [
    // ============= PRODUCTOS PARA PERROS (15 productos) =============
    {
      description:
        'Alimento balanceado premium para perros adultos de razas grandes. Formulado con proteínas de alta calidad, vitaminas y minerales esenciales. Ayuda a mantener huesos y articulaciones fuertes. Rico en omega 3 y 6 para un pelaje brillante.',
      images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
      stock: 45,
      price: 45.99,
      sizes: ['3kg', '7kg', '15kg', '20kg'],
      slug: 'alimento_perro_adulto_raza_grande',
      type: ProductType.ALIMENTO_SECO,
      tags: ['perro', 'adulto', 'premium', 'raza-grande'],
      title: 'Alimento Premium Perro Adulto Raza Grande',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Alimento completo para cachorros de todas las razas. Alto contenido de proteínas y DHA para el desarrollo cerebral. Incluye calcio y fósforo en proporciones óptimas para el crecimiento de huesos y dientes.',
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
      stock: 38,
      price: 38.50,
      sizes: ['1kg', '3kg', '7kg', '15kg'],
      slug: 'alimento_cachorro_todas_razas',
      type: ProductType.ALIMENTO_SECO,
      tags: ['cachorro', 'perro', 'desarrollo', 'premium'],
      title: 'Alimento Cachorro Todas las Razas',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Collar ajustable de nylon resistente para perros. Hebilla de liberación rápida de seguridad. Disponible en varios colores vibrantes. Costuras reforzadas para mayor durabilidad. Reflectante para paseos nocturnos.',
      images: ['1741111-00-A_0_2000.jpg', '1741111-00-A_1.jpg'],
      stock: 50,
      price: 15.99,
      sizes: ['S', 'M', 'L', 'XL'],
      slug: 'collar_perro_nylon_ajustable',
      type: ProductType.ACCESORIOS,
      tags: ['collar', 'perro', 'nylon', 'ajustable', 'reflectante'],
      title: 'Collar Ajustable Nylon para Perros',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Pelota lanzadora automática para perros. Sistema de lanzamiento ajustable hasta 9 metros. Funciona con pilas o adaptador AC. Incluye 3 pelotas de tenis. Ideal para perros activos que necesitan ejercicio.',
      images: ['1657932-00-A_0_2000.jpg', '1657932-00-A_1.jpg'],
      stock: 15,
      price: 85.00,
      sizes: ['M'],
      slug: 'pelota_lanzadora_automatica_perros',
      type: ProductType.JUGUETES,
      tags: ['pelota', 'lanzador', 'perro', 'juguete', 'ejercicio'],
      title: 'Pelota Lanzadora Automática',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Shampoo hipoalergénico para perros con piel sensible. Fórmula suave con avena coloidal y aloe vera. Sin parabenos, sulfatos ni fragancias artificiales. pH balanceado. Ideal para perros con alergias o piel irritada.',
      images: ['1740417-00-A_0_2000.jpg', '1740417-00-A_1.jpg'],
      stock: 60,
      price: 16.50,
      sizes: ['M', 'L'],
      slug: 'shampoo_hipoalergenico_perros',
      type: ProductType.HIGIENE,
      tags: ['shampoo', 'hipoalergénico', 'perro', 'piel-sensible'],
      title: 'Shampoo Hipoalergénico para Perros',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Cama ortopédica de memory foam para perros. Alivia presión en articulaciones y músculos. Funda removible y lavable en máquina. Base antideslizante. Ideal para perros senior o con problemas articulares. Disponible en 3 tamaños.',
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
      stock: 25,
      price: 95.00,
      sizes: ['M', 'L', 'XL'],
      slug: 'cama_ortopedica_perro_memory_foam',
      type: ProductType.ACCESORIOS,
      tags: ['cama', 'perro', 'ortopédica', 'memory-foam', 'senior'],
      title: 'Cama Ortopédica Memory Foam',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Premios dentales para perros con forma de hueso. Ayudan a reducir el sarro y mantener dientes limpios. Sabor menta fresca para aliento agradable. Textura masticable que fortalece encías. Sin colorantes artificiales.',
      images: ['8528839-00-A_0_2000.jpg', '8528839-00-A_2.jpg'],
      stock: 80,
      price: 12.99,
      sizes: ['S', 'M', 'L'],
      slug: 'premios_dentales_perro',
      type: ProductType.SNACKS,
      tags: ['perro', 'dental', 'higiene', 'premios', 'snacks'],
      title: 'Premios Dentales para Perros',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Correa retráctil para perros hasta 25kg. Cable de 5 metros de largo. Sistema de frenado de un solo botón. Mango ergonómico antideslizante. Linterna LED integrada. Ideal para paseos y entrenamiento.',
      images: ['1740280-00-A_0_2000.jpg', '1740280-00-A_1.jpg'],
      stock: 35,
      price: 32.00,
      sizes: ['M', 'L'],
      slug: 'correa_retractil_perro_5m',
      type: ProductType.ACCESORIOS,
      tags: ['correa', 'perro', 'retráctil', 'paseo', 'led'],
      title: 'Correa Retráctil 5 metros con LED',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Arnés acolchado para perros de pecho ajustable. Distribuye mejor la presión que un collar tradicional. Reflectante para paseos nocturnos. Cierre tipo chaleco, fácil de poner. Material transpirable.',
      images: ['1741416-00-A_0_2000.jpg', '1741416-00-A_1.jpg'],
      stock: 40,
      price: 28.50,
      sizes: ['S', 'M', 'L', 'XL'],
      slug: 'arnes_perro_acolchado_reflectante',
      type: ProductType.ACCESORIOS,
      tags: ['arnés', 'perro', 'acolchado', 'reflectante', 'seguridad'],
      title: 'Arnés Acolchado Reflectante',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Huesos masticables naturales para perros. 100% carne deshidratada sin aditivos químicos. Ayudan a limpiar los dientes mientras mastican. Ricos en proteínas, perfectos para perros activos. Larga duración.',
      images: ['9877034-00-A_0_2000.jpg', '9877034-00-A_2.jpg'],
      stock: 65,
      price: 18.99,
      sizes: ['M', 'L', 'XL'],
      slug: 'huesos_masticables_naturales',
      type: ProductType.SNACKS,
      tags: ['perro', 'hueso', 'natural', 'masticable', 'dental'],
      title: 'Huesos Masticables Naturales',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Lata de comida húmeda para perros adultos sabor pollo y verduras. 100% carne real sin subproductos. Alto contenido de humedad para una mejor hidratación. Sin conservantes artificiales ni colorantes. Pack x12 latas.',
      images: ['8764734-00-A_0_2000.jpg', '8764734-00-A_1.jpg'],
      stock: 120,
      price: 42.00,
      sizes: ['M'],
      slug: 'lata_perro_pollo_verduras_pack12',
      type: ProductType.ALIMENTO_HUMEDO,
      tags: ['perro', 'húmedo', 'pollo', 'lata', 'pack'],
      title: 'Pack x12 Latas Pollo y Verduras 375g',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Snacks suaves para cachorros en entrenamiento. Tamaño pequeño ideal para recompensar durante el adiestramiento. Sabor pollo y arroz, fáciles de digerir. Bajos en grasa. Bolsa resellable para mantener frescura.',
      images: ['1740245-00-A_0_2000.jpg', '1740245-00-A_1.jpg'],
      stock: 70,
      price: 14.50,
      sizes: ['S'],
      slug: 'snacks_entrenamiento_cachorros',
      type: ProductType.SNACKS,
      tags: ['cachorro', 'perro', 'entrenamiento', 'premios', 'adiestramiento'],
      title: 'Snacks Entrenamiento para Cachorros',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Comedero elevado de acero inoxidable para perros. Base ajustable en altura (3 niveles). Reduce tensión en cuello y espalda. Fácil de limpiar, apto para lavavajillas. Incluye 2 platos removibles. Ideal para razas grandes.',
      images: ['1703767-00-A_0_2000.jpg', '1703767-00-A_1.jpg'],
      stock: 30,
      price: 48.00,
      sizes: ['M', 'L'],
      slug: 'comedero_elevado_acero_ajustable',
      type: ProductType.ACCESORIOS,
      tags: ['comedero', 'acero', 'perro', 'elevado', 'ajustable'],
      title: 'Comedero Elevado Ajustable',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Cuerda de algodón trenzada para perros. Perfecta para juegos de tira y afloja. Ayuda a limpiar dientes y masajear encías. 100% algodón natural. Varios tamaños según el tamaño del perro. Nudos resistentes.',
      images: ['1700280-00-A_0_2000.jpg', '1700280-00-A_1.jpg'],
      stock: 55,
      price: 13.99,
      sizes: ['S', 'M', 'L'],
      slug: 'cuerda_algodon_trenzada',
      type: ProductType.JUGUETES,
      tags: ['cuerda', 'algodón', 'perro', 'dental', 'juguete'],
      title: 'Cuerda Algodón Trenzada',
      species: ProductSpecies.DOGS,
    },
    {
      description:
        'Transportadora rígida para perros pequeños y medianos. Cumple normativas de viaje aéreo IATA. Puerta de alambre con doble cerradura. Ventilación en los 4 lados. Asa superior reforzada y correa para hombro.',
      images: ['7654393-00-A_2_2000.jpg', '7654393-00-A_3.jpg'],
      stock: 20,
      price: 75.00,
      sizes: ['S', 'M', 'L'],
      slug: 'transportadora_rigida_perro_viaje',
      type: ProductType.ACCESORIOS,
      tags: ['transportadora', 'viaje', 'perro', 'aéreo', 'iata'],
      title: 'Transportadora Rígida para Viaje',
      species: ProductSpecies.DOGS,
    },

    // ============= PRODUCTOS PARA GATOS (15 productos) =============
    {
      description:
        'Alimento balanceado premium para gatos adultos. Formulado con pollo y pescado como principales fuentes de proteína. Controla el pH urinario y previene la formación de cristales. Rico en taurina para la salud cardíaca y visual.',
      images: ['1740051-00-A_0_2000.jpg', '1740051-00-A_1.jpg'],
      stock: 50,
      price: 38.99,
      sizes: ['1kg', '3kg', '7kg', '15kg'],
      slug: 'alimento_gato_adulto_premium',
      type: ProductType.ALIMENTO_SECO,
      tags: ['gato', 'adulto', 'premium', 'salud-urinaria'],
      title: 'Alimento Premium Gato Adulto',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Alimento especial para gatitos en crecimiento. Alto contenido proteico para el desarrollo muscular. Incluye DHA para el desarrollo cerebral y visual. Croquetas pequeñas adaptadas a mandíbulas de gatitos. Con vitaminas y minerales.',
      images: ['1549268-00-A_0_2000.jpg', '1549268-00-A_2.jpg'],
      stock: 42,
      price: 35.50,
      sizes: ['500g', '1kg', '3kg', '7kg'],
      slug: 'alimento_gatito_crecimiento',
      type: ProductType.ALIMENTO_SECO,
      tags: ['gatito', 'cachorro', 'gato', 'desarrollo', 'kitten'],
      title: 'Alimento Gatito en Crecimiento',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Arenero autolimpiable automático para gatos. Sistema de limpieza automática cada 30 minutos. Depósito de desechos sellado con control de olores. Compatible con arena aglomerante. Sensor de seguridad. Funciona con pilas o adaptador.',
      images: ['7652426-00-A_0_2000.jpg', '7652426-00-A_1.jpg'],
      stock: 12,
      price: 180.00,
      sizes: ['L'],
      slug: 'arenero_autolimpiable_automatico',
      type: ProductType.ACCESORIOS,
      tags: ['arenero', 'gato', 'automático', 'autolimpiable', 'tecnología'],
      title: 'Arenero Autolimpiable Automático',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Ratón interactivo con sensor de movimiento para gatos. Se activa automáticamente cuando el gato se acerca. Movimientos erráticos que imitan presas reales. Estimula el instinto cazador. Funciona con 2 pilas AAA. Duradero y lavable.',
      images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
      stock: 35,
      price: 22.00,
      sizes: ['S'],
      slug: 'raton_interactivo_sensor',
      type: ProductType.JUGUETES,
      tags: ['ratón', 'interactivo', 'gato', 'sensor', 'juguete'],
      title: 'Ratón Interactivo con Sensor',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Rascador torre con plataforma y hamaca para gatos. Poste cubierto de sisal natural. Base amplia y estable (60x40cm). Altura 120cm ideal para que el gato se estire completamente. Incluye juguete colgante con plumas. Fácil montaje.',
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
      stock: 18,
      price: 95.00,
      sizes: ['L'],
      slug: 'rascador_torre_hamaca_120cm',
      type: ProductType.ACCESORIOS,
      tags: ['rascador', 'gato', 'torre', 'hamaca', 'sisal'],
      title: 'Rascador Torre con Hamaca 120cm',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Fuente de agua automática con filtro de carbón activado. Capacidad 2 litros. Sistema de circulación silencioso que mantiene el agua fresca y oxigenada. Alienta a los gatos a beber más agua. Fácil de limpiar, apto para lavavajillas.',
      images: ['1741111-00-A_0_2000.jpg', '1741111-00-A_1.jpg'],
      stock: 28,
      price: 45.00,
      sizes: ['M'],
      slug: 'fuente_agua_automatica_gatos',
      type: ProductType.ACCESORIOS,
      tags: ['bebedero', 'fuente', 'gato', 'automático', 'filtro'],
      title: 'Fuente de Agua Automática',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Paté gourmet para gatos adultos sabor salmón. Textura suave y cremosa que los gatos adoran. Rico en omega 3 para pelaje brillante. Latas de fácil apertura, porción individual 85g. Pack x24 latas. Sin granos ni conservantes.',
      images: ['1657932-00-A_0_2000.jpg', '1657932-00-A_1.jpg'],
      stock: 90,
      price: 38.50,
      sizes: ['S'],
      slug: 'pate_gato_salmon_pack24',
      type: ProductType.ALIMENTO_HUMEDO,
      tags: ['gato', 'paté', 'salmón', 'gourmet', 'pack'],
      title: 'Pack x24 Paté Gato Salmón 85g',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Galletas crujientes para gatos sabor pollo. Snacks bajos en calorías perfectos para premiar. Con vitaminas y minerales esenciales. Ayudan a controlar las bolas de pelo. Textura crujiente que cuida los dientes. Bolsa resellable 200g.',
      images: ['1740417-00-A_0_2000.jpg', '1740417-00-A_1.jpg'],
      stock: 65,
      price: 9.99,
      sizes: ['M'],
      slug: 'galletas_gato_pollo',
      type: ProductType.SNACKS,
      tags: ['gato', 'galletas', 'snacks', 'pollo', 'dental'],
      title: 'Galletas para Gatos Sabor Pollo',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Stick cremoso para gatos sabor atún y camarón. Textura cremosa que se puede dar directamente del sobre. Perfecto para crear vínculo con tu gato. Rico en taurina y vitamina E. Pack x40 sobres de 15g. Complemento alimenticio.',
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
      stock: 75,
      price: 28.00,
      sizes: ['S'],
      slug: 'stick_cremoso_gato_atun_pack40',
      type: ProductType.SNACKS,
      tags: ['gato', 'stick', 'cremoso', 'atún', 'premio'],
      title: 'Pack x40 Stick Cremoso Atún',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Varita interactiva para gatos con plumas naturales. Caña flexible de 90cm con plumas de colores en el extremo. Estimula el ejercicio y el juego activo. Fortalece el vínculo con tu gato. Incluye 3 repuestos de plumas.',
      images: ['1740280-00-A_0_2000.jpg', '1740280-00-A_1.jpg'],
      stock: 48,
      price: 11.50,
      sizes: ['M'],
      slug: 'varita_interactiva_plumas',
      type: ProductType.JUGUETES,
      tags: ['varita', 'interactivo', 'gato', 'plumas', 'ejercicio'],
      title: 'Varita Interactiva con Plumas',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Arenero cerrado para gatos con tapa y filtro de carbón. Reduce olores y evita que la arena se esparza. Puerta abatible para fácil acceso. Pala incluida. Fácil limpieza. Dimensiones 50x40x40cm. Apto para gatos hasta 8kg.',
      images: ['1741416-00-A_0_2000.jpg', '1741416-00-A_1.jpg'],
      stock: 32,
      price: 42.00,
      sizes: ['M', 'L'],
      slug: 'arenero_cerrado_filtro_carbon',
      type: ProductType.ACCESORIOS,
      tags: ['arenero', 'gato', 'cerrado', 'filtro', 'control-olores'],
      title: 'Arenero Cerrado con Filtro',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Alimento para gatos senior mayores de 7 años. Fórmula especial para riñones y sistema urinario. Fácil digestión con proteínas de alta calidad. Incluye condroprotectores para articulaciones. Textura adaptada para dientes sensibles.',
      images: ['7654393-00-A_2_2000.jpg', '7654393-00-A_3.jpg'],
      stock: 30,
      price: 42.99,
      sizes: ['1kg', '3kg', '7kg'],
      slug: 'alimento_gato_senior',
      type: ProductType.ALIMENTO_SECO,
      tags: ['gato', 'senior', 'mayores', 'salud-renal', '+7'],
      title: 'Alimento Gato Senior +7 años',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Ratón de peluche relleno con catnip orgánico para gatos. Tamaño 8cm perfecto para cazar y transportar. Estimula el instinto de caza y el juego. Material suave y seguro, libre de tóxicos. Pack x3 ratones de colores variados.',
      images: ['1703767-00-A_0_2000.jpg', '1703767-00-A_1.jpg'],
      stock: 85,
      price: 7.50,
      sizes: ['S'],
      slug: 'raton_peluche_catnip_pack3',
      type: ProductType.JUGUETES,
      tags: ['ratón', 'catnip', 'gato', 'peluche', 'pack'],
      title: 'Pack x3 Ratón Peluche con Catnip',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Comedero doble de cerámica para gatos. Diseño elevado de 5cm para mejor postura al comer. Platos separados para agua y comida. Base antideslizante de silicona. Apto para lavavajillas. Higiénico y fácil de limpiar. Diseño moderno.',
      images: ['1700280-00-A_0_2000.jpg', '1700280-00-A_1.jpg'],
      stock: 40,
      price: 32.00,
      sizes: ['M'],
      slug: 'comedero_doble_ceramica_elevado',
      type: ProductType.ACCESORIOS,
      tags: ['comedero', 'cerámica', 'gato', 'elevado', 'doble'],
      title: 'Comedero Doble Cerámica Elevado',
      species: ProductSpecies.CATS,
    },
    {
      description:
        'Cama tipo cueva para gatos. Material suave tipo felpa. Interior acolchado ultra confortable. Los gatos se sienten seguros y protegidos. Funda removible y lavable en máquina. Base antideslizante. Ideal para gatos que aman esconderse.',
      images: ['8528839-00-A_0_2000.jpg', '8528839-00-A_2.jpg'],
      stock: 25,
      price: 38.00,
      sizes: ['M'],
      slug: 'cama_cueva_gatos_felpa',
      type: ProductType.ACCESORIOS,
      tags: ['cama', 'cueva', 'gato', 'felpa', 'confort'],
      title: 'Cama tipo Cueva para Gatos',
      species: ProductSpecies.CATS,
    },
  ],

  services: [
    {
      name: 'Peluquería Canina Básica',
      description: 'Servicio completo de peluquería para perros que incluye baño con shampoo premium, secado profesional, corte de uñas, limpieza de oídos y glándulas anales. Ideal para mantenimiento regular.',
      price: 35.00,
      durationMinutes: 90,
      type: ServiceType.GROOMING,
      image: 'grooming-basic.jpg',
      isActive: true,
    },
    {
      name: 'Peluquería Canina Premium',
      description: 'Servicio premium de peluquería que incluye todo lo del servicio básico más corte de pelo según raza o preferencia, cepillado profundo, hidratación del pelaje, perfume especial y moño decorativo.',
      price: 65.00,
      durationMinutes: 150,
      type: ServiceType.GROOMING,
      image: 'grooming-premium.jpg',
      isActive: true,
    },
    {
      name: 'Peluquería Express',
      description: 'Servicio rápido de peluquería para perros que incluye baño, secado y corte de uñas. Perfecto para perros que necesitan un aseo rápido o tienen urgencia.',
      price: 25.00,
      durationMinutes: 60,
      type: ServiceType.GROOMING,
      image: 'grooming-express.jpg',
      isActive: true,
    },
    {
      name: 'Consulta Veterinaria General',
      description: 'Consulta médica veterinaria general que incluye examen físico completo, diagnóstico inicial, asesoramiento nutricional y de cuidados. Evaluación del estado de salud general de tu mascota.',
      price: 45.00,
      durationMinutes: 30,
      type: ServiceType.VETERINARY,
      image: 'vet-consultation.jpg',
      isActive: true,
    },
    {
      name: 'Vacunación y Desparasitación',
      description: 'Servicio de vacunación según calendario de vacunación (parvovirus, moquillo, rabia, etc.) y desparasitación interna y externa. Incluye cartilla de vacunación actualizada.',
      price: 55.00,
      durationMinutes: 20,
      type: ServiceType.VETERINARY,
      image: 'vaccination.jpg',
      isActive: true,
    },
    {
      name: 'Consulta Veterinaria de Emergencia',
      description: 'Atención veterinaria de emergencia para casos urgentes. Evaluación inmediata, estabilización y tratamiento de emergencias médicas. Disponible en horario extendido.',
      price: 85.00,
      durationMinutes: 45,
      type: ServiceType.VETERINARY,
      image: 'vet-emergency.jpg',
      isActive: true,
    },
    {
      name: 'Chequeo Geriátrico Completo',
      description: 'Chequeo médico especializado para mascotas mayores de 7 años. Incluye examen físico, análisis de sangre básicos, evaluación articular y recomendaciones nutricionales para la tercera edad.',
      price: 95.00,
      durationMinutes: 60,
      type: ServiceType.VETERINARY,
      image: 'geriatric-checkup.jpg',
      isActive: true,
    },
  ],

  appointments: [
    {
      date: generateFutureDate(2, 10, 0), // 2 días en el futuro a las 10:00
      status: AppointmentStatus.CONFIRMED,
      notes: 'Primera vez que viene Max, es un poco nervioso con el agua',
      petIndex: 0, // Max - Golden Retriever
      serviceIndex: 0, // Peluquería Canina Básica
      customerIndex: 1, // owner de Max
    },
    {
      date: generateFutureDate(3, 14, 30), // 3 días en el futuro a las 14:30
      status: AppointmentStatus.PENDING,
      notes: 'Luna necesita corte de uñas urgente',
      petIndex: 1, // Luna - Siamés
      serviceIndex: 3, // Consulta Veterinaria General
      customerIndex: 1, // owner de Luna
    },
    {
      date: generateFutureDate(4, 9, 0), // 4 días en el futuro a las 9:00
      status: AppointmentStatus.CONFIRMED,
      notes: 'Vacunación anual de Rocky',
      petIndex: 2, // Rocky - Bulldog Francés
      serviceIndex: 4, // Vacunación y Desparasitación
      customerIndex: 2, // owner de Rocky
    },
    {
      date: generateFutureDate(5, 16, 0), // 5 días en el futuro a las 16:00
      status: AppointmentStatus.PENDING,
      notes: 'Michi necesita revisión de su pelaje',
      petIndex: 3, // Michi - Persa
      serviceIndex: 3, // Consulta Veterinaria General
      customerIndex: 3, // owner de Michi
    },
    {
      date: generateFutureDate(7, 11, 0), // 7 días en el futuro a las 11:00
      status: AppointmentStatus.CONFIRMED,
      notes: 'Bella necesita tratamiento para ansiedad',
      petIndex: 4, // Bella - Beagle
      serviceIndex: 1, // Peluquería Canina Premium
      customerIndex: 4, // owner de Bella
    },
    {
      date: generatePastDate(2, 10, 0), // 2 días en el pasado a las 10:00 (para tener una cita COMPLETED)
      status: AppointmentStatus.COMPLETED,
      notes: 'Chequeo general de Coco, todo salió bien',
      petIndex: 5, // Coco - Cacatúa
      serviceIndex: 3, // Consulta Veterinaria General
      customerIndex: 0, // usar admin para permitir fecha pasada en seed
    },
    {
      date: generateFutureDate(10, 15, 0), // 10 días en el futuro a las 15:00
      status: AppointmentStatus.CANCELLED,
      notes: 'Cliente canceló por viaje',
      petIndex: 6, // Toby - Mini Lop
      serviceIndex: 0, // Peluquería Canina Básica
      customerIndex: 0, // owner de Toby (admin)
    },
  ],
};
