import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import nodeCron from 'node-cron';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProd = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProd ? process.env.FRONTEND_URL : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // პატარა ჩეთი ;დ რომ render სერვერი არ გაგვეთიშოს
  nodeCron.schedule('*/14 * * * *', async () => {
    await fetch('https://segment-delta-system.onrender.com');
  });

  const port = process.env.PORT ?? 5000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();
