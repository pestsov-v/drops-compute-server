import { ISpecificationBaseOperation, IValidatorBaseOperation } from '../base-operations';

export interface IBaseOperationAgent {
  readonly validator: NBaseOperationAgent.Validator;
  readonly specification: NBaseOperationAgent.Specification;
}

export namespace NBaseOperationAgent {
  export type Validator = {
    validateOrThrow: IValidatorBaseOperation['validateOrThrow'];
  };

  export type Specification = {
    openapi: {
      readonly bearerAuth: ISpecificationBaseOperation['bearerAuth'];
      readonly validateResponse: ISpecificationBaseOperation['validateResponse'];
      getJsonObjectContent: ISpecificationBaseOperation['getJsonObjectContent'];
    };
  };
}
