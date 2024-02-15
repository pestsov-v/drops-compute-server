import { Joi } from "../packages/packages";
import { AnyObject, Nullable } from "../utility";

export interface IValidatorProvider {
  readonly validator: Joi.Root;
  validate<T>(
    map: Joi.ObjectSchema<T>,
    body: T
  ): Nullable<NValidatorProvider.ErrorResult[]>;
}

export namespace NValidatorProvider {
  export type ErrorResult = {
    message: string;
    key?: string;
    value?: string;
  };

  export type DocumentHandler = <T>(
    validator: IValidatorProvider,
    map: Joi.ObjectSchema<T>,
    body: T
  ) => Nullable<NValidatorProvider.ErrorResult[]>;

  export type ValidateHandler<T = AnyObject> = (
    body: T
  ) => Nullable<NValidatorProvider.ErrorResult[]>;

  export type Handlers<T> = {
    [key in keyof T]: T[key];
  };
}
