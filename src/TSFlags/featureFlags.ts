type TSFeatureFlagsProps = {
  enableMonkeyPatch?: boolean;
  enableStackTraceInErrorLogs?: boolean;
  enableGlobalErrorTracing?: boolean;
};

export class TSFeatureFlags {
  private readonly _enableMonkeyPatch: boolean;

  private readonly _enableStackTraceInErrorLogs: boolean;

  private readonly _enableGlobalErrorTracing: boolean;

  constructor(props?: TSFeatureFlagsProps) {
    this._enableMonkeyPatch = !!props?.enableMonkeyPatch;
    this._enableStackTraceInErrorLogs = !!props?.enableStackTraceInErrorLogs;
    this._enableGlobalErrorTracing = !!props?.enableGlobalErrorTracing;
  }

  get enableMonkeyPatch(): boolean {
    return this._enableMonkeyPatch;
  }

  get enableStackTraceInErrorLogs(): boolean {
    return this._enableStackTraceInErrorLogs;
  }

  get enableGlobalErrorTracing(): boolean {
    return this._enableGlobalErrorTracing;
  }
}
