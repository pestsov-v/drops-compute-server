import { setValidator } from '@Vendor';
import { NTest } from './test';
import { yup } from '@Packages';

export const testValidator = setValidator<NTest.Validator>({
  sendTest: {
    in: () => {
      return {
        lastName: yup.string().required(),
        firstName: yup.string().required(),
      };
    },
  },
});
