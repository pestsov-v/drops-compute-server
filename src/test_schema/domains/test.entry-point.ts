import { setEntryPoint } from "@Vendor";
import { testRouter } from "./test.router";
import { TestDocsRu } from "./test.docs.ru";
import { TestTypeormSchema } from "./test.typeorm-schema";

export const TestEntryPoint = setEntryPoint(
  "test",
  {
    router: testRouter,
    typeormSchema: TestTypeormSchema,
  },
  [TestDocsRu]
);
