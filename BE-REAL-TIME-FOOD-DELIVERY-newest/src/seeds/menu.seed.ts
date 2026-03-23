import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MenuCategory } from '../entities/menu-category.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { MenuItemImage } from '../entities/menu-item-image.entity';

/* ------------------------------------------------------------------ */
/*  Real, distinct Unsplash photo IDs mapped to each menu item        */
/* ------------------------------------------------------------------ */
const ITEM_PHOTO_IDS: Record<string, string> = {
  // Pizza
  'Seafood Deluxe Pizza':          'photo-1565299624946-b28f40a0ae38',
  'Pepperoni Pizza':               'photo-1628840042765-356cda07504e',

  // Burger
  'Classic Beef Burger':           'photo-1568901346375-23c9450c58cd',
  'Cheese Burger':                 'photo-1586190848861-99aa4a171e90',

  // Fried Chicken
  'Crispy Fried Chicken (2 pcs)':  'photo-1626082927389-6cd097cdc6ec',
  'Spicy Fried Chicken (4 pcs)':   'photo-1562967914-608f82629710',

  // Pasta
  'Spaghetti Bolognese':           'photo-1621996346565-e3dbc646d9a9',
  'Creamy Mushroom Pasta':         'photo-1645112411341-6c4fd023714a',

  // Rice Meals
  'Teriyaki Chicken Rice':         'photo-1546069901-ba9599a7e63c',
  'Beef Stir-fry Rice':            'photo-1603133872878-684f208fb84b',

  // Sides
  'French Fries':                  'photo-1573080496219-bb080dd4f877',
  'Fried Sausage':                 'photo-1612871689353-cef9b1961d8f',

  // Drinks
  'Coca Cola Can':                 'photo-1554866585-cd94860890b7',
  'Lemon Iced Tea':                'photo-1556679343-c7306c1976bc',

  // Milk Tea
  'Classic Milk Tea':              'photo-1558857563-b371033873b8',
  'Matcha Milk Tea':               'photo-1515823064-d6e0c04616a7',

  // Desserts
  'Tiramisu':                      'photo-1571877227200-a0d98ea607e9',
  'Caramel Pudding':               'photo-1488477181946-6428a0291777',

  // Combo
  'Pizza + Drink Combo':           'photo-1513104890138-7c749659a591',
  'Burger + Fries + Drink Combo':  'photo-1550547660-d9450f859349',
};

/** Build a thumbnail + full-size image pair from a real Unsplash photo ID */
const buildImagePair = (itemName: string) => {
  const photoId = ITEM_PHOTO_IDS[itemName];
  if (!photoId) throw new Error(`Missing Unsplash photo ID for: ${itemName}`);
  return [
    {
      imageUrl: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=400&q=75`,
      isThumbnail: true,
      sortOrder: 0,
    },
    {
      imageUrl: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=75`,
      isThumbnail: false,
      sortOrder: 1,
    },
  ];
};

@Injectable()
export class MenuSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MenuSeedService.name);

  constructor(
    @InjectRepository(MenuCategory)
    private readonly categoryRepository: Repository<MenuCategory>,

    @InjectRepository(MenuItem)
    private readonly itemRepository: Repository<MenuItem>,

    @InjectRepository(MenuItemImage)
    private readonly itemImageRepository: Repository<MenuItemImage>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Skip menu seed in production.');
      return;
    }

    const categoryCount = await this.categoryRepository.count();
    const itemCount = await this.itemRepository.count();

    if (categoryCount > 0 || itemCount > 0) {
      this.logger.log('Menu seed skipped because data already exists.');
      return;
    }

    this.logger.log('Start seeding menu data...');

    const categoryPayloads = [
      {
        name: 'Pizza',
        description: 'Freshly baked pizza favorites',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Burger',
        description: 'Classic burgers and cheeseburgers',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Fried Chicken',
        description: 'Crispy fried chicken meals',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Pasta',
        description: 'Comforting pasta dishes',
        sortOrder: 4,
        isActive: true,
      },
      {
        name: 'Rice Meals',
        description: 'Rice bowls and set meals',
        sortOrder: 5,
        isActive: true,
      },
      {
        name: 'Sides',
        description: 'Snacks and side dishes',
        sortOrder: 6,
        isActive: true,
      },
      {
        name: 'Drinks',
        description: 'Cold drinks and soft beverages',
        sortOrder: 7,
        isActive: true,
      },
      {
        name: 'Milk Tea',
        description: 'Milk tea and tea-based drinks',
        sortOrder: 8,
        isActive: true,
      },
      {
        name: 'Desserts',
        description: 'Sweet treats and desserts',
        sortOrder: 9,
        isActive: true,
      },
      {
        name: 'Combo',
        description: 'Value combo meals',
        sortOrder: 10,
        isActive: true,
      },
    ];

    const savedCategories = await this.categoryRepository.save(
      categoryPayloads.map((payload) => this.categoryRepository.create(payload)),
    );

    const categoryMap = new Map<string, MenuCategory>();
    for (const category of savedCategories) {
      categoryMap.set(category.name, category);
    }

    const itemPayloads: Array<{
      categoryName: string;
      name: string;
      description: string;
      price: number;
      isAvailable: boolean;
      isActive: boolean;
      sortOrder: number;
      images: Array<{
        imageUrl: string;
        isThumbnail: boolean;
        sortOrder: number;
      }>;
    }> = [
      {
        categoryName: 'Pizza',
        name: 'Seafood Deluxe Pizza',
        description: 'Shrimp, squid, and mozzarella on a crispy crust',
        price: 199000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Seafood Deluxe Pizza'),
      },
      {
        categoryName: 'Pizza',
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with rich tomato sauce',
        price: 179000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Pepperoni Pizza'),
      },
      {
        categoryName: 'Burger',
        name: 'Classic Beef Burger',
        description: 'Grilled beef patty with lettuce and tomato',
        price: 159000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Classic Beef Burger'),
      },
      {
        categoryName: 'Burger',
        name: 'Cheese Burger',
        description: 'Juicy burger layered with cheddar cheese',
        price: 169000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Cheese Burger'),
      },
      {
        categoryName: 'Fried Chicken',
        name: 'Crispy Fried Chicken (2 pcs)',
        description: 'Golden fried chicken with a crunchy coating',
        price: 69000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Crispy Fried Chicken (2 pcs)'),
      },
      {
        categoryName: 'Fried Chicken',
        name: 'Spicy Fried Chicken (4 pcs)',
        description: 'Spicy fried chicken for sharing',
        price: 129000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Spicy Fried Chicken (4 pcs)'),
      },
      {
        categoryName: 'Pasta',
        name: 'Spaghetti Bolognese',
        description: 'Pasta with slow-cooked beef ragu',
        price: 99000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Spaghetti Bolognese'),
      },
      {
        categoryName: 'Pasta',
        name: 'Creamy Mushroom Pasta',
        description: 'Rich cream sauce with mushrooms',
        price: 109000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Creamy Mushroom Pasta'),
      },
      {
        categoryName: 'Rice Meals',
        name: 'Teriyaki Chicken Rice',
        description: 'Grilled chicken with sweet teriyaki glaze',
        price: 89000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Teriyaki Chicken Rice'),
      },
      {
        categoryName: 'Rice Meals',
        name: 'Beef Stir-fry Rice',
        description: 'Stir-fried beef with vegetables over rice',
        price: 95000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Beef Stir-fry Rice'),
      },
      {
        categoryName: 'Sides',
        name: 'French Fries',
        description: 'Crispy golden fries with a light salt',
        price: 39000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('French Fries'),
      },
      {
        categoryName: 'Sides',
        name: 'Fried Sausage',
        description: 'Savory fried sausage bites',
        price: 49000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Fried Sausage'),
      },
      {
        categoryName: 'Drinks',
        name: 'Coca Cola Can',
        description: 'Chilled soda for extra refreshment',
        price: 18000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Coca Cola Can'),
      },
      {
        categoryName: 'Drinks',
        name: 'Lemon Iced Tea',
        description: 'Refreshing tea with lemon',
        price: 18000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Lemon Iced Tea'),
      },
      {
        categoryName: 'Milk Tea',
        name: 'Classic Milk Tea',
        description: 'Creamy black tea with milk',
        price: 45000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Classic Milk Tea'),
      },
      {
        categoryName: 'Milk Tea',
        name: 'Matcha Milk Tea',
        description: 'Matcha tea blended with milk',
        price: 55000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Matcha Milk Tea'),
      },
      {
        categoryName: 'Desserts',
        name: 'Tiramisu',
        description: 'Classic Italian coffee dessert',
        price: 52000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Tiramisu'),
      },
      {
        categoryName: 'Desserts',
        name: 'Caramel Pudding',
        description: 'Silky caramel custard',
        price: 32000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Caramel Pudding'),
      },
      {
        categoryName: 'Combo',
        name: 'Pizza + Drink Combo',
        description: 'Personal pizza with a canned drink',
        price: 219000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair('Pizza + Drink Combo'),
      },
      {
        categoryName: 'Combo',
        name: 'Burger + Fries + Drink Combo',
        description: 'Burger, fries, and a cold drink',
        price: 159000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair('Burger + Fries + Drink Combo'),
      },
    ];

    for (const payload of itemPayloads) {
      const category = categoryMap.get(payload.categoryName);

      if (!category) {
        this.logger.warn(`Category not found for item: ${payload.name}`);
        continue;
      }

      const createdItem = this.itemRepository.create({
        categoryId: category.id,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        isAvailable: payload.isAvailable,
        isActive: payload.isActive,
        sortOrder: payload.sortOrder,
      });

      const savedItem = await this.itemRepository.save(createdItem);

      const itemImages = payload.images.map((image) =>
        this.itemImageRepository.create({
          menuItemId: savedItem.id,
          imageUrl: image.imageUrl,
          isThumbnail: image.isThumbnail,
          sortOrder: image.sortOrder,
        }),
      );

      await this.itemImageRepository.save(itemImages);
    }

    this.logger.log('Seeding menu completed: 10 categories and 20 items created.');
  }
}
