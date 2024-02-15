import { IAbstractConnector } from './abstract.connector';
import { IoRedis } from '../packages/packages';

export interface IRedisConnector extends IAbstractConnector {
  readonly connection: IoRedis.IoRedis;
}

export namespace NRedisConnector {
  export type Config = {
    enable: boolean;
    protocol: string;
    host: string;
    port: number;
    options: {
      retryTimeout: number;
      retryCount: number;
      storageMode: string;
      enableAutoPipelining: boolean;
      maxRetriesPerRequest: number;
      showFriendlyErrorStack: boolean;
    };
  };
}
