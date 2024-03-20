import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('POSTGRES_HOST'),
                port: configService.get('POSTGRES_PORT'),
                username: configService.get('POSTGRES_USER'),
                password: configService.get('POSTGRES_PASSWORD'),
                database: configService.get('POSTGRES_DB'),
                // Update database structure (warning: will restructure database)
                synchronize: true,
                autoLoadEntities: true,
                schema: configService.get('POSTGRES_SCHEMA'),
                logging: false,
                // Drops the schema each time connection is being established (dangerous: will reset database)
                //dropSchema: configService.get('POSTGRES_DROPSCHEMA'),
                // Number of reconnect attempts
                retryAttempts: 3,
                // Time to try reconnecting (seconds)
                retryDelay: 1,
                entities: ['dist/entities/*.entity.js'],
                charset: 'utf8mb4',
                collation: 'utf8mb4',
            }),
        }),
    ],
})
export class DatabaseModule {}
