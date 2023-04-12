export class TSOriginalConsoleClass {
  private readonly _logMethod: (...args: Array<unknown>) => void;

  private readonly _infoMethod: (...args: Array<unknown>) => void;

  private readonly _errorMethod: (...args: Array<unknown>) => void;

  private readonly _debugMethod: (...args: Array<unknown>) => void;

  private readonly _warnMethod: (...args: Array<unknown>) => void;

  private readonly _traceMethod: (...args: Array<unknown>) => void;

  constructor(consoleInstance: Console) {
    this._logMethod = consoleInstance.log;
    this._infoMethod = consoleInstance.info;
    this._errorMethod = consoleInstance.error;
    this._debugMethod = consoleInstance.debug;
    this._warnMethod = consoleInstance.warn;
    this._traceMethod = consoleInstance.trace;
  }

  get logMethod() {
    return this._logMethod;
  }

  get infoMethod() {
    return this._infoMethod;
  }

  get errorMethod() {
    return this._errorMethod;
  }

  get debugMethod() {
    return this._debugMethod;
  }

  get warnMethod() {
    return this._warnMethod;
  }

  get traceMethod() {
    return this._traceMethod;
  }
}
