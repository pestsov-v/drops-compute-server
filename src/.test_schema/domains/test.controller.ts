import { setController } from '@Vendor';
import { NTest } from './test';
import {
  Agents,
  Context,
  NValidatorBaseOperation,
  SchemaRequest,
  SchemaResponse,
} from '@Core/Types';

export const testController = setController({
  sendTest: async (
    request: SchemaRequest,
    agents: Agents,
    context: Context
  ): Promise<any> => {
    const { baseAgent } = agents;

    try {
      // await agents.schemaAgent
      //   .getValidator<NTest.EntityValidator>('in')
      //   .sendTest()
      //   .validate(request.body, { abortEarly: false });
    } catch (e) {
    }

    return {
      format: 'json',
      type: 'OK',
      data: {
        sass: 'assa',
      },
    };
  },
});
