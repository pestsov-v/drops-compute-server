import { Packages } from '@Packages';
const { injectable } = Packages.inversify;
const { EventEmitter } = Packages.events;

import { Events, IAbstractConnector, NAbstractConnector } from '@Core/Types';

@injectable()
export abstract class AbstractConnector implements IAbstractConnector {
  protected readonly _emitter: Events.EventEmitter = new EventEmitter();
  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  public once(event: NAbstractConnector.Event, listener: NAbstractConnector.Listener): void {
    this._emitter.once(event, listener);
  }

  public on(event: NAbstractConnector.Event, listener: NAbstractConnector.Listener): void {
    this._emitter.on(event, listener);
  }

  public off(event: NAbstractConnector.Event, listener: NAbstractConnector.Listener): void {
    this._emitter.off(event, listener);
  }

  public emit<T>(event: NAbstractConnector.Event, data?: NAbstractConnector.Data<T>): void {
    this._emitter.emit(event, data);
  }
}
