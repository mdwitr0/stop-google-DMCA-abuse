import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

(async () => {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('MAIN');

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
  });

  await app
    .listen(configService.get('SERVER_PORT'), configService.get('SERVER_HOST'))
    .then(() => {
      logger.verbose(`
      ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
         Env: ${configService.get('APP_ENV')}
         HTTP interface listen port ${configService.get('SERVER_PORT')}
      ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
      `);
    })
    .catch((e) => {
      logger.error(e);
    });
})();
