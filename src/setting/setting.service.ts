import { Injectable, Logger } from '@nestjs/common';

import { DateTime } from 'luxon';
import { PrismaService } from 'src/prisma/prisma.service';
import { Setting } from '@prisma/client';

@Injectable()
export class SettingService {
  private logger = new Logger(SettingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async set(
    key: string,
    value: string,
    expire: {
      second?: number;
      date?: number;
    },
  ): Promise<{ status: string }> {
    try {
      this.logger.debug(`Set key: ${key}`);
      const updateData: any = {
        value: value,
      };

      if (expire.second) {
        const currentDate = DateTime.now();
        updateData.expireAt = currentDate
          .plus({ second: expire.second })
          .toString();
      } else {
        updateData.expireAt = new Date(expire.date);
      }

      await this.prisma.setting.upsert({
        where: { key },
        update: updateData,
        create: { ...updateData, key },
      });

      return { status: 'success' };
    } catch (error) {
      this.logger.debug(`Error setting key: ${key}`);
      this.logger.debug(`Value: ${value}`);
      this.logger.error(error);

      throw new Error(error);
    }
  }

  async get(key: string): Promise<Setting> {
    try {
      this.logger.debug(`Get key: ${key}`);

      const result = await this.prisma.setting.findUnique({
        where: { key },
      });

      return result;
    } catch (error) {
      this.logger.debug(`Error getting key: ${key}`);
      this.logger.error(error);

      throw new Error(error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.logger.debug(`Delete key: ${key}`);

      await this.prisma.setting.delete({ where: { key } });
    } catch (error) {
      this.logger.debug(`Error deleted key: ${key}`);
      this.logger.error(error);

      throw new Error(error);
    }
  }
}
