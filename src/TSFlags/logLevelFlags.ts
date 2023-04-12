type TSLogLevelFlagsProps = {
  allowDefaultLogging?: boolean;
  allowInfoLogging?: boolean;
  allowErrorLogging?: boolean;
  allowDebugLogging?: boolean;
  allowWarningLogging?: boolean;
};

export class TSLogLevelFlags {
  private readonly _allowDefaultLogging: boolean;

  private readonly _allowInfoLogging: boolean;

  private readonly _allowErrorLogging: boolean;

  private readonly _allowDebugLogging: boolean;

  private readonly _allowWarningLogging: boolean;

  constructor(props?: TSLogLevelFlagsProps) {
    this._allowDefaultLogging = !!props?.allowDefaultLogging;
    this._allowInfoLogging = !!props?.allowInfoLogging;
    this._allowErrorLogging = !!props?.allowErrorLogging;
    this._allowDebugLogging = !!props?.allowDebugLogging;
    this._allowWarningLogging = !!props?.allowWarningLogging;
  }

  get allowDefaultLogging(): boolean {
    return this._allowDefaultLogging;
  }

  get allowInfoLogging(): boolean {
    return this._allowInfoLogging;
  }

  get allowErrorLogging(): boolean {
    return this._allowErrorLogging;
  }

  get allowDebugLogging(): boolean {
    return this._allowDebugLogging;
  }

  get allowWarningLogging(): boolean {
    return this._allowWarningLogging;
  }
}
