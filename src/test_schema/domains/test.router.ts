import { setRouter } from "@Vendor";
import { NTest } from "./test";

export const testRouter = setRouter<NTest.Paths>({
  "v1/tes2t": {
    POST: {
      scope: "private:organization",
      handler: async (request, agents) => {},
    },
  },
});
