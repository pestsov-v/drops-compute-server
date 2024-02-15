import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
import { container } from '../ioc/core.ioc';
import { CoreSymbols } from '@CoreSymbols';

import {
  Nullable, UnknownObject,
  Joi,
  IContextService,
  IExceptionProvider,
  IFunctionalityAgent,
  IValidatorBaseOperation,
  IValidatorError,
} from '@Core/Types';

@injectable()
export class ValidatorBaseOperation implements IValidatorBaseOperation {
  constructor(
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public validateOrThrow<T extends UnknownObject = UnknownObject>(
    map: Joi.ObjectSchema<T>,
    body: T
  ): Nullable<IValidatorError> {
    const errors = container
      .get<IFunctionalityAgent>(CoreSymbols.FunctionalityAgent)
      .validator.validate(map, body);

    if (!errors) return null;

    return errors.length > 0
      ? container.get<IExceptionProvider>(CoreSymbols.ExceptionProvider).throwValidation(errors)
      : null;
  }
}
