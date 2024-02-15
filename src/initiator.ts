import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;

import { CoreSymbols } from '@CoreSymbols';
import {
  IInitiator,
  IIntegrationConnector,
  IMongodbConnector,
  IRedisConnector,
  IComputeConnector,
  ITypeormConnector,
} from '@Core/Types';

@injectable()
export class Initiator implements IInitiator {
  constructor(
    @inject(CoreSymbols.ServiceConnector)
    private readonly _serviceConnector: IComputeConnector,
    @inject(CoreSymbols.MongodbConnector)
    private readonly _mongodbConnector: IMongodbConnector,
    @inject(CoreSymbols.TypeormConnector)
    private readonly _typeormConnector: ITypeormConnector,
    @inject(CoreSymbols.RedisConnector)
    private readonly _redisConnector: IRedisConnector,
    @inject(CoreSymbols.IntegrationConnector)
    private readonly _integrationConnector: IIntegrationConnector
  ) {}

  public async start(): Promise<void> {
    await this._serviceConnector.start();
    await this._mongodbConnector.start();
    await this._typeormConnector.start();
    await this._redisConnector.start();
    await this._integrationConnector.start();
  }
  public async stop(): Promise<void> {
    await this._integrationConnector.stop();
    await this._redisConnector.stop();
    await this._typeormConnector.stop();
    await this._mongodbConnector.stop();
    await this._serviceConnector.stop();
  }
}
