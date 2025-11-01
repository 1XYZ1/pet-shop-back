import * as bcrypt from 'bcrypt';

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
  gender: 'perro' | 'gato' | 'ave' | 'todos';
}

type ValidSizes = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | '500g' | '1kg' | '3kg' | '7kg' | '15kg' | '20kg';
type ValidTypes = 'alimento-seco' | 'alimento-humedo' | 'snacks' | 'accesorios' | 'juguetes' | 'higiene';

interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

interface SeedData {
  users: SeedUser[];
  products: SeedProduct[];
}

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
    // ALIMENTOS SECOS
    {
      description:
        'Alimento balanceado premium para perros adultos de razas grandes. Formulado con proteínas de alta calidad, vitaminas y minerales esenciales. Ayuda a mantener huesos y articulaciones fuertes. Rico en omega 3 y 6 para un pelaje brillante.',
      images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
      stock: 45,
      price: 68,
      sizes: ['3kg', '7kg', '15kg', '20kg'],
      slug: 'alimento_perro_adulto_raza_grande',
      type: 'alimento-seco',
      tags: ['perro', 'adulto', 'premium', 'raza-grande'],
      title: 'Alimento Perro Adulto Raza Grande',
      gender: 'perro',
    },
    {
      description:
        'Alimento completo para cachorros de todas las razas. Alto contenido de proteínas y DHA para el desarrollo cerebral. Incluye calcio y fósforo en proporciones óptimas para el crecimiento de huesos y dientes.',
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
      stock: 38,
      price: 72,
      sizes: ['1kg', '3kg', '7kg', '15kg'],
      slug: 'alimento_cachorro_todas_razas',
      type: 'alimento-seco',
      tags: ['cachorro', 'perro', 'desarrollo', 'premium'],
      title: 'Alimento Cachorro Todas las Razas',
      gender: 'perro',
    },
    {
      description:
        'Alimento balanceado para gatos adultos. Formulado con pollo y pescado como principales fuentes de proteína. Controla el pH urinario y previene la formación de cristales. Rico en taurina para la salud cardíaca y visual.',
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
      stock: 50,
      price: 55,
      sizes: ['1kg', '3kg', '7kg', '15kg'],
      slug: 'alimento_gato_adulto_premium',
      type: 'alimento-seco',
      tags: ['gato', 'adulto', 'premium', 'salud-urinaria'],
      title: 'Alimento Gato Adulto Premium',
      gender: 'gato',
    },
    {
      description:
        'Alimento especial para gatitos en crecimiento. Alto contenido proteico para el desarrollo muscular. Incluye DHA para el desarrollo cerebral y visual. Croquetas pequeñas adaptadas a mandíbulas de gatitos.',
      images: ['1740280-00-A_0_2000.jpg', '1740280-00-A_1.jpg'],
      stock: 42,
      price: 60,
      sizes: ['500g', '1kg', '3kg', '7kg'],
      slug: 'alimento_gatito_crecimiento',
      type: 'alimento-seco',
      tags: ['gatito', 'cachorro', 'gato', 'desarrollo'],
      title: 'Alimento Gatito en Crecimiento',
      gender: 'gato',
    },
    {
      description:
        'Alimento para perros adultos de razas pequeñas y medianas. Croquetas de tamaño reducido, fáciles de masticar. Ayuda a mantener el peso ideal. Con antioxidantes naturales para fortalecer el sistema inmunológico.',
      images: ['1741416-00-A_0_2000.jpg', '1741416-00-A_1.jpg'],
      stock: 48,
      price: 52,
      sizes: ['1kg', '3kg', '7kg', '15kg'],
      slug: 'alimento_perro_raza_pequena',
      type: 'alimento-seco',
      tags: ['perro', 'adulto', 'raza-pequeña', 'peso-ideal'],
      title: 'Alimento Perro Raza Pequeña',
      gender: 'perro',
    },
    {
      description:
        'Alimento light para perros con sobrepeso o baja actividad física. Bajo en grasas pero mantiene el sabor. Rico en fibra para generar saciedad. Ayuda a mantener la masa muscular mientras reduce grasa corporal.',
      images: ['7654393-00-A_2_2000.jpg', '7654393-00-A_3.jpg'],
      stock: 35,
      price: 58,
      sizes: ['3kg', '7kg', '15kg'],
      slug: 'alimento_perro_light_control_peso',
      type: 'alimento-seco',
      tags: ['perro', 'light', 'control-peso', 'bajo-grasa'],
      title: 'Alimento Perro Light Control Peso',
      gender: 'perro',
    },
    {
      description:
        'Alimento para gatos senior mayores de 7 años. Fórmula especial para riñones y sistema urinario. Fácil digestión con proteínas de alta calidad. Incluye condroprotectores para articulaciones.',
      images: ['1703767-00-A_0_2000.jpg', '1703767-00-A_1.jpg'],
      stock: 30,
      price: 62,
      sizes: ['1kg', '3kg', '7kg'],
      slug: 'alimento_gato_senior',
      type: 'alimento-seco',
      tags: ['gato', 'senior', 'mayores', 'salud-renal'],
      title: 'Alimento Gato Senior +7 años',
      gender: 'gato',
    },
    {
      description:
        'Alimento hipoalergénico para perros con sensibilidad digestiva. Elaborado con una única fuente de proteína animal. Sin cereales, gluten ni colorantes artificiales. Ideal para perros con alergias alimentarias.',
      images: ['1700280-00-A_0_2000.jpg', '1700280-00-A_1.jpg'],
      stock: 28,
      price: 85,
      sizes: ['3kg', '7kg', '15kg'],
      slug: 'alimento_perro_hipoalergenico',
      type: 'alimento-seco',
      tags: ['perro', 'hipoalergénico', 'sin-cereales', 'alergias'],
      title: 'Alimento Perro Hipoalergénico',
      gender: 'perro',
    },

    // ALIMENTOS HÚMEDOS Y SNACKS
    {
      description:
        'Lata de comida húmeda para perros adultos sabor pollo y verduras. 100% carne real sin subproductos. Alto contenido de humedad para una mejor hidratación. Sin conservantes artificiales ni colorantes.',
      images: ['8764734-00-A_0_2000.jpg', '8764734-00-A_1.jpg'],
      stock: 120,
      price: 8,
      sizes: ['M'],
      slug: 'lata_perro_pollo_verduras',
      type: 'alimento-humedo',
      tags: ['perro', 'húmedo', 'pollo', 'lata'],
      title: 'Lata Perro Pollo y Verduras 375g',
      gender: 'perro',
    },
    {
      description:
        'Paté gourmet para gatos adultos sabor salmón. Textura suave y cremosa que los gatos adoran. Rico en omega 3 para pelaje brillante. Latas de fácil apertura, porción individual.',
      images: ['7652426-00-A_0_2000.jpg', '7652426-00-A_1.jpg'],
      stock: 150,
      price: 6,
      sizes: ['S'],
      slug: 'pate_gato_salmon',
      type: 'alimento-humedo',
      tags: ['gato', 'paté', 'salmón', 'gourmet'],
      title: 'Paté Gato Salmón 85g',
      gender: 'gato',
    },
    {
      description:
        'Premios dentales para perros con forma de hueso. Ayudan a reducir el sarro y mantener dientes limpios. Sabor menta fresca para aliento agradable. Ideal para perros de todos los tamaños.',
      images: ['8528839-00-A_0_2000.jpg', '8528839-00-A_2.jpg'],
      stock: 80,
      price: 15,
      sizes: ['S', 'M', 'L'],
      slug: 'premios_dentales_perro',
      type: 'snacks',
      tags: ['perro', 'dental', 'higiene', 'premios'],
      title: 'Premios Dentales para Perros',
      gender: 'perro',
    },
    {
      description:
        'Galletas crujientes para gatos sabor pollo. Snacks bajos en calorías perfectos para premiar. Con vitaminas y minerales esenciales. Ayudan a controlar las bolas de pelo.',
      images: ['1549268-00-A_0_2000.jpg', '1549268-00-A_2.jpg'],
      stock: 95,
      price: 12,
      sizes: ['M'],
      slug: 'galletas_gato_pollo',
      type: 'snacks',
      tags: ['gato', 'galletas', 'snacks', 'pollo'],
      title: 'Galletas para Gatos Sabor Pollo',
      gender: 'gato',
    },
    {
      description:
        'Huesos masticables naturales para perros. 100% carne deshidratada sin aditivos químicos. Ayudan a limpiar los dientes mientras mastican. Ricos en proteínas, perfectos para perros activos.',
      images: ['9877034-00-A_0_2000.jpg', '9877034-00-A_2.jpg'],
      stock: 65,
      price: 22,
      sizes: ['M', 'L', 'XL'],
      slug: 'huesos_masticables_naturales',
      type: 'snacks',
      tags: ['perro', 'hueso', 'natural', 'masticable'],
      title: 'Huesos Masticables Naturales',
      gender: 'perro',
    },
    {
      description:
        'Snacks suaves para cachorros en entrenamiento. Tamaño pequeño ideal para recompensar durante el adiestramiento. Sabor pollo y arroz, fáciles de digerir. Bajos en grasa.',
      images: ['1740245-00-A_0_2000.jpg', '1740245-00-A_1.jpg'],
      stock: 70,
      price: 18,
      sizes: ['S'],
      slug: 'snacks_entrenamiento_cachorros',
      type: 'snacks',
      tags: ['cachorro', 'perro', 'entrenamiento', 'premios'],
      title: 'Snacks para Entrenamiento Cachorros',
      gender: 'perro',
    },
    {
      description:
        'Stick cremoso para gatos sabor atún. Textura cremosa que se puede dar directamente del sobre. Perfecto para crear vínculo con tu gato. Rico en taurina y vitamina E.',
      images: ['1740051-00-A_0_2000.jpg', '1740051-00-A_1.jpg'],
      stock: 110,
      price: 10,
      sizes: ['S'],
      slug: 'stick_cremoso_gato_atun',
      type: 'snacks',
      tags: ['gato', 'stick', 'cremoso', 'atún'],
      title: 'Stick Cremoso Gato Atún Pack x4',
      gender: 'gato',
    },

    // ACCESORIOS
    {
      description:
        'Collar ajustable de nylon resistente para perros. Hebilla de liberación rápida de seguridad. Disponible en varios colores vibrantes. Costuras reforzadas para mayor durabilidad.',
      images: ['1741111-00-A_0_2000.jpg', '1741111-00-A_1.jpg'],
      stock: 50,
      price: 18,
      sizes: ['S', 'M', 'L', 'XL'],
      slug: 'collar_perro_nylon_ajustable',
      type: 'accesorios',
      tags: ['collar', 'perro', 'nylon', 'ajustable'],
      title: 'Collar Perro Nylon Ajustable',
      gender: 'perro',
    },
    {
      description:
        'Correa retráctil para perros hasta 25kg. Cable de 5 metros de largo. Sistema de frenado de un solo botón. Mango ergonómico antideslizante. Ideal para paseos y entrenamiento.',
      images: ['1657932-00-A_0_2000.jpg', '1657932-00-A_1.jpg'],
      stock: 35,
      price: 45,
      sizes: ['M', 'L'],
      slug: 'correa_retractil_perro_5m',
      type: 'accesorios',
      tags: ['correa', 'perro', 'retráctil', 'paseo'],
      title: 'Correa Retráctil Perro 5 metros',
      gender: 'perro',
    },
    {
      description:
        'Arnés acolchado para perros de pecho ajustable. Distribuye mejor la presión que un collar tradicional. Reflectante para paseos nocturnos. Cierre tipo chaleco, fácil de poner.',
      images: ['1740417-00-A_0_2000.jpg', '1740417-00-A_1.jpg'],
      stock: 40,
      price: 35,
      sizes: ['S', 'M', 'L', 'XL'],
      slug: 'arnes_perro_acolchado_reflectante',
      type: 'accesorios',
      tags: ['arnés', 'perro', 'acolchado', 'reflectante'],
      title: 'Arnés Perro Acolchado Reflectante',
      gender: 'perro',
    },
    {
      description:
        'Comedero de acero inoxidable para perros y gatos. Base antideslizante de goma. Fácil de limpiar, apto para lavavajillas. Higiénico y resistente a óxido. Varios tamaños disponibles.',
      images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
      stock: 60,
      price: 25,
      sizes: ['S', 'M', 'L'],
      slug: 'comedero_acero_inoxidable',
      type: 'accesorios',
      tags: ['comedero', 'acero', 'perro', 'gato'],
      title: 'Comedero Acero Inoxidable',
      gender: 'todos',
    },
    {
      description:
        'Bebedero automático con sistema de gravedad. Mantiene el agua fresca constantemente. Capacidad de 3.8 litros, ideal para varios días. Fácil de rellenar y limpiar. Perfecto para gatos y perros pequeños.',
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
      stock: 32,
      price: 38,
      sizes: ['M'],
      slug: 'bebedero_automatico_gravedad',
      type: 'accesorios',
      tags: ['bebedero', 'automático', 'perro', 'gato'],
      title: 'Bebedero Automático Gravedad 3.8L',
      gender: 'todos',
    },
    {
      description:
        'Cama ortopédica de memory foam para perros. Alivia presión en articulaciones y músculos. Funda removible y lavable. Base antideslizante. Ideal para perros senior o con problemas articulares.',
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
      stock: 25,
      price: 85,
      sizes: ['M', 'L', 'XL'],
      slug: 'cama_ortopedica_perro_memory_foam',
      type: 'accesorios',
      tags: ['cama', 'perro', 'ortopédica', 'memory-foam'],
      title: 'Cama Ortopédica Memory Foam',
      gender: 'perro',
    },
    {
      description:
        'Transportadora rígida para gatos y perros pequeños. Cumple normativas de viaje aéreo. Puerta de alambre con doble cerradura. Ventilación en los 4 lados. Asa superior reforzada.',
      images: ['1740280-00-A_0_2000.jpg', '1740280-00-A_1.jpg'],
      stock: 20,
      price: 95,
      sizes: ['S', 'M', 'L'],
      slug: 'transportadora_rigida_viaje',
      type: 'accesorios',
      tags: ['transportadora', 'viaje', 'gato', 'perro'],
      title: 'Transportadora Rígida para Viaje',
      gender: 'todos',
    },
    {
      description:
        'Placa identificadora grabable de acero inoxidable. Incluye grabado personalizado gratuito. Resistente a la corrosión. Varios diseños disponibles: hueso, círculo, corazón. Incluye argolla de sujeción.',
      images: ['1741416-00-A_0_2000.jpg', '1741416-00-A_1.jpg'],
      stock: 100,
      price: 12,
      sizes: ['S'],
      slug: 'placa_identificadora_grabable',
      type: 'accesorios',
      tags: ['placa', 'identificación', 'grabado', 'perro', 'gato'],
      title: 'Placa Identificadora Grabable',
      gender: 'todos',
    },
    {
      description:
        'Rascador vertical para gatos con plataforma superior. Poste cubierto de sisal natural. Base amplia y estable. Altura ideal para que el gato se estire completamente. Incluye juguete colgante.',
      images: ['7654393-00-A_2_2000.jpg', '7654393-00-A_3.jpg'],
      stock: 28,
      price: 65,
      sizes: ['M', 'L'],
      slug: 'rascador_vertical_gato_sisal',
      type: 'accesorios',
      tags: ['rascador', 'gato', 'sisal', 'plataforma'],
      title: 'Rascador Vertical con Plataforma',
      gender: 'gato',
    },
    {
      description:
        'Arenero cerrado para gatos con tapa y filtro de carbón. Reduce olores y evita que la arena se esparza. Puerta abatible para fácil acceso. Pala incluida. Fácil limpieza.',
      images: ['1703767-00-A_0_2000.jpg', '1703767-00-A_1.jpg'],
      stock: 30,
      price: 55,
      sizes: ['M', 'L'],
      slug: 'arenero_cerrado_filtro_carbon',
      type: 'accesorios',
      tags: ['arenero', 'gato', 'cerrado', 'filtro'],
      title: 'Arenero Cerrado con Filtro',
      gender: 'gato',
    },

    // JUGUETES
    {
      description:
        'Pelota de goma resistente para perros. Material no tóxico, ideal para masticar. Diseño con textura para limpieza dental. Rebota de forma impredecible para mayor diversión. Resistente a mordidas.',
      images: ['1700280-00-A_0_2000.jpg', '1700280-00-A_1.jpg'],
      stock: 75,
      price: 15,
      sizes: ['S', 'M', 'L'],
      slug: 'pelota_goma_resistente_perro',
      type: 'juguetes',
      tags: ['pelota', 'goma', 'perro', 'masticable'],
      title: 'Pelota de Goma Resistente',
      gender: 'perro',
    },
    {
      description:
        'Cuerda de algodón trenzada para perros. Perfecta para juegos de tira y afloja. Ayuda a limpiar dientes y masajear encías. 100% algodón natural. Varios tamaños según el tamaño del perro.',
      images: ['8764734-00-A_0_2000.jpg', '8764734-00-A_1.jpg'],
      stock: 55,
      price: 18,
      sizes: ['S', 'M', 'L'],
      slug: 'cuerda_algodon_trenzada',
      type: 'juguetes',
      tags: ['cuerda', 'algodón', 'perro', 'dental'],
      title: 'Cuerda Algodón Trenzada',
      gender: 'perro',
    },
    {
      description:
        'Ratón de peluche con catnip para gatos. Relleno de hierba gatera natural que atrae a los gatos. Tamaño perfecto para cazar y transportar. Estimula el instinto de caza. Material suave y seguro.',
      images: ['7652426-00-A_0_2000.jpg', '7652426-00-A_1.jpg'],
      stock: 85,
      price: 8,
      sizes: ['S'],
      slug: 'raton_peluche_catnip',
      type: 'juguetes',
      tags: ['ratón', 'catnip', 'gato', 'peluche'],
      title: 'Ratón de Peluche con Catnip',
      gender: 'gato',
    },
    {
      description:
        'Varita interactiva para gatos con plumas. Caña flexible con plumas de colores en el extremo. Estimula el ejercicio y el juego activo. Fortalece el vínculo con tu gato. Horas de diversión garantizadas.',
      images: ['8528839-00-A_0_2000.jpg', '8528839-00-A_2.jpg'],
      stock: 60,
      price: 12,
      sizes: ['M'],
      slug: 'varita_interactiva_plumas',
      type: 'juguetes',
      tags: ['varita', 'interactivo', 'gato', 'plumas'],
      title: 'Varita Interactiva con Plumas',
      gender: 'gato',
    },

    // HIGIENE
    {
      description:
        'Shampoo antipulgas y garrapatas para perros. Fórmula suave con ingredientes naturales. Elimina pulgas, garrapatas y sus huevos. Aroma agradable a lavanda. No irrita la piel. pH balanceado.',
      images: ['1549268-00-A_0_2000.jpg', '1549268-00-A_2.jpg'],
      stock: 45,
      price: 28,
      sizes: ['M', 'L'],
      slug: 'shampoo_antipulgas_perro',
      type: 'higiene',
      tags: ['shampoo', 'antipulgas', 'perro', 'higiene'],
      title: 'Shampoo Antipulgas para Perros',
      gender: 'perro',
    },
    {
      description:
        'Cepillo para pelaje largo de gatos y perros. Cerdas suaves que eliminan pelo muerto sin dañar la piel. Mango ergonómico antideslizante. Reduce la formación de nudos. Ideal para razas de pelo largo.',
      images: ['9877034-00-A_0_2000.jpg', '9877034-00-A_2.jpg'],
      stock: 50,
      price: 22,
      sizes: ['M'],
      slug: 'cepillo_pelaje_largo',
      type: 'higiene',
      tags: ['cepillo', 'pelaje', 'perro', 'gato'],
      title: 'Cepillo para Pelaje Largo',
      gender: 'todos',
    },
  ],
};
