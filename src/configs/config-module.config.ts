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
    CLIENT_SECRET: Joi.string().required(),
    HOST_URL: Joi.string().required(),

    DATABASE_URL: Joi.string().required(),

    LEGAL_EMAIL_ADDRESS: 'sc-noreply@google.com',

    COUNTRY_NAME: Joi.string().required(),
    FULL_NAME: Joi.string().required(),
    YOUR_TITLE: Joi.string().required(),
    COMPANY_NAME: Joi.string(),
    CONTACT_EMAIL_NOPREFILL: Joi.string().required(),
    ADDRESS: Joi.string().required(),
    PHONE: Joi.string().required(),
    REASON: Joi.string().required(),
    DMCA_CLARIFICATIONS: Joi.string().required(),
    SIGNATURE: Joi.string().required(),
  }),
});
