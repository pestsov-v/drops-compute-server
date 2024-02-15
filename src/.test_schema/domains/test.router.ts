import { setRouter } from "@Vendor";
import { NTest } from "./test";

export const testRouter = setRouter<NTest.Paths, NTest.Controller>({
  "v1/test": {
    POST: {
      handler: "sendTest",
      isPrivateUser: false,
    },
  },
});
