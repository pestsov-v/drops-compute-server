import { Controller } from "@Core/Types";
import { setController } from "@Vendor";

export type SetContr = {
  create: Controller<
    { str: string },
    { par: string },
    { local: string },
    { query: boolean },
    { str: string },
    { bas: string }
  >;
};

export const testController = setController<SetContr>({
  create: async (request, agents) => {
    if (1 === 1) {
      request.body.str;
      request.headers.local;
      request.params.par;
      request.query.query;
    }

    return {
      format: "json",
      payload: {
        headers: {
          bas: "asas",
        },
        data: {
          str: 312,
        },
      },
    };
  },
});
