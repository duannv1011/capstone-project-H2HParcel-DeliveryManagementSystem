import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExceptionsLoggerFilter } from './utils/exceptions-logger-filter/exceptions-logger-filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('delevery service')
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
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(3000);
}
bootstrap();
