import { Packages } from '@Packages';
const { injectable } = Packages.inversify;
import { IAbstractFactory } from '@Core/Types';

@injectable()
export abstract class AbstractFactory implements IAbstractFactory {
  public abstract run<T>(args: T): Promise<void>;
  public abstract stand(): Promise<void>;
}
