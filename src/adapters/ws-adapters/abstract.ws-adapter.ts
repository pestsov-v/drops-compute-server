import { Packages } from "@Packages";
const { injectable } = Packages.inversify;

import type {
  IAbstractWebsocketAdapter,
  IDiscoveryService,
  ILoggerService,
  NAbstractWebsocketAdapter,
} from "@Core/Types";

@injectable()
export abstract class AbstractWsAdapter<
  K extends NAbstractWebsocketAdapter.WebsocketKind
> implements IAbstractWebsocketAdapter
{
  protected abstract readonly _ADAPTER_NAME: string;
  protected abstract _config: NAbstractWebsocketAdapter.Config | undefined;
  protected abstract _instance:
    | NAbstractWebsocketAdapter.Instance<K>
    | undefined;
  protected abstract readonly _discoveryService: IDiscoveryService;
  protected abstract readonly _loggerService: ILoggerService;

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}
