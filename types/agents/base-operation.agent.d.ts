import {
  ISpecificationBaseOperation,
  IValidatorBaseOperation,
} from "../base-operations";

export interface IBaseOperationAgent {
  readonly specification: NBaseOperationAgent.Specification;
}

export namespace NBaseOperationAgent {
  export type Specification = {
    openapi: {
      readonly bearerAuth: ISpecificationBaseOperation["bearerAuth"];
      readonly validateResponse: ISpecificationBaseOperation["validateResponse"];
      getJsonObjectContent: ISpecificationBaseOperation["getJsonObjectContent"];
    };
  };
}
