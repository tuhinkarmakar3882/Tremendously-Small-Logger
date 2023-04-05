export class TSOriginalConsoleClass {
  private readonly _logMethod: (...args: any[]) => void
  private readonly _infoMethod: (...args: any[]) => void
  private readonly _errorMethod: (...args: any[]) => void
  private readonly _debugMethod: (...args: any[]) => void
  private readonly _warnMethod: (...args: any[]) => void
  private readonly _traceMethod: (...args: any[]) => void

  constructor(consoleInstance: Console) {
    this._logMethod = consoleInstance.log
    this._infoMethod = consoleInstance.info
    this._errorMethod = consoleInstance.error
    this._debugMethod = consoleInstance.debug
    this._warnMethod = consoleInstance.warn
    this._traceMethod = consoleInstance.trace
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
