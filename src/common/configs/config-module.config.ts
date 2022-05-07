import * as Joi from 'joi';

import { ConfigModuleOptions } from '@nestjs/config';

export const getConfigModuleOptions = (): ConfigModuleOptions => ({
  isGlobal: true,
  cache: true,
  expandVariables: true,
  validationSchema: Joi.object({
    SERVER_PORT: Joi.number().default(3111),
    SERVER_HOST: Joi.string().default('0.0.0.0'),

    CLIENT_ID: Joi.string().required(),
    SERVER_ID: Joi.string().required(),
  }),
});
