import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
import { CoreSymbols } from '@CoreSymbols';
import { AbstractService } from './abstract.service';

import type {
  IAbstractFactory,
  IDiscoveryService,
  ILoggerService,
  ISchemaService,
} from '@Core/Types';

@injectable()
export class GetawayService extends AbstractService {
  protected readonly _SERVICE_NAME = GetawayService.name;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SchemaService)
    protected readonly _schemaService: ISchemaService,
    @inject(CoreSymbols.FrameworkFactory)
    private readonly _frameworkFactory: IAbstractFactory
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    await this._frameworkFactory.run(this._schemaService.schema);

    return true;
  }

  protected async destroy(): Promise<void> {
    return void 0;
  }
}
