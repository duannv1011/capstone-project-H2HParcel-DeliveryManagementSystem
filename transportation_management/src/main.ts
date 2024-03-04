import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExceptionsLoggerFilter } from './utils/exceptions-logger-filter/exceptions-logger-filter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';

async function bootstrap() {
<<<<<<< HEAD
    const app = await NestFactory.create(AppModule, {
        bodyParser: true,
    });
    const configService = app.get<ConfigService>(ConfigService);
    app.use(bodyParser.json({ limit: configService.get('BODY_LIMIT') }));
    app.use(bodyParser.urlencoded({ limit: configService.get('BODY_LIMIT'), extended: true }));
    app.enableCors({
        // origin: ['http://localhost:888'], // client
        // true for all origins
        origin: '*',
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('delevery service')
=======
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('delevery service hehehe')
>>>>>>> 9c52719 (test cicd)
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
        .addTag('Delevery System Api')
        .build();
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsLoggerFilter(httpAdapter));
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPrefix = 'api';
    SwaggerModule.setup(swaggerPrefix, app, document);

    await app.listen(configService.get('SERVER_PORT'), () => {
        Logger.log(`Listening api at http://${configService.get('SERVER_DOMAIN')}:${configService.get('SERVER_PORT')}`);
        Logger.log(
            `View swagger at http://${configService.get('SERVER_DOMAIN')}:${configService.get('SERVER_PORT')}/${swaggerPrefix}`,
        );
    });
}
bootstrap();
