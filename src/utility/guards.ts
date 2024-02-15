import { ISchemaExceptionError, IValidatorError, NSessionService } from '@Core/Types';

export class Guards {
  public static isNotUndefined(x: undefined | any): boolean {
    return typeof x !== 'undefined';
  }

  public static isValidationError(x: IValidatorError | unknown): x is IValidatorError {
    return typeof x === 'object' && x !== null && 'errors' in x;
  }

  public static isSchemaExceptionError(
    x: ISchemaExceptionError | unknown
  ): x is ISchemaExceptionError {
    return typeof x === 'object' && x !== null && 'isNotResource' in x && 'statusCode' in x;
  }

  public static isString(x: string | unknown): x is string {
    return typeof x === 'string';
  }

  public static isSocketStructure(x: NSessionService.ClientData): x is NSessionService.ClientData {
    return typeof x === 'object' && x !== null && 'event' in x && 'payload' in x;
  }

  public static isSessionEvent(x: string): x is NSessionService.ClientEvent {
    const events: NSessionService.ClientEvent[] = [
      NSessionService.ClientEvent.HANDSHAKE,
      NSessionService.ClientEvent.AUTHENTICATE,
      NSessionService.ClientEvent.UPLOAD_PAGE,
      NSessionService.ClientEvent.SESSION_TO_SESSION,
      NSessionService.ClientEvent.BROADCAST_TO_SERVICE,
    ];
    return Object.values(events).includes(x as NSessionService.ClientEvent);
  }
}
