import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import nodeCron from 'node-cron';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // პატარა ჩეთი ;დ რომ render სერვერი არ გაგვეთიშოს
  nodeCron.schedule('*/14 * * * *', async () => {
    await fetch('https://segment-delta-system.onrender.com');
  });

  await app.listen(3001, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
