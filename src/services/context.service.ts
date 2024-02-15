import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
const { AsyncLocalStorage } = Packages.async_hooks;
import { CoreSymbols } from '@CoreSymbols';
import { AbstractService } from './abstract.service';

import {
  AsyncHooks,
  IContextService,
  IDiscoveryService,
  ILoggerService,
  NContextService,
} from '@Core/Types';

@injectable()
export class ContextService extends AbstractService implements IContextService {
  protected readonly _SERVICE_NAME = ContextService.name;
  protected _STORAGE: AsyncHooks.AsyncLocalStorage<NContextService.Store> | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    this._STORAGE = new AsyncLocalStorage<NContextService.Store>();

    return true;
  }

  public get storage(): AsyncHooks.AsyncLocalStorage<NContextService.Store> {
    if (!this._STORAGE) {
      throw new Error('Storage not initialize');
    }
    return this._STORAGE;
  }

  public get store(): NContextService.Store {
    const store = this.storage.getStore();
    if (!store) {
      throw new Error('Async local store not found');
    }
    return store;
  }

  public exit(callback?: () => void): void {
    return this.storage.exit(() => {
      if (callback) callback();
    });
  }

  protected async destroy(): Promise<void> {
    if (this._STORAGE) {
      this._STORAGE.exit(() => {});
      this._STORAGE = undefined;
    }
  }
}
