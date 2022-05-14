import { URL, URLSearchParams } from 'url';

import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  return {
    uri: getMongoUri(configService),
    ...getMongoOptions(),
  };
};

const getMongoUri = (configService: ConfigService): string => {
  if (configService.get('MONGO_URI')) return configService.get('MONGO_URI');

  const uri = new URL('fish://example.org');
  const params = new URLSearchParams(
    new Map(
      Object.entries({
        authSource: configService.get('MONGO_AUTHSOURCE'),
      }),
    ),
  );

  uri.port = configService.get('MONGO_PORT');
  uri.protocol = configService.get('MONGO_USE_SSL') ? 'mongodb+srv' : 'mongodb';
  uri.host = configService.get('MONGO_HOST') || '0.0.0.0';
  uri.password = configService.get('MONGO_PASS') || '';
  uri.username = configService.get('MONGO_USER') || '';
  uri.pathname = configService.get('MONGO_DB_NAME') || '';
  uri.search = params.toString();

  return uri.toString();
};

const getMongoOptions = () => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
