import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
import { CoreSymbols } from '@CoreSymbols';
import { AbstractFactory } from './abstract.factory';

import {
  IAbstractFactory,
  IAbstractFrameworkAdapter,
  IAbstractWebsocketAdapter,
  IDiscoveryService,
  NSchemaLoader,
} from '@Core/Types';

@injectable()
export class FrameworkFactory extends AbstractFactory implements IAbstractFactory {
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.FastifyAdapter)
    private readonly _fastifyAdapter: IAbstractFrameworkAdapter,
    @inject(CoreSymbols.WsAdapter)
    private readonly _wsAdapter: IAbstractWebsocketAdapter
  ) {
    super();
  }

  public async run<T>(schema: T): Promise<void> {
    const httpAdapter = this._discoveryService.getString('adapters.framework.kind', 'fastify');
    switch (httpAdapter) {
      case 'fastify':
        await this._fastifyAdapter.start(schema as NSchemaLoader.Services);
        break;
      case 'express':
        throw new Error('Adapter not implemented');
      default:
        throw new Error(`Http adapter "${httpAdapter}" not found`);
    }

    const wsAdapter = this._discoveryService.getString('adapters.websocket.kind', 'ws');
    switch (wsAdapter) {
      case 'ws':
        await this._wsAdapter.start();
        break;
      default:
        throw new Error(`Ws adapter "${wsAdapter}" not found`);
    }
  }

  public async stand(): Promise<void> {
    const adapter = this._discoveryService.getString('adapters.framework.kind', 'fastify');
    switch (adapter) {
      case 'fastify':
        await this._fastifyAdapter.stop();
        break;
      case 'express':
        throw new Error('Adapter not implemented');
      default:
        throw new Error(`Adapter "${adapter}" not found`);
    }
  }
}
