import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
async function bootstrap() {
    dotenv.config({ path: __dirname + '/.env' });
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('H2H Transportation System ')
        .setDescription('The description of the method')
        .setVersion('1.0')
        //.addBasicAuth()
        .addBearerAuth(
            {
                type: 'http', // Type of authentication (http, apiKey, oauth2)
                scheme: 'bearer', // Bearer token scheme
                bearerFormat: 'JWT', // Format of the bearer token (e.g., JWT)
                in: 'header', // Where the token is expected to be found (header, query, cookie)
                name: 'Authorization', // Name of the header, query parameter, or cookie where the token is passed
            },
            'JWT-auth', // Security scheme name (must match the one used with @ApiBearerAuth decorator)
        )
        .addTag('Delievery System Api')
        .build();

    app.enableCors();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(3000);
}

bootstrap();
