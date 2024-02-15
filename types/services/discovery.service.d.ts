import { IAbstractService, NAbstractService } from "./abstract.service";
import type { AnyObject } from "../utility";

export interface IDiscoveryService extends IAbstractService {
  readonly serverTag: string;

  on(event: NDiscoveryService.Event, listener: NAbstractService.Listener): void;
  reloadConfigurations(): Promise<void>;

  getMandatory<T>(name: name): T;
  getString(name: string, def: string): string;
  getNumber(name: string, def: number): number;
  getBoolean(name: string, def: boolean): boolean;
  getArray<T>(name: string, def: Array<T>): Array<T>;
  getCertificateBuffer(path: string): Promise<Buffer>;
  getCertificateString(path: string): Promise<string>;

  getSchemaMandatory<T, C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyConfigLiteralBuilder<C, T>
  ): T;
  getSchemaString<C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyConfigLiteralBuilder<C, string>,
    def: string
  ): string;
  getSchemaNumber<C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyConfigLiteralBuilder<C, number>,
    def: number
  ): number;
  getSchemaBoolean<C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyConfigLiteralBuilder<C, boolean>,
    def: boolean
  ): boolean;
  getSchemaArray<T, C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyConfigLiteralBuilder<C, Array<T>>,
    def: Array<T>
  ): Array<T>;
  getSchemaBuffer(
    path: NDiscoveryService.KeyConfigLiteralBuilder<C, string>
  ): Promise<Buffer>;
}

export namespace NDiscoveryService {
  export type Event =
    | "service:DiscoveryService:start"
    | "service:DiscoveryService:reload";

  export type KeyConfigLiteralBuilder<
    T,
    F extends string | boolean | number
  > = T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K] extends F
          ? `${string & K}`
          : K extends string
          ? `${string & K}.${KeyConfigLiteralBuilder<T[K], F>}`
          : never;
      }[keyof T]
    : string;
}
