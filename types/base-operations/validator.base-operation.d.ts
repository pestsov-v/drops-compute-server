import { Nullable, UnknownObject } from '../utility';
import { Joi } from '../packages/packages';
import { IValidatorError } from '../providers';

export interface IValidatorBaseOperation {
  validateOrThrow<T extends UnknownObject = UnknownObject>(
    map: Joi.ObjectSchema<T>,
    body: T
  ): Nullable<IValidatorError>;
}

export namespace NValidatorBaseOperation {}
