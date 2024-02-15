import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
const { ioredis } = Packages.ioredis;
import { AbstractConnector } from './abstract.connector';
import { CoreSymbols } from '@CoreSymbols';

import {IoRedis, IDiscoveryService, ILoggerService, IRedisConnector, NRedisConnector } from '@Core/Types';

@injectable()
export class RedisConnector extends AbstractConnector implements IRedisConnector {
  private _config: NRedisConnector.Config | undefined;
  private _connection: IoRedis.IoRedis | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService
  ) {
    super();
  }

  private _setConfig(): void {
    this._config = {
      enable: this._discoveryService.getBoolean('connectors.redis.enable', false),
      protocol: this._discoveryService.getString('connectors.redis.connect.protocol', 'redis'),
      host: this._discoveryService.getString('connectors.redis.connect.host', 'localhost'),
      port: this._discoveryService.getNumber('connectors.redis.connect.port', 6379),
      options: {
        retryTimeout: this._discoveryService.getNumber(
          'connectors.redis.options.retryTimeout',
          10000
        ),
        retryCount: this._discoveryService.getNumber('connectors.redis.options.retryCount', 5),
        storageMode: this._discoveryService.getString(
          'connectors.redis.options.storageMode',
          'standalone'
        ),
        enableAutoPipelining: this._discoveryService.getBoolean(
          'connectors.redis.options.enableAutoPipelining',
          true
        ),
        maxRetriesPerRequest: this._discoveryService.getNumber(
          'connectors.redis.options.maxRetriesPerRequest',
          10
        ),
        showFriendlyErrorStack: this._discoveryService.getBoolean(
          'connectors.redis.options.showFriendlyErrorStack',
          false
        ),
      },
    };
  }

  public async start(): Promise<void> {
    this._setConfig();

    if (!this._config) {
      throw new Error('Config is not set');
    }

    if (!this._config.enable) {
      this._loggerService.warn('Redis connector is disabled.', {
        tag: 'Connection',
        scope: 'Core',
        namespace: 'RedisConnector',
      });
      return;
    }

    const { protocol, host, port, options } = this._config;
    const url = `${protocol}://${host}:${port}`;

    const redisOptions: IoRedis.IoRedisOptions = {
      host: host,
      port: port,
      showFriendlyErrorStack: options.showFriendlyErrorStack,
      enableAutoPipelining: options.enableAutoPipelining,
      maxRetriesPerRequest: options.maxRetriesPerRequest,
      retryStrategy: () => options.retryTimeout,
    };

    try {
      this._connection = new ioredis(url, redisOptions);

      this._loggerService.system(`Redis connector has been started on ${url}.`, {
        tag: 'Connection',
        scope: 'Core',
        namespace: 'RedisConnector',
      });
    } catch (e) {
      throw e;
    }
  }

  public async stop(): Promise<void> {
    if (!this._connection) return;

    this._connection.disconnect();
    this._connection = undefined;
    this._config = undefined;
    this._emitter.removeAllListeners();

    this._loggerService.system(`Redis connector has been stopped.`, {
      tag: 'Connection',
      scope: 'Core',
      namespace: 'RedisConnector',
    });
  }

  public get connection(): IoRedis.IoRedis {
    if (!this._connection) {
      throw new Error('Redis connection is not set');
    }

    return this._connection;
  }
}
