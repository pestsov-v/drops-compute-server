import { Packages } from "@Packages";
const { injectable } = Packages.inversify;
import { SchemaHeaders } from "@common";

import {
  UnknownObject,
  IContextService,
  IDiscoveryService,
  ILoggerService,
  IAbstractFrameworkAdapter,
  NAbstractHttpAdapter,
} from "@Core/Types";

@injectable()
export abstract class AbstractHttpAdapter<
  K extends NAbstractHttpAdapter.FrameworkKind
> implements IAbstractFrameworkAdapter
{
  protected abstract readonly _ADAPTER_NAME: string;
  protected abstract _instance: NAbstractHttpAdapter.Instance<K> | undefined;
  protected abstract _CONFIG: NAbstractHttpAdapter.Config | undefined;
  protected abstract _setConfig(): void;

  protected abstract _discoveryService: IDiscoveryService;
  protected abstract _loggerService: ILoggerService;
  protected abstract _contextService: IContextService;

  public abstract start(schemas: any): Promise<void>;
  public abstract stop(): Promise<void>;

  protected abstract _apiHandler(
    req: NAbstractHttpAdapter.Request<K>,
    context: NAbstractHttpAdapter.Context<UnknownObject>
  ): Promise<NAbstractHttpAdapter.Response<K>>;

  protected _resolveSchemaHeaders(
    headers: Record<string, string>
  ): NAbstractHttpAdapter.SchemaPayload {
    if (!headers[SchemaHeaders.X_SERVICE_NAME]) {
      return {
        ok: false,
        message: '"x-service-name" header not found',
      };
    }
    if (!headers[SchemaHeaders.X_DOMAIN_NAME]) {
      return {
        ok: false,
        message: '"x-domain-name" header not found',
      };
    }
    if (!headers[SchemaHeaders.X_ACTION_NAME]) {
      return {
        ok: false,
        message: '"x-action-name" header not found',
      };
    }

    return {
      ok: true,
      service: headers[SchemaHeaders.X_SERVICE_NAME],
      domain: headers[SchemaHeaders.X_DOMAIN_NAME],
      action: headers[SchemaHeaders.X_ACTION_NAME],
    };
  }
}
