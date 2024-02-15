import {
  Packages,
  AbstractDiscoveryService,
  IAbstractDiscoveryService,
} from "@Packages";
const { injectable } = Packages.inversify;

import { AbstractService } from "./abstract.service";

import type {
  AnyObject,
  IDiscoveryService,
  NAbstractService,
  NDiscoveryService,
} from "@Core/Types";

@injectable()
export class DiscoveryService
  extends AbstractService
  implements IDiscoveryService
{
  protected readonly _SERVICE_NAME = DiscoveryService.name;
  protected _serverTag: string | undefined;
  private _abstractDiscoveryService: IAbstractDiscoveryService | undefined;

  protected readonly _discoveryService = this;
  protected readonly _loggerService = undefined;

  protected async init(): Promise<boolean> {
    this._abstractDiscoveryService = new AbstractDiscoveryService();
    this._abstractDiscoveryService.setConfigSlice("server");

    try {
      await this._abstractDiscoveryService.init();
      this._emitter.emit(`service:${this._SERVICE_NAME}:start`);

      return true;
    } catch (e) {
      throw e;
    }
  }

  private get _absDiscoveryService(): IAbstractDiscoveryService {
    if (!this._abstractDiscoveryService) {
      throw new Error("Abstract discovery service not initialize.");
    }

    return this._abstractDiscoveryService;
  }

  public get serverTag(): string {
    return this._absDiscoveryService.serverTag;
  }

  public async reloadConfigurations(): Promise<void> {
    this._emitter.emit(`service:${this._SERVICE_NAME}:reload`);
  }

  public on(
    event: NDiscoveryService.Event,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.on(event, listener);
  }

  public async destroy(): Promise<void> {
    this._abstractDiscoveryService = undefined;
    this._serverTag = undefined;
  }

  public getMandatory<T>(name: string): T {
    return this._absDiscoveryService.getMandatory(name);
  }

  public getString<C extends AnyObject>(name: string, def: string): string {
    return this._absDiscoveryService.getString(name, def);
  }

  public getNumber(name: string, def: number): number {
    return this._absDiscoveryService.getNumber(name, def);
  }

  public getBoolean(name: string, def: boolean): boolean {
    return this._absDiscoveryService.getBoolean(name, def);
  }

  public getArray<T>(name: string, def: Array<T>): Array<T> {
    return this._absDiscoveryService.getArray(name, def);
  }

  public async getCertificateBuffer(path: string): Promise<Buffer> {
    try {
      return await this._absDiscoveryService.getCertificateBuffer(path);
    } catch (e) {
      throw e;
    }
  }

  public async getCertificateString(path: string): Promise<string> {
    try {
      return await this._absDiscoveryService.getCertificateString(path);
    } catch (e) {
      throw e;
    }
  }

  public getSchemaMandatory<T>(name: string): T {
    return this._absDiscoveryService.getMandatory<T>(`schema.${name}`);
  }

  public getSchemaString(name: string, def: string): string {
    return this._absDiscoveryService.getString(`schema.${name}`, def);
  }

  public getSchemaNumber(name: string, def: number): number {
    return this._absDiscoveryService.getNumber(`schema.${name}`, def);
  }

  public getSchemaBoolean(name: string, def: boolean): boolean {
    return this._absDiscoveryService.getBoolean(`schema.${name}`, def);
  }

  public getSchemaArray<T>(name: string, def: Array<T>): Array<T> {
    return this._absDiscoveryService.getArray<T>(`schema.${name}`, def);
  }

  public async getSchemaBuffer(path: string): Promise<Buffer> {
    return this._absDiscoveryService.getCertificateBuffer(`schema.${path}`);
  }
}
