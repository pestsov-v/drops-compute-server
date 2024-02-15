import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
const { Validator } = Packages.openapi;
const { path } = Packages.path;
const { fsp } = Packages.fs;
import { CoreSymbols } from '@CoreSymbols';
import { AbstractService } from './abstract.service';

import {
  Openapi,
  IBaseOperationAgent,
  IDiscoveryService,
  IFunctionalityAgent,
  ILoggerService,
  ISchemaService,
  ISpecificationService,
  NSpecificationService,
} from '@Core/Types';
import { container } from '../ioc/core.ioc';
import { SchemaHeaders } from '@common';

@injectable()
export class SpecificationService extends AbstractService implements ISpecificationService {
  protected readonly _SERVICE_NAME = SpecificationService.name;
  private _CONFIG: NSpecificationService.Config | undefined;
  private _validator: Openapi.Validator | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SchemaService)
    private readonly _schemaService: ISchemaService
  ) {
    super();
  }

  private _setConfig() {
    this._CONFIG = {
      enable: this._discoveryService.getBoolean('services.specification.enable', false),
      liveReload: this._discoveryService.getBoolean('services.specification.liveReload', false),
      rootDir: this._discoveryService.getString('services.specification.rootDir', process.cwd()),
    };
  }

  private get _config(): NSpecificationService.Config {
    if (!this._CONFIG) {
      throw new Error('Config not set');
    }

    return this._CONFIG;
  }

  public async init(): Promise<boolean> {
    this._setConfig();

    if (!this._CONFIG) {
      throw new Error('Config nowt set');
    }

    if (!this._config.enable) return false;

    for (const [sName, sStorage] of this._schemaService.specifications) {
      if (!sStorage.summary || !sStorage.languages) {
        throw new Error(
          `Specification summary or languages array not set from "${sName}" service storage`
        );
      }

      for (const iLanguage in sStorage.languages) {
        for (const [dName, dStorage] of sStorage.domains) {
          const paths: Record<
            string,
            Partial<Record<Openapi.HttpMethods, Openapi.OperationObject>>
          > = {};
          if (dStorage.openapi.size > 0) {
            for (const [pName, fn] of dStorage.openapi) {
              paths['~~' + pName + '~~'] = {};

              const openApiPath = fn({
                functionalityAgent: container.get<IFunctionalityAgent>(
                  CoreSymbols.FunctionalityAgent
                ),
                baseAgent: container.get<IBaseOperationAgent>(CoreSymbols.BaseOperationAgent),
              });

              const schemaHeaders = [
                {
                  in: 'header',
                  description:
                    'Name of the service for the action of the domain to which the request is intended.',
                  name: SchemaHeaders.X_SERVICE_NAME,
                  schema: {
                    type: 'string',
                    example: sName,
                  },
                  required: true,
                },
                {
                  in: 'header',
                  description:
                    'The name of the domain that sends the action to which the request is made.',
                  name: SchemaHeaders.X_DOMAIN_NAME,
                  schema: {
                    type: 'string',
                    example: dName,
                  },
                  required: true,
                },
                {
                  in: 'header',
                  description: 'Action name',
                  name: SchemaHeaders.X_ACTION_NAME,
                  schema: {
                    type: 'string',
                    example: pName,
                  },
                  required: true,
                },
              ];

              openApiPath.forEach((openapi) => {
                for (const path in openapi) {
                  const p = path as Openapi.HttpMethods;
                  paths['~~' + pName + '~~'][p] = {
                    tags: openapi[p].tags ? [dName, openapi[p].tags] : [dName],
                    parameters: openapi[p].parameters
                      ? [schemaHeaders, openapi[p].parameters]
                      : schemaHeaders,
                    ...openapi[p],
                  };
                }
              });
            }
          }

          const ln = sStorage.languages[iLanguage];

          const document: Openapi.Document = {
            openapi: '3.0.0',
            info: {
              version: sStorage.summary.version,
              title: ln.title,
              description: ln.description,
              contact: sStorage.summary.contact,
              license: sStorage.summary.license,
            },
            servers: this._getServerInfo(),
            paths: paths,
          };

          this._validator = new Validator({ version: '' });
          const errors = this._validator.validate(document);
          await this._buildOpenApiSpecification(
            'SysAdmin',
            '1.0.2',
            'ru',
            JSON.stringify(document)
          );
        }
      }
    }

    return true;
  }

  private _getServerInfo(): Openapi.ServerObject[] {
    return [
      {
        url: 'http://localhost:11043',
        description: 'Http core compute server',
      },
    ];
  }

  private async _buildOpenApiSpecification(
    service: string,
    version: string,
    language: string,
    content: string
  ): Promise<void> {
    await this._buildSpecStructure(service, version, language, 'openApi', content);
    await this._buildSpecPage(service, version, language, 'openApi');
  }

  private async _buildSpecPage(
    service: string,
    version: string,
    language: string,
    type: NSpecificationService.SpecificationType
  ): Promise<void> {
    const templatePath = `${process.cwd()}/src/core/specification-ui/openApi/index.html`;
    const template = await fsp.readFile(templatePath, 'utf-8');

    const page = template
      .replace('__@service__', service)
      .replace('__@version__', version)
      .replace('__@language__', language);

    const { rootDir } = this._config;
    const filePath = `${rootDir}/specifications/services/${service}/${type}/v${version}/${language}/${type}.html`;
    await fsp.writeFile(filePath, page);
  }

  private async _buildSpecStructure(
    service: string,
    version: string,
    language: string,
    type: NSpecificationService.SpecificationType,
    content: string
  ): Promise<void> {
    const { rootDir } = this._config;
    const filePath = `${rootDir}/specifications/services/${service}/${type}/v${version}/${language}/${type}.json`;
    const checkedPaths = this._getChunkPaths(service, version, language, type);

    for (const checkPath in checkedPaths) {
      const fullPath = path.join(process.cwd(), checkedPaths[checkPath]);

      try {
        await fsp.mkdir(fullPath, { recursive: true });
      } catch {}
    }

    await fsp.writeFile(filePath, content);
  }

  private _getChunkPaths(
    service: string,
    version: string,
    language: string,
    specification: NSpecificationService.SpecificationType
  ): string[] {
    return [
      `specifications`,
      `specifications/services`,
      `specifications/services/${service}`,
      `specifications/services/${service}/${specification}`,
      `specifications/services/${service}/openApi/v${version}`,
      `specifications/services/${service}/openApi/v${version}/${language}`,
    ];
  }

  public async destroy(): Promise<void> {}
}
