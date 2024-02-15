import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
const { DataSource } = Packages.typeorm;
import { CoreSymbols } from '@CoreSymbols';
import { AbstractConnector } from './abstract.connector';

import {
  Typeorm,
  Voidable,
  IDiscoveryService,
  ILoggerService,
  ITypeormConnector,
  NLoggerService,
  NTypeormConnector,
} from '@Core/Types';

@injectable()
export class TypeormConnector extends AbstractConnector implements ITypeormConnector {
  private _connection: Typeorm.DataSource | undefined;
  private _config: NTypeormConnector.Config | undefined;
  private _entities: Map<string, Typeorm.EntitySchema<unknown>> | undefined;
  private _repositories: Map<string, Typeorm.Repository<unknown>>;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService
  ) {
    super();

    this._repositories = new Map<string, Typeorm.Repository<unknown>>();
  }

  private _setConfig(): void {
    this._config = {
      enable: this._discoveryService.getBoolean('connectors.typeorm.enable', false),
      type: this._discoveryService.getString(
        'connectors.typeorm.connect.dbType',
        'postgres'
      ) as NTypeormConnector.DatabaseType,
      protocol: this._discoveryService.getString('connectors.typeorm.connect.protocol', 'http'),
      host: this._discoveryService.getString('connectors.typeorm.connect.host', 'localhost'),
      port: this._discoveryService.getNumber('connectors.typeorm.connect.port', 5432),
      username: this._discoveryService.getString('connectors.typeorm.auth.username', 'postgres'),
      password: this._discoveryService.getString('connectors.typeorm.auth.password', 'postgres'),
      database: this._discoveryService.getString('connectors.typeorm.connect.database', ''),
      schema: this._discoveryService.getString('connectors.typeorm.connect.schema', 'public'),
    };
  }

  public async start(): Promise<void> {
    this._setConfig();

    if (!this._config) {
      throw new Error('Config is not set');
    }

    if (!this._config.enable) {
      this._loggerService.warn('Typeorm connector is disabled', {
        tag: 'Connection',
        scope: 'Core',
        namespace: 'TypeormConnector',
      });
      return;
    }

    this._emitter.on(
      'connector:TypeormConnector:entities:load',
      (entities: Map<string, Typeorm.EntitySchema<unknown>>) => {
        this._entities = entities;
      }
    );
    this._emitter.emit('connector:TypeormConnector:start');

    if (!this._entities) {
      throw new Error('Entities is not set');
    }

    const logOptions: NLoggerService.CoreWarnOptions = {
      namespace: 'TypeormConnector',
      scope: 'Core',
    };
    if (this._entities.size > 0) {
      this._loggerService.system('Typeorm entities successful loaded.', logOptions);
    } else {
      this._loggerService.warn('Typeorm entities list is empty.', logOptions);
    }

    try {
      const { type, protocol, host, port, database, password, username, schema } = this._config;
      const options: Typeorm.DataSourceOptions = {
        type: type,
        host: host,
        port: port,
        database: database,
        username: username,
        password: password,
        useUTC: true,
        entities: Array.from(this._entities.values()),
        schema: schema,
        synchronize: true,
      };
      this._connection = new DataSource(options);

      await this._connection.initialize();

      for (const [name, entity] of this._entities) {
        this._repositories.set(name, this._connection.getRepository(entity));
      }

      this._loggerService.system(
        `Typeorm connector with type "${type}" has been started on ${protocol}://${host}:${port}.`,
        {
          tag: 'Connection',
          scope: 'Core',
          namespace: 'TypeormConnector',
        }
      );
    } catch (e) {
      throw e;
    }
  }

  public async stop(): Promise<void> {
    this._config = undefined;

    if (!this._connection) return;
    await this.connection.destroy();
    this._connection = undefined;

    this._emitter.removeAllListeners();

    this._loggerService.system(`Typeorm connector has been stopped.`, {
      tag: 'Connection',
      scope: 'Core',
      namespace: 'TypeormConnector',
    });
  }

  public getRepository<T>(name: string): Typeorm.Repository<T> {
    const repository = this._repositories.get(name);
    if (!repository) {
      throw new Error(`Repository "${name}" not found`);
    }

    return repository as Typeorm.Repository<T>;
  }

  public emit<T>(event: NTypeormConnector.Events, data?: Voidable<T>): void {
    this._emitter.emit(event, data);
  }

  public on(event: NTypeormConnector.Events, listener: () => void): void {
    this._emitter.on(event, listener);
  }

  public get connection(): Typeorm.DataSource {
    if (!this._connection) {
      throw new Error('Connection is not set');
    }

    return this._connection;
  }
}
