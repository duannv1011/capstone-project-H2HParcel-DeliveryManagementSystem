import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { join } from 'path';

export const mailerConfig: MailerOptions = {
    transport: {
        host: 'smtp.gmail.com',
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: 'nickmois59so21@gmail.com',
            pass: 'zyweohhrgvdelbtu',
        },
        defaults: {
            from: '"No Reply" <nickmois59so21@gmail.com>',
        },
        template: {
            dir: join(__dirname, '/src/teamplate/email'),
            adapter: new HandlebarsAdapter(),
            options: {
                strict: true,
            },
        },
    },
};
