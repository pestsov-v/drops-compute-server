import { Packages } from "@Packages";
const { injectable, inject } = Packages.inversify;

import { CoreSymbols } from "@CoreSymbols";
import { container } from "../ioc/core.ioc";
import { AbstractService } from "./abstract.service";

import {
  IDiscoveryService,
  IDocumentationLoader,
  ILoggerService,
  IMongodbConnector,
  ISchemaLoader,
  ISchemaService,
  ITypeormConnector,
  NAbstractService,
  NDocumentationLoader,
  NSchemaLoader,
  NSchemaService,
  NSpecificationLoader,
  ServiceStructure,
} from "@Core/Types";
import { SCHEMA_SERVICES } from "@common";

@injectable()
export class SchemaService extends AbstractService implements ISchemaService {
  protected readonly _SERVICE_NAME: NSchemaService.ServiceName =
    "SchemaService";
  private _config: NSchemaService.Config | undefined;
  private _wsListenersStorage: NSchemaLoader.Services | undefined;
  private _specifications: NSpecificationLoader.Services | undefined;
  private _schema: NSchemaLoader.Services | undefined;
  private _typeormSchemas: NSchemaLoader.TypeormEntities | undefined;
  private _docsSchema: NDocumentationLoader.Services | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.MongodbConnector)
    private readonly _mongodbConnector: IMongodbConnector,
    @inject(CoreSymbols.TypeormConnector)
    private readonly _typeormConnector: ITypeormConnector,
    @inject(CoreSymbols.SchemaLoader)
    private readonly _schemaLoader: ISchemaLoader
  ) {
    super();
  }

  public get specifications(): NSpecificationLoader.Services {
    if (!this._specifications) {
      throw new Error("Specification storage is empty");
    }

    return this._specifications;
  }

  public get wsListeners(): NSchemaLoader.Services {
    if (!this._wsListenersStorage) {
      throw new Error("Ws listeners not set");
    }

    return this._wsListenersStorage;
  }

  public get schema(): NSchemaLoader.Services {
    if (!this._schema) {
      throw new Error("Collection schema not initialize or empty.");
    }

    return this._schema;
  }

  public get typeormSchemas(): NSchemaLoader.TypeormEntities {
    if (!this._typeormSchemas) {
      throw new Error("Typeorm schemas not initialize or empty.");
    }

    return this._typeormSchemas;
  }

  protected async init(): Promise<boolean> {
    this._setConfig();
    this._discoveryService.on("service:DiscoveryService:reload", () => {
      this._setConfig();
    });

    if (!this._config) {
      console.log(`Config for ${this._SERVICE_NAME} not initialize`);
      return false;
    }
    try {
      await this._runWorker();

      return true;
    } catch (e) {
      this._loggerService.error(e, {
        namespace: this._SERVICE_NAME,
        scope: "Core",
        tag: "Init",
        errorType: "FATAL",
      });
      return false;
    } finally {
      this._emitter.emit(`services:${this._SERVICE_NAME}:schemas-init`);
    }
  }

  private _setConfig(): void {
    this._config = {
      specificationEnable: this._discoveryService.getBoolean(
        "services.specification.enable",
        false
      ),
    };
  }

  public on(
    event: NSchemaService.Events,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.on(event, listener);
  }

  private get _schemaServices(): ServiceStructure[] {
    if (!SCHEMA_SERVICES || SCHEMA_SERVICES.length === 0) {
      throw new Error("Schema service array is empty");
    }

    return SCHEMA_SERVICES;
  }

  private async _runWorker(): Promise<void> {
    if (!this._config) {
      throw new Error("Config not set");
    }

    try {
      this._schemaLoader.init();
      this._schemaLoader.setBusinessLogic(this._schemaServices);

      this._schema = this._schemaLoader.services;

      this._typeormConnector.on("connector:TypeormConnector:start", () => {
        this._typeormConnector.emit(
          "connector:TypeormConnector:entities:load",
          this._schemaLoader.typeormSchemas
        );
      });
    } catch (e) {
      throw e;
    }
  }

  protected async destroy(): Promise<void> {
    this._config = undefined;
    this._specifications = undefined;

    this._schemaLoader.destroy();

    this._emitter.removeAllListeners();
  }

  private async _makeDocsDirectory(): Promise<void> {
    //   const docsDir = process.cwd() + "/documentations";
    //
    //   try {
    //     await fsp.stat(docsDir);
    //   } catch (e) {
    //     await fsp.mkdir(process.cwd() + "/documentations");
    //   }
    //   try {
    //     await fsp.stat(docsDir + "/docs");
    //   } catch (e) {
    //     await fsp.mkdir(docsDir + "/docs");
    //   }
    //
    //   let sidebarRow =
    //     "import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';\n\n";
    //   sidebarRow += "const sidebars: SidebarsConfig =";
    //   sidebarRow += JSON.stringify(
    //     this._docusaurusEngine.getSidebarConfig(),
    //     null,
    //     2
    //   );
    //
    //   let docusaurusConfig = "import type {Config} from '@docusaurus/types';\n\n";
    //   docusaurusConfig += "const config: Config =";
    //   docusaurusConfig += JSON.stringify(
    //     this._docusaurusEngine.getDocusaurusConfig(),
    //     null,
    //     2
    //   );
    //
    //   try {
    //     await fsp.writeFile(docsDir + "/sidebars.ts", sidebarRow);
    //     await fsp.writeFile(docsDir + "/docusaurus.config.ts", docusaurusConfig);
    //   } catch (e) {
    //     console.log(e);
    //   }
  }
}
