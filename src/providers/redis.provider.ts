import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
import { CoreSymbols } from '@CoreSymbols';

import { Guards } from '@Guards';
import { Nullable, UnknownObject, IRedisConnector, IRedisProvider } from '@Core/Types';

@injectable()
export class RedisProvider implements IRedisProvider {
  constructor(
    @inject(CoreSymbols.RedisConnector)
    private readonly _redisConnector: IRedisConnector
  ) {}

  public async setWithExpire<T extends UnknownObject>(
    id: string,
    info: T,
    ttl: number
  ): Promise<void> {
    const { connection } = this._redisConnector;
    try {
      await connection.hset(id, info);
      await connection.expire(id, ttl);
    } catch (e) {
      throw e;
    }
  }

  public async setItemInfo<T extends UnknownObject>(id: string, data: T): Promise<void> {
    const record: Record<string, string> = {};
    try {
      for (const [name, value] of Object.entries(data)) {
        if (typeof value === 'object') {
          record[name] = JSON.stringify(value);
        } else {
          if (Guards.isString(value)) {
            record[name] = value;
          }
        }
      }
      await this._redisConnector.connection.hset(id, record);
    } catch (e) {
      throw e;
    }
  }

  public async getItemInfo<T extends UnknownObject>(id: string): Promise<Nullable<T>> {
    const item: T = {} as T;

    try {
      const record = await this._redisConnector.connection.hgetall(id);

      for (const [name, value] of Object.entries(record)) {
        try {
          item[name as keyof T] = JSON.parse(value);
        } catch (e) {
          item[name as keyof T] = value as T[keyof T];
        }
      }

      return Object.keys(item).length > 0 ? (item as T) : null;
    } catch (e) {
      throw e;
    }
  }

  public async getItemByUserId<
    T extends { connectionId: string } = { connectionId: string }
  >(id: string): Promise<T> {
    const ids = await this._redisConnector.connection.keys(id);
    const sessionInfo = await this.getItemInfo<T>(ids[0]);
    if (!sessionInfo) {
      throw new Error('Session info not found');
    }
    return sessionInfo;
  }

  public async getItemCount(id: string): Promise<number> {
    const items = await this._redisConnector.connection.keys(`${id}:*`);
    return items.length;
  }

  public async updateItemField<T extends UnknownObject>(
    id: string,
    field: keyof T,
    value: T[keyof T]
  ): Promise<void> {
    try {
      await this._redisConnector.connection.hmset(id, { [field]: value });
    } catch (e) {
      throw e;
    }
  }

  public async setItemField<T extends UnknownObject>(
    id: string,
    field: keyof T,
    value: T[keyof T]
  ): Promise<void> {
    try {
      await this._redisConnector.connection.hset(id, { [field]: value });
    } catch (e) {
      throw e;
    }
  }

  public async deleteItem(id: string): Promise<void> {
    try {
      await this._redisConnector.connection.del(id);
    } catch (e) {
      throw e;
    }
  }
}
