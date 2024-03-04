import { setTypeormSchema } from "@Vendor";
import { Typeorm } from "@Core/Types";

export const TestTypeormSchema = setTypeormSchema({
  model: "TEST_DOMAIN",
  getSchema: (
    agent
  ): Typeorm.EntitySchemaOptions<{ firstName: string; id: string }> => {
    return {
      name: "TEST_DOMAIN",
      columns: {
        id: {
          primary: true,
          type: "varchar",
          generated: "uuid",
        },
        firstName: {
          type: "varchar",
          comment: "Імʼя користувача",
        },
      },
    };
  },
});
