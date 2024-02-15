import {setTypeormSchema} from "@Vendor";
import { Typeorm} from "@Core/Types";

export const TestTypeormSchema = setTypeormSchema({
    model: 'TEST_DOMAIN',
    getSchema: (agent): Typeorm.EntitySchemaOptions<{firstName: string}> => {
        return {
            name: 'TEST_DOMAIN',
            columns: {
                    firstName: {
                        type: 'string',
                        comment: 'Імʼя користувача'

                    },
            },
            relations: {
                firstName: {
                    type: 'many-to-many',
                    target: '',
                }
            }

        }
    }
})