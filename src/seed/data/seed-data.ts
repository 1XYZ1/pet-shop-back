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
  gender: 'men' | 'women' | 'kid' | 'unisex';
}

type ValidSizes = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
type ValidTypes = 'shirts' | 'pants' | 'hoodies' | 'hats';

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
      fullName: 'Pet Shop Admin',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['admin'],
    },
    {
      email: 'user@petshop.com',
      fullName: 'Pet Shop User',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user', 'super'],
    },
  ],

  products: [
    {
      description:
        'Show your love for pets with this comfortable Pet Lover Crew Neck Sweatshirt. Features a premium, heavyweight exterior and soft fleece interior for comfort in any season. The sweatshirt features a cute paw print logo on the chest. Made from 60% cotton and 40% recycled polyester.',
      images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
      stock: 15,
      price: 45,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      slug: 'pet_lover_crew_neck_sweatshirt',
      type: 'shirts',
      tags: ['sweatshirt', 'pet', 'comfort'],
      title: 'Pet Lover Crew Neck Sweatshirt',
      gender: 'unisex',
    },
    {
      description:
        'Perfect for dog walks in cold weather, this Dog Walker Quilted Jacket features a uniquely fit, quilted design for warmth and mobility. With an overall practical aesthetic, the jacket features subtle pet-themed embroidery and custom zipper pulls. Made from 87% nylon and 13% polyurethane.',
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
      stock: 8,
      price: 85,
      sizes: ['XS', 'S', 'M', 'XL', 'XXL'],
      slug: 'dog_walker_quilted_jacket',
      type: 'shirts',
      tags: ['jacket', 'outdoor', 'dog'],
      title: 'Dog Walker Quilted Jacket',
      gender: 'unisex',
    },
    {
      description:
        'Introducing the Pet Care Collection. The Veterinarian Lightweight Zip Up has a premium, modern silhouette made from a sustainable bamboo cotton blend for versatility during long work days. Features subtle pet clinic logos and a concealed chest pocket with custom zipper pulls. Made from 70% bamboo and 30% cotton.',
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
      stock: 12,
      price: 75,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      slug: 'veterinarian_lightweight_zip_jacket',
      type: 'shirts',
      tags: ['professional', 'vet', 'medical'],
      title: 'Veterinarian Lightweight Zip Jacket',
      gender: 'unisex',
    },
    {
      description:
        'Designed for pet enthusiasts, the Cat Lover Long Sleeve Tee features a subtle, water-based cat silhouette on the left chest and cute paw prints below the back collar. The lightweight material is double-dyed, creating a soft, casual style for ideal wear in any season. Made from 50% cotton and 50% polyester.',
      images: ['1740280-00-A_0_2000.jpg', '1740280-00-A_1.jpg'],
      stock: 25,
      price: 32,
      sizes: ['XS', 'S', 'M', 'L'],
      slug: 'cat_lover_long_sleeve_tee',
      type: 'shirts',
      tags: ['cat', 'casual', 'comfort'],
      title: 'Cat Lover Long Sleeve Tee',
      gender: 'unisex',
    },
    {
      description:
        'Perfect for dog park visits, the Dog Mom Short Sleeve Tee features a cute dog bone graphic across the chest and paw print pattern below the back collar. The lightweight material is double-dyed, creating a soft, casual style for ideal wear in any season. Made from 50% cotton and 50% polyester.',
      images: ['1741416-00-A_0_2000.jpg', '1741416-00-A_1.jpg'],
      stock: 30,
      price: 28,
      sizes: ['M', 'L', 'XL', 'XXL'],
      slug: 'dog_mom_short_sleeve_tee',
      type: 'shirts',
      tags: ['dog', 'mom', 'casual'],
      title: 'Dog Mom Short Sleeve Tee',
      gender: 'women',
    },
    {
      description:
        'Designed for comfort during pet training sessions, the Pet Trainer Tee is made from 100% cotton and features our signature whistle icon on the back.',
      images: ['7654393-00-A_2_2000.jpg', '7654393-00-A_3.jpg'],
      stock: 18,
      price: 25,
      sizes: ['M', 'L', 'XL', 'XXL'],
      slug: 'pet_trainer_tee',
      type: 'shirts',
      tags: ['training', 'professional'],
      title: 'Pet Trainer Tee',
      gender: 'unisex',
    },
    {
      description:
        'Show your commitment to animal rescue with this meaningful tee. Designed for fit, comfort and style, the tee features a heart with paw prints design on the front with our signature rescue logo on the back. Made from 100% organic cotton.',
      images: ['1703767-00-A_0_2000.jpg', '1703767-00-A_1.jpg'],
      stock: 22,
      price: 30,
      sizes: ['S', 'M', 'L', 'XL'],
      slug: 'animal_rescue_tee',
      type: 'shirts',
      tags: ['rescue', 'charity', 'heart'],
      title: 'Animal Rescue Tee',
      gender: 'unisex',
    },
    {
      description:
        'Celebrate the joy pets bring to our lives with this uplifting tee. Designed for fit, comfort and style, the tee features a rainbow with pet silhouettes graphic along with our Pet Shop wordmark on the front. Made from 100% organic cotton.',
      images: ['1700280-00-A_0_2000.jpg', '1700280-00-A_1.jpg'],
      stock: 20,
      price: 30,
      sizes: ['XS', 'S', 'XL', 'XXL'],
      slug: 'pets_bring_joy_tee',
      type: 'shirts',
      tags: ['joy', 'rainbow', 'pets'],
      title: 'Pets Bring Joy Tee',
      gender: 'unisex',
    },
    {
      description:
        'Designed for fit, comfort and style, the Pet Shop Large Logo Tee is made from 100% organic cotton with a 3D silicone-printed Pet Shop wordmark printed across the chest.',
      images: ['8764734-00-A_0_2000.jpg', '8764734-00-A_1.jpg'],
      stock: 15,
      price: 28,
      sizes: ['XS', 'S', 'M'],
      slug: 'pet_shop_large_logo_tee',
      type: 'shirts',
      tags: ['logo', 'brand'],
      title: 'Pet Shop Large Logo Tee',
      gender: 'unisex',
    },
    {
      description:
        'Designed for fit, comfort and style, the Pet Paw Logo Tee is made from 100% organic cotton and features a silicone-printed paw logo on the left chest.',
      images: ['7652426-00-A_0_2000.jpg', '7652426-00-A_1.jpg'],
      stock: 12,
      price: 25,
      sizes: ['XS', 'S'],
      slug: 'pet_paw_logo_tee',
      type: 'shirts',
      tags: ['paw', 'simple'],
      title: 'Pet Paw Logo Tee',
      gender: 'unisex',
    },
    {
      description:
        'Designed for comfort and style in any size, the Pet Shop Small Logo Tee is made from 100% organic cotton and features a 3D silicone-printed wordmark on the left chest.',
      images: ['8528839-00-A_0_2000.jpg', '8528839-00-A_2.jpg'],
      stock: 10,
      price: 25,
      sizes: ['XS', 'S', 'M'],
      slug: 'pet_shop_small_logo_tee',
      type: 'shirts',
      tags: ['logo', 'subtle'],
      title: 'Pet Shop Small Logo Tee',
      gender: 'unisex',
    },
    {
      description:
        "Designed to celebrate the special bond between pets and their owners, the Best Friend Mode Tee features great fit, comfort and style. Made from 100% cotton, it's perfect for any pet lover.",
      images: ['1549268-00-A_0_2000.jpg', '1549268-00-A_2.jpg'],
      stock: 35,
      price: 28,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      slug: 'best_friend_mode_tee',
      type: 'shirts',
      tags: ['friendship', 'bond'],
      title: 'Best Friend Mode Tee',
      gender: 'unisex',
    },
    {
      description:
        "Inspired by the energy pets bring to our homes, the Pet Energy Tee is made from 100% cotton and features the phrase 'Pure Love' under our signature paw logo in the back. Designed for fit, comfort and style, the exclusive tee celebrates the joy of pet ownership.",
      images: ['9877034-00-A_0_2000.jpg', '9877034-00-A_2.jpg'],
      stock: 18,
      price: 30,
      sizes: ['XL', 'XXL'],
      slug: 'pet_energy_tee',
      type: 'shirts',
      tags: ['energy', 'love'],
      title: 'Pet Energy Tee',
      gender: 'unisex',
    },
    {
      description:
        'Introducing the Pet Care Collection. The Pet Groomer Lightweight Hoodie has a premium, relaxed silhouette made from a sustainable bamboo cotton blend. The hoodie features subtle pet grooming tool logos across the chest and on the sleeve with a french terry interior for versatility during work. Made from 70% bamboo and 30% cotton.',
      images: ['1740245-00-A_0_2000.jpg', '1740245-00-A_1.jpg'],
      stock: 14,
      price: 65,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      slug: 'pet_groomer_lightweight_hoodie',
      type: 'hoodies',
      tags: ['hoodie', 'professional', 'grooming'],
      title: 'Pet Groomer Lightweight Hoodie',
      gender: 'unisex',
    },
    {
      description:
        'Introducing the Pet Comfort Collection. The Pet Lover Pullover Hoodie has a premium, heavyweight exterior and soft fleece interior for comfort in any season. The unisex hoodie features subtle pet-themed logos across the chest and on the sleeve, a double layer hood and pockets with custom zipper pulls. Made from 60% cotton and 40% recycled polyester.',
      images: ['1740051-00-A_0_2000.jpg', '1740051-00-A_1.jpg'],
      stock: 16,
      price: 70,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      slug: 'pet_lover_pullover_hoodie',
      type: 'hoodies',
      tags: ['hoodie', 'comfort'],
      title: 'Pet Lover Pullover Hoodie',
      gender: 'unisex',
    },
    {
      description:
        'Perfect for pet owners who love outdoor activities. The Dog Walker Full Zip Hoodie has a premium, heavyweight exterior and soft fleece interior for comfort during long walks. The hoodie features subtle dog-themed logos on the left chest and sleeve, a double layer hood and pockets with custom zipper pulls. Made from 60% cotton and 40% recycled polyester.',
      images: ['1741111-00-A_0_2000.jpg', '1741111-00-A_1.jpg'],
      stock: 20,
      price: 55,
      sizes: ['XS', 'L', 'XL', 'XXL'],
      slug: 'dog_walker_full_zip_hoodie',
      type: 'hoodies',
      tags: ['hoodie', 'outdoor', 'dog'],
      title: 'Dog Walker Full Zip Hoodie',
      gender: 'unisex',
    },
    {
      description:
        'The Pet Lover Hat is a classic silhouette combined with modern details, featuring a 3D paw logo and a custom metal buckle closure. The ultrasoft design is flexible and abrasion resistant, while the inner sweatband includes quilted padding for extra comfort and moisture wicking. The visor is fully made from recycled plastic bottles. 100% Cotton.',
      images: ['1657932-00-A_0_2000.jpg', '1657932-00-A_1.jpg'],
      stock: 25,
      price: 22,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      slug: 'pet_lover_hat',
      type: 'hats',
      tags: ['hat', 'paw', 'outdoor'],
      title: 'Pet Lover Hat',
      gender: 'unisex',
    },
    {
      description:
        'Stay warm during those early morning dog walks with the Pet Owner Thermal Beanie. Features our signature pet shop logo and is made from premium thermal materials for maximum warmth and comfort.',
      images: ['1740417-00-A_0_2000.jpg', '1740417-00-A_1.jpg'],
      stock: 30,
      price: 18,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      slug: 'pet_owner_thermal_beanie',
      type: 'hats',
      tags: ['beanie', 'thermal', 'winter'],
      title: 'Pet Owner Thermal Beanie',
      gender: 'unisex',
    },
  ],
};
