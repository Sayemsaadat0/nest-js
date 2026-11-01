import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // as we dont want that the api starts with the route name, but the route gets the prefix api, so the route will be like this : http://localhost:3000/api/route-name, we can also handle versioning of this api by adding the version number in the prefix like this : app.setGlobalPrefix('api/v1');, so the route will be like this : http://localhost:3000/api/v1/route-name

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
