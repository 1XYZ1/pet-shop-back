import * as bcrypt from 'bcrypt';
import { ProductCategory, ServiceType, AppointmentStatus } from '../../common/enums';

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
  type: ValidTypes;
  category: ProductCategory;
}

type ValidSizes = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | '500g' | '1kg' | '3kg' | '7kg' | '15kg' | '20kg';
type ValidTypes = 'alimento-seco' | 'alimento-humedo' | 'snacks' | 'accesorios' | 'juguetes' | 'higiene';

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
  petName: string;
  petBreed?: string;
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
      type: 'alimento-seco',
      tags: ['perro', 'adulto', 'premium', 'raza-grande'],
      title: 'Alimento Premium Perro Adulto Raza Grande',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Alimento completo para cachorros de todas las razas. Alto contenido de proteínas y DHA para el desarrollo cerebral. Incluye calcio y fósforo en proporciones óptimas para el crecimiento de huesos y dientes.',
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
      stock: 38,
      price: 38.50,
      sizes: ['1kg', '3kg', '7kg', '15kg'],
      slug: 'alimento_cachorro_todas_razas',
      type: 'alimento-seco',
      tags: ['cachorro', 'perro', 'desarrollo', 'premium'],
      title: 'Alimento Cachorro Todas las Razas',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Collar ajustable de nylon resistente para perros. Hebilla de liberación rápida de seguridad. Disponible en varios colores vibrantes. Costuras reforzadas para mayor durabilidad. Reflectante para paseos nocturnos.',
      images: ['1741111-00-A_0_2000.jpg', '1741111-00-A_1.jpg'],
      stock: 50,
      price: 15.99,
      sizes: ['S', 'M', 'L', 'XL'],
      slug: 'collar_perro_nylon_ajustable',
      type: 'accesorios',
      tags: ['collar', 'perro', 'nylon', 'ajustable', 'reflectante'],
      title: 'Collar Ajustable Nylon para Perros',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Pelota lanzadora automática para perros. Sistema de lanzamiento ajustable hasta 9 metros. Funciona con pilas o adaptador AC. Incluye 3 pelotas de tenis. Ideal para perros activos que necesitan ejercicio.',
      images: ['1657932-00-A_0_2000.jpg', '1657932-00-A_1.jpg'],
      stock: 15,
      price: 85.00,
      sizes: ['M'],
      slug: 'pelota_lanzadora_automatica_perros',
      type: 'juguetes',
      tags: ['pelota', 'lanzador', 'perro', 'juguete', 'ejercicio'],
      title: 'Pelota Lanzadora Automática',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Shampoo hipoalergénico para perros con piel sensible. Fórmula suave con avena coloidal y aloe vera. Sin parabenos, sulfatos ni fragancias artificiales. pH balanceado. Ideal para perros con alergias o piel irritada.',
      images: ['1740417-00-A_0_2000.jpg', '1740417-00-A_1.jpg'],
      stock: 60,
      price: 16.50,
      sizes: ['M', 'L'],
      slug: 'shampoo_hipoalergenico_perros',
      type: 'higiene',
      tags: ['shampoo', 'hipoalergénico', 'perro', 'piel-sensible'],
      title: 'Shampoo Hipoalergénico para Perros',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Cama ortopédica de memory foam para perros. Alivia presión en articulaciones y músculos. Funda removible y lavable en máquina. Base antideslizante. Ideal para perros senior o con problemas articulares. Disponible en 3 tamaños.',
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
      stock: 25,
      price: 95.00,
      sizes: ['M', 'L', 'XL'],
      slug: 'cama_ortopedica_perro_memory_foam',
      type: 'accesorios',
      tags: ['cama', 'perro', 'ortopédica', 'memory-foam', 'senior'],
      title: 'Cama Ortopédica Memory Foam',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Premios dentales para perros con forma de hueso. Ayudan a reducir el sarro y mantener dientes limpios. Sabor menta fresca para aliento agradable. Textura masticable que fortalece encías. Sin colorantes artificiales.',
      images: ['8528839-00-A_0_2000.jpg', '8528839-00-A_2.jpg'],
      stock: 80,
      price: 12.99,
      sizes: ['S', 'M', 'L'],
      slug: 'premios_dentales_perro',
      type: 'snacks',
      tags: ['perro', 'dental', 'higiene', 'premios', 'snacks'],
      title: 'Premios Dentales para Perros',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Correa retráctil para perros hasta 25kg. Cable de 5 metros de largo. Sistema de frenado de un solo botón. Mango ergonómico antideslizante. Linterna LED integrada. Ideal para paseos y entrenamiento.',
      images: ['1740280-00-A_0_2000.jpg', '1740280-00-A_1.jpg'],
      stock: 35,
      price: 32.00,
      sizes: ['M', 'L'],
      slug: 'correa_retractil_perro_5m',
      type: 'accesorios',
      tags: ['correa', 'perro', 'retráctil', 'paseo', 'led'],
      title: 'Correa Retráctil 5 metros con LED',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Arnés acolchado para perros de pecho ajustable. Distribuye mejor la presión que un collar tradicional. Reflectante para paseos nocturnos. Cierre tipo chaleco, fácil de poner. Material transpirable.',
      images: ['1741416-00-A_0_2000.jpg', '1741416-00-A_1.jpg'],
      stock: 40,
      price: 28.50,
      sizes: ['S', 'M', 'L', 'XL'],
      slug: 'arnes_perro_acolchado_reflectante',
      type: 'accesorios',
      tags: ['arnés', 'perro', 'acolchado', 'reflectante', 'seguridad'],
      title: 'Arnés Acolchado Reflectante',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Huesos masticables naturales para perros. 100% carne deshidratada sin aditivos químicos. Ayudan a limpiar los dientes mientras mastican. Ricos en proteínas, perfectos para perros activos. Larga duración.',
      images: ['9877034-00-A_0_2000.jpg', '9877034-00-A_2.jpg'],
      stock: 65,
      price: 18.99,
      sizes: ['M', 'L', 'XL'],
      slug: 'huesos_masticables_naturales',
      type: 'snacks',
      tags: ['perro', 'hueso', 'natural', 'masticable', 'dental'],
      title: 'Huesos Masticables Naturales',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Lata de comida húmeda para perros adultos sabor pollo y verduras. 100% carne real sin subproductos. Alto contenido de humedad para una mejor hidratación. Sin conservantes artificiales ni colorantes. Pack x12 latas.',
      images: ['8764734-00-A_0_2000.jpg', '8764734-00-A_1.jpg'],
      stock: 120,
      price: 42.00,
      sizes: ['M'],
      slug: 'lata_perro_pollo_verduras_pack12',
      type: 'alimento-humedo',
      tags: ['perro', 'húmedo', 'pollo', 'lata', 'pack'],
      title: 'Pack x12 Latas Pollo y Verduras 375g',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Snacks suaves para cachorros en entrenamiento. Tamaño pequeño ideal para recompensar durante el adiestramiento. Sabor pollo y arroz, fáciles de digerir. Bajos en grasa. Bolsa resellable para mantener frescura.',
      images: ['1740245-00-A_0_2000.jpg', '1740245-00-A_1.jpg'],
      stock: 70,
      price: 14.50,
      sizes: ['S'],
      slug: 'snacks_entrenamiento_cachorros',
      type: 'snacks',
      tags: ['cachorro', 'perro', 'entrenamiento', 'premios', 'adiestramiento'],
      title: 'Snacks Entrenamiento para Cachorros',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Comedero elevado de acero inoxidable para perros. Base ajustable en altura (3 niveles). Reduce tensión en cuello y espalda. Fácil de limpiar, apto para lavavajillas. Incluye 2 platos removibles. Ideal para razas grandes.',
      images: ['1703767-00-A_0_2000.jpg', '1703767-00-A_1.jpg'],
      stock: 30,
      price: 48.00,
      sizes: ['M', 'L'],
      slug: 'comedero_elevado_acero_ajustable',
      type: 'accesorios',
      tags: ['comedero', 'acero', 'perro', 'elevado', 'ajustable'],
      title: 'Comedero Elevado Ajustable',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Cuerda de algodón trenzada para perros. Perfecta para juegos de tira y afloja. Ayuda a limpiar dientes y masajear encías. 100% algodón natural. Varios tamaños según el tamaño del perro. Nudos resistentes.',
      images: ['1700280-00-A_0_2000.jpg', '1700280-00-A_1.jpg'],
      stock: 55,
      price: 13.99,
      sizes: ['S', 'M', 'L'],
      slug: 'cuerda_algodon_trenzada',
      type: 'juguetes',
      tags: ['cuerda', 'algodón', 'perro', 'dental', 'juguete'],
      title: 'Cuerda Algodón Trenzada',
      category: ProductCategory.DOGS,
    },
    {
      description:
        'Transportadora rígida para perros pequeños y medianos. Cumple normativas de viaje aéreo IATA. Puerta de alambre con doble cerradura. Ventilación en los 4 lados. Asa superior reforzada y correa para hombro.',
      images: ['7654393-00-A_2_2000.jpg', '7654393-00-A_3.jpg'],
      stock: 20,
      price: 75.00,
      sizes: ['S', 'M', 'L'],
      slug: 'transportadora_rigida_perro_viaje',
      type: 'accesorios',
      tags: ['transportadora', 'viaje', 'perro', 'aéreo', 'iata'],
      title: 'Transportadora Rígida para Viaje',
      category: ProductCategory.DOGS,
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
      type: 'alimento-seco',
      tags: ['gato', 'adulto', 'premium', 'salud-urinaria'],
      title: 'Alimento Premium Gato Adulto',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Alimento especial para gatitos en crecimiento. Alto contenido proteico para el desarrollo muscular. Incluye DHA para el desarrollo cerebral y visual. Croquetas pequeñas adaptadas a mandíbulas de gatitos. Con vitaminas y minerales.',
      images: ['1549268-00-A_0_2000.jpg', '1549268-00-A_2.jpg'],
      stock: 42,
      price: 35.50,
      sizes: ['500g', '1kg', '3kg', '7kg'],
      slug: 'alimento_gatito_crecimiento',
      type: 'alimento-seco',
      tags: ['gatito', 'cachorro', 'gato', 'desarrollo', 'kitten'],
      title: 'Alimento Gatito en Crecimiento',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Arenero autolimpiable automático para gatos. Sistema de limpieza automática cada 30 minutos. Depósito de desechos sellado con control de olores. Compatible con arena aglomerante. Sensor de seguridad. Funciona con pilas o adaptador.',
      images: ['7652426-00-A_0_2000.jpg', '7652426-00-A_1.jpg'],
      stock: 12,
      price: 180.00,
      sizes: ['L'],
      slug: 'arenero_autolimpiable_automatico',
      type: 'accesorios',
      tags: ['arenero', 'gato', 'automático', 'autolimpiable', 'tecnología'],
      title: 'Arenero Autolimpiable Automático',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Ratón interactivo con sensor de movimiento para gatos. Se activa automáticamente cuando el gato se acerca. Movimientos erráticos que imitan presas reales. Estimula el instinto cazador. Funciona con 2 pilas AAA. Duradero y lavable.',
      images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
      stock: 35,
      price: 22.00,
      sizes: ['S'],
      slug: 'raton_interactivo_sensor',
      type: 'juguetes',
      tags: ['ratón', 'interactivo', 'gato', 'sensor', 'juguete'],
      title: 'Ratón Interactivo con Sensor',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Rascador torre con plataforma y hamaca para gatos. Poste cubierto de sisal natural. Base amplia y estable (60x40cm). Altura 120cm ideal para que el gato se estire completamente. Incluye juguete colgante con plumas. Fácil montaje.',
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
      stock: 18,
      price: 95.00,
      sizes: ['L'],
      slug: 'rascador_torre_hamaca_120cm',
      type: 'accesorios',
      tags: ['rascador', 'gato', 'torre', 'hamaca', 'sisal'],
      title: 'Rascador Torre con Hamaca 120cm',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Fuente de agua automática con filtro de carbón activado. Capacidad 2 litros. Sistema de circulación silencioso que mantiene el agua fresca y oxigenada. Alienta a los gatos a beber más agua. Fácil de limpiar, apto para lavavajillas.',
      images: ['1741111-00-A_0_2000.jpg', '1741111-00-A_1.jpg'],
      stock: 28,
      price: 45.00,
      sizes: ['M'],
      slug: 'fuente_agua_automatica_gatos',
      type: 'accesorios',
      tags: ['bebedero', 'fuente', 'gato', 'automático', 'filtro'],
      title: 'Fuente de Agua Automática',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Paté gourmet para gatos adultos sabor salmón. Textura suave y cremosa que los gatos adoran. Rico en omega 3 para pelaje brillante. Latas de fácil apertura, porción individual 85g. Pack x24 latas. Sin granos ni conservantes.',
      images: ['1657932-00-A_0_2000.jpg', '1657932-00-A_1.jpg'],
      stock: 90,
      price: 38.50,
      sizes: ['S'],
      slug: 'pate_gato_salmon_pack24',
      type: 'alimento-humedo',
      tags: ['gato', 'paté', 'salmón', 'gourmet', 'pack'],
      title: 'Pack x24 Paté Gato Salmón 85g',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Galletas crujientes para gatos sabor pollo. Snacks bajos en calorías perfectos para premiar. Con vitaminas y minerales esenciales. Ayudan a controlar las bolas de pelo. Textura crujiente que cuida los dientes. Bolsa resellable 200g.',
      images: ['1740417-00-A_0_2000.jpg', '1740417-00-A_1.jpg'],
      stock: 65,
      price: 9.99,
      sizes: ['M'],
      slug: 'galletas_gato_pollo',
      type: 'snacks',
      tags: ['gato', 'galletas', 'snacks', 'pollo', 'dental'],
      title: 'Galletas para Gatos Sabor Pollo',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Stick cremoso para gatos sabor atún y camarón. Textura cremosa que se puede dar directamente del sobre. Perfecto para crear vínculo con tu gato. Rico en taurina y vitamina E. Pack x40 sobres de 15g. Complemento alimenticio.',
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
      stock: 75,
      price: 28.00,
      sizes: ['S'],
      slug: 'stick_cremoso_gato_atun_pack40',
      type: 'snacks',
      tags: ['gato', 'stick', 'cremoso', 'atún', 'premio'],
      title: 'Pack x40 Stick Cremoso Atún',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Varita interactiva para gatos con plumas naturales. Caña flexible de 90cm con plumas de colores en el extremo. Estimula el ejercicio y el juego activo. Fortalece el vínculo con tu gato. Incluye 3 repuestos de plumas.',
      images: ['1740280-00-A_0_2000.jpg', '1740280-00-A_1.jpg'],
      stock: 48,
      price: 11.50,
      sizes: ['M'],
      slug: 'varita_interactiva_plumas',
      type: 'juguetes',
      tags: ['varita', 'interactivo', 'gato', 'plumas', 'ejercicio'],
      title: 'Varita Interactiva con Plumas',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Arenero cerrado para gatos con tapa y filtro de carbón. Reduce olores y evita que la arena se esparza. Puerta abatible para fácil acceso. Pala incluida. Fácil limpieza. Dimensiones 50x40x40cm. Apto para gatos hasta 8kg.',
      images: ['1741416-00-A_0_2000.jpg', '1741416-00-A_1.jpg'],
      stock: 32,
      price: 42.00,
      sizes: ['M', 'L'],
      slug: 'arenero_cerrado_filtro_carbon',
      type: 'accesorios',
      tags: ['arenero', 'gato', 'cerrado', 'filtro', 'control-olores'],
      title: 'Arenero Cerrado con Filtro',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Alimento para gatos senior mayores de 7 años. Fórmula especial para riñones y sistema urinario. Fácil digestión con proteínas de alta calidad. Incluye condroprotectores para articulaciones. Textura adaptada para dientes sensibles.',
      images: ['7654393-00-A_2_2000.jpg', '7654393-00-A_3.jpg'],
      stock: 30,
      price: 42.99,
      sizes: ['1kg', '3kg', '7kg'],
      slug: 'alimento_gato_senior',
      type: 'alimento-seco',
      tags: ['gato', 'senior', 'mayores', 'salud-renal', '+7'],
      title: 'Alimento Gato Senior +7 años',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Ratón de peluche relleno con catnip orgánico para gatos. Tamaño 8cm perfecto para cazar y transportar. Estimula el instinto de caza y el juego. Material suave y seguro, libre de tóxicos. Pack x3 ratones de colores variados.',
      images: ['1703767-00-A_0_2000.jpg', '1703767-00-A_1.jpg'],
      stock: 85,
      price: 7.50,
      sizes: ['S'],
      slug: 'raton_peluche_catnip_pack3',
      type: 'juguetes',
      tags: ['ratón', 'catnip', 'gato', 'peluche', 'pack'],
      title: 'Pack x3 Ratón Peluche con Catnip',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Comedero doble de cerámica para gatos. Diseño elevado de 5cm para mejor postura al comer. Platos separados para agua y comida. Base antideslizante de silicona. Apto para lavavajillas. Higiénico y fácil de limpiar. Diseño moderno.',
      images: ['1700280-00-A_0_2000.jpg', '1700280-00-A_1.jpg'],
      stock: 40,
      price: 32.00,
      sizes: ['M'],
      slug: 'comedero_doble_ceramica_elevado',
      type: 'accesorios',
      tags: ['comedero', 'cerámica', 'gato', 'elevado', 'doble'],
      title: 'Comedero Doble Cerámica Elevado',
      category: ProductCategory.CATS,
    },
    {
      description:
        'Cama tipo cueva para gatos. Material suave tipo felpa. Interior acolchado ultra confortable. Los gatos se sienten seguros y protegidos. Funda removible y lavable en máquina. Base antideslizante. Ideal para gatos que aman esconderse.',
      images: ['8528839-00-A_0_2000.jpg', '8528839-00-A_2.jpg'],
      stock: 25,
      price: 38.00,
      sizes: ['M'],
      slug: 'cama_cueva_gatos_felpa',
      type: 'accesorios',
      tags: ['cama', 'cueva', 'gato', 'felpa', 'confort'],
      title: 'Cama tipo Cueva para Gatos',
      category: ProductCategory.CATS,
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
      date: new Date('2025-11-05T10:00:00.000Z'),
      status: AppointmentStatus.CONFIRMED,
      notes: 'Primera vez que viene Max, es un poco nervioso con el agua',
      petName: 'Max',
      petBreed: 'Golden Retriever',
      serviceIndex: 0, // Peluquería Canina Básica
      customerIndex: 4, // Ana López
    },
    {
      date: new Date('2025-11-06T14:30:00.000Z'),
      status: AppointmentStatus.PENDING,
      notes: 'Luna necesita corte de uñas urgente',
      petName: 'Luna',
      petBreed: 'Persa',
      serviceIndex: 3, // Consulta Veterinaria General
      customerIndex: 5, // Juan Pérez
    },
    {
      date: new Date('2025-11-07T09:00:00.000Z'),
      status: AppointmentStatus.CONFIRMED,
      notes: 'Vacunación anual de Rocky',
      petName: 'Rocky',
      petBreed: 'Bulldog Francés',
      serviceIndex: 4, // Vacunación y Desparasitación
      customerIndex: 6, // Laura VIP
    },
    {
      date: new Date('2025-11-08T16:00:00.000Z'),
      status: AppointmentStatus.PENDING,
      petName: 'Miau',
      petBreed: 'Siamés',
      serviceIndex: 3, // Consulta Veterinaria General
      customerIndex: 4, // Ana López
    },
    {
      date: new Date('2025-11-10T11:00:00.000Z'),
      status: AppointmentStatus.CONFIRMED,
      notes: 'Thor necesita corte especial para competencia',
      petName: 'Thor',
      petBreed: 'Pastor Alemán',
      serviceIndex: 1, // Peluquería Canina Premium
      customerIndex: 6, // Laura VIP
    },
    {
      date: new Date('2025-11-12T10:00:00.000Z'),
      status: AppointmentStatus.COMPLETED,
      notes: 'Chequeo general de Coco, todo salió bien',
      petName: 'Coco',
      petBreed: 'Schnauzer',
      serviceIndex: 3, // Consulta Veterinaria General
      customerIndex: 5, // Juan Pérez
    },
    {
      date: new Date('2025-11-13T15:00:00.000Z'),
      status: AppointmentStatus.CANCELLED,
      notes: 'Cliente canceló por viaje',
      petName: 'Princesa',
      petBreed: 'Chihuahua',
      serviceIndex: 0, // Peluquería Canina Básica
      customerIndex: 4, // Ana López
    },
  ],
};
