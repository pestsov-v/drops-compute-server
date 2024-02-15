import { Packages } from "@Packages";
const { injectable, inject } = Packages.inversify;
import { CoreSymbols } from "@CoreSymbols";
import { AbstractConnector } from "./abstract.connector";

import {
  IContextService,
  IDiscoveryService,
  ILocalizationService,
  ILoggerService,
  ISchemaService,
  IScramblerService,
  IComputeConnector,
  ISessionService,
  ISpecificationService,
  IAbstractService,
} from "@Core/Types";

@injectable()
export class ComputeConnector
  extends AbstractConnector
  implements IComputeConnector
{
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.SchemaService)
    private readonly _schemaService: ISchemaService,
    @inject(CoreSymbols.GetawayService)
    private readonly _getawayService: IAbstractService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService,
    @inject(CoreSymbols.SessionService)
    private readonly _sessionService: ISessionService,
    @inject(CoreSymbols.LocalizationService)
    private readonly _localizationService: ILocalizationService,
    @inject(CoreSymbols.SpecificationService)
    private readonly _specificationService: ISpecificationService
  ) {
    super();
  }

  public async start(): Promise<void> {
    await this._discoveryService.start();
    await this._loggerService.start();
    await this._contextService.start();
    await this._scramblerService.start();
    await this._localizationService.start();
    await this._schemaService.start();
    await this._getawayService.start();
    await this._sessionService.start();
    await this._specificationService.start();
  }
  public async stop(): Promise<void> {
    await this._specificationService.stop();
    await this._sessionService.stop();
    await this._getawayService.stop();
    await this._schemaService.stop();
    await this._localizationService.stop();
    await this._scramblerService.stop();
    await this._contextService.stop();
    await this._loggerService.stop();
    await this._discoveryService.stop();
  }
}
