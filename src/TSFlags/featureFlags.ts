type PartialMonkeyPatchConfig = {
  log?: boolean;
  info?: boolean;
  error?: boolean;
  debug?: boolean;
  warning?: boolean;
  trace?: boolean;
};

type TSFeatureFlagsProps = {
  enableGlobalMonkeyPatching?: boolean;
  enableStackTraceInErrorLogs?: boolean;
  enableGlobalErrorTracing?: boolean;
  partialMonkeyPatchConfig?: PartialMonkeyPatchConfig
};

export class TSFeatureFlags {
  private readonly _enableGlobalMonkeyPatching: boolean;

  private readonly _enableStackTraceInErrorLogs: boolean;

  private readonly _enableGlobalErrorTracing: boolean;

  private readonly _partialMonkeyPatchConfig: PartialMonkeyPatchConfig;

  constructor(props?: TSFeatureFlagsProps) {
    this._enableGlobalMonkeyPatching = !!props?.enableGlobalMonkeyPatching;
    this._enableStackTraceInErrorLogs = !!props?.enableStackTraceInErrorLogs;
    this._enableGlobalErrorTracing = !!props?.enableGlobalErrorTracing;
    this._partialMonkeyPatchConfig = {
      log: props?.partialMonkeyPatchConfig?.log ,
      info: props?.partialMonkeyPatchConfig?.info ,
      error: props?.partialMonkeyPatchConfig?.error ,
      debug: props?.partialMonkeyPatchConfig?.debug ,
      warning: props?.partialMonkeyPatchConfig?.warning ,
      trace: props?.partialMonkeyPatchConfig?.trace ,
    };
  }

  get enableGlobalMonkeyPatching(): boolean {
    return this._enableGlobalMonkeyPatching;
  }

  get enableStackTraceInErrorLogs(): boolean {
    return this._enableStackTraceInErrorLogs;
  }

  get enableGlobalErrorTracing(): boolean {
    return this._enableGlobalErrorTracing;
  }

  get partialMonkeyPatchConfig(): PartialMonkeyPatchConfig {
    return this._partialMonkeyPatchConfig;
  }

  isMonkeyPatchingEnabled(): boolean {
    return this._enableGlobalMonkeyPatching || this._isPartialMonkeyPatchingEnabled();
  }

  private _isPartialMonkeyPatchingEnabled(): boolean {
    for (const key in this._partialMonkeyPatchConfig) {
      if (this._partialMonkeyPatchConfig[key]) {
        return true;
      }
    }
    return false;
  }
}
