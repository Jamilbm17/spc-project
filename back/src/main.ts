import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import * as fs from 'node:fs';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const uploadsDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    app.setGlobalPrefix('api');

    await app.listen(3001);
    console.log('SPC Backend running on http://localhost:3001/api');
}
bootstrap();
