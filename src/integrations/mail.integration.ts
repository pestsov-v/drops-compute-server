import { Packages } from '@Packages';
const { nodemailer } = Packages.nodemailer;
const { injectable, inject } = Packages.inversify;
import { CoreSymbols } from '@CoreSymbols';
import { AbstractIntegration } from './abstract.integration';

import {
  Nodemailer,
  IDiscoveryService,
  ILoggerService,
  IMailIntegration,
  NMailIntegration,
} from '@Core/Types';

@injectable()
export class MailIntegration extends AbstractIntegration implements IMailIntegration {
  protected readonly _INTEGRATION_NAME = MailIntegration.name;
  private _config: NMailIntegration.Config | undefined;
  private _transport: Nodemailer.Transporter | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();
  }

  private _setConfig(): void {
    this._config = {
      enable: this._discoveryService.getBoolean('integrations.mail.enable', false),
      host: this._discoveryService.getString('integrations.mail.host', ' '),
      port: this._discoveryService.getNumber('integrations.mail.port', 587),
      secure: this._discoveryService.getBoolean('integrations.mail.secure', false),
      auth: {
        user: this._discoveryService.getString('integrations.mail.secure.auth.user', ' '),
        pass: this._discoveryService.getString('integrations.mail.secure.auth.pass', ' '),
      },
      from: this._discoveryService.getString('integrations.mail.contact.from', ' '),
      withMessageId: this._discoveryService.getBoolean('integrations.mail.withMessageId', true),
    };
  }

  public async init(): Promise<boolean> {
    this._setConfig();
    if (!this._config) throw this._throwConfigError();

    if (!this._config.enable) return false;

    this._transport = this._createTransport();
    return true;
  }

  private _createTransport(): Nodemailer.Transporter {
    if (!this._config) throw this._throwConfigError();

    const options: Partial<NMailIntegration.Config> = {
      host: this._config.host,
      port: this._config.port,
      secure: this._config.secure,
    };

    if (this._config.secure) {
      options['auth'] = {
        user: this._config.auth.user,
        pass: this._config.auth.pass,
      };
    }

    if (this._config.from) {
      options['from'] = this._config.from;
    }

    return nodemailer.createTransport(options);
  }

  public async destroy(): Promise<void> {
    this._config = undefined;

    if (!this._transport) return;

    this._transport.close();
    this._transport = undefined;
  }

  public async sendMailWithDynamicSender(
    mail: NMailIntegration.DynamicMail,
    options?: NMailIntegration.mailOptions
  ): Promise<void> {
    try {
      await this._sendMail(mail);

      if (options && options.logInfo) {
        let msg = `successfully sent email from ${mail.to} to ${mail.to}.`;
        if (options.additionalMsg) {
          msg += options.additionalMsg;
        }
        this._loggerService.info(msg);
      }
    } catch (e) {
      throw e;
    }
  }

  public async sendMailWithStaticSender(
    mail: NMailIntegration.StaticMail,
    options?: NMailIntegration.mailOptions
  ): Promise<void> {
    if (!this._config) throw this._throwConfigError();

    try {
      await this._sendMail(mail);

      if (options && options.logInfo) {
        let msg = `successfully sent email from ${this._config.from} to ${mail.to}`;
        if (options.additionalMsg) {
          msg += options.additionalMsg;
        }

        this._loggerService.info(msg);
      }
    } catch (e) {
      throw e;
    }
  }

  private async _sendMail(
    mail: NMailIntegration.DynamicMail | NMailIntegration.StaticMail
  ): Promise<void> {
    if (!this._transport) {
      throw new Error('Mail transport not init');
    }

    try {
      await this._transport.sendMail(mail);
    } catch (e) {
      throw e;
    }
  }

  private _throwConfigError() {
    return new Error('Config not set');
  }
}
