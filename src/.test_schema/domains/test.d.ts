import { ControllerHandler, TypeormRepoHandlers, ValidateHandler, yup } from '@Core/Types';

export namespace NTest {
  export type Paths = 'v1/test';

  export type Entity = {
    firstName?: string;
    lastName: string;
  };
  export type Controller = {
    sendTest: ControllerHandler<Entity>;
  };

  export type Validator = {
    sendTest: {
      in: ValidateHandler<Entity>;
    };
  };

  export type EntityValidator = {
    sendTest(): yup.ObjectSchema;
  };
}
