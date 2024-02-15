import { Packages } from "@Packages";
const { injectable } = Packages.inversify;

import {
  Nullable,
  Joi,
  IValidatorProvider,
  NValidatorProvider,
} from "@Core/Types";

@injectable()
export class ValidatorProvider implements IValidatorProvider {
  public get validator(): Joi.Root {
    return undefined as Joi.Root;
  }

  public validate<T>(
    map: Joi.ObjectSchema<T>,
    body: T
  ): Nullable<NValidatorProvider.ErrorResult[]> {
    const validateResult = map.validate(body);

    const errors: NValidatorProvider.ErrorResult[] = [];
    if (validateResult.error && validateResult.error.details) {
      // validateResult.error.details.forEach((value) => {
      //   errors.push({
      //     message: value.message,
      //     key: value.context?.key,
      //     value: value.context?.value,
      //   });
      // });
    }

    return errors.length > 0 ? errors : null;
  }
}
