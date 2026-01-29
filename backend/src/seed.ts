// Dữ liệu mồi để seed database
//  chạy npx ts-node src/seed.ts để thiết lập sinh data và kết nối với db
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OrderMongoRepository } from './modules/ordering/infrastructure/persistence/order.repo.mongo';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const orderRepo = app.get(OrderMongoRepository);
  
  console.log('🌱 Seeding database...');

  try {
    const createdOrder = await orderRepo.create({
      customerId: 'user-123',
      restaurantId: 'rest-456',
      totalAmount: 150000,
      status: 'PENDING',
      items: ['Pizza', 'Coke']
    });
    
    console.log('✅ Order created successfully:', createdOrder);
    console.log('🚀 Database "food_delivery" should now appear in MongoDB Compass!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
