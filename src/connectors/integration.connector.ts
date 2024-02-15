import { Packages } from '@Packages';
const { injectable, inject } = Packages.inversify;
import { AbstractConnector } from './abstract.connector';
import { CoreSymbols } from '@CoreSymbols';

import { IMailIntegration, IIntegrationConnector } from '@Core/Types';

@injectable()
export class IntegrationConnector extends AbstractConnector implements IIntegrationConnector {
  constructor(
    @inject(CoreSymbols.MailIntegration)
    private readonly _mailIntegration: IMailIntegration
  ) {
    super();
  }

  public async start(): Promise<void> {
    await this._mailIntegration.start();
  }

  public async stop(): Promise<void> {
    await this._mailIntegration.stop();
  }
}
