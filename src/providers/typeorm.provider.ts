import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
import { CoreSymbols } from '@CoreSymbols';

import { Typeorm, ITypeormConnector, ITypeormProvider } from '@Core/Types';

@injectable()
export class TypeormProvider implements ITypeormProvider {
  constructor(
    @inject(CoreSymbols.TypeormConnector)
    private readonly _typeormConnector: ITypeormConnector
  ) {}

  public getRepository<T>(name: string): Typeorm.Repository<T> {
    return this._typeormConnector.getRepository(name);
  }
}
